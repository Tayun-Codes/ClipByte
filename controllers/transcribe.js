const path = require('path');
const { transcribe } = require('@remotion/install-whisper-cpp');
const aws = require("aws-sdk");
const fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
const openAiController = require('../controllers/openai');
const videoController = require('./videoController');
const User = require('../models/User')

//s3 session -> allows the browser to access this s3 bucket
const s3 = new aws.S3();
aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
});

//bringing in the keys to access S3 in s3upload (nested within transcribeFiles)
const keys = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    bucketName: process.env.BUCKETNAME
};

//https://www.remotion.dev/docs/install-whisper-cpp/transcribe
module.exports = {
    //Process: fetch aws file -> local -> convert to wav -> remotion transcription
    transcribeFile: async (req, res) => {

        console.log('transcribeFile running')
        //sent from upload.ejs, Key is the filePath in s3
        const { Key } = req.body;

        if (!Key) {
            return res.status(400).json({ error: 'Key is required' });
        }

        console.log('Key Received:', Key);
        try {
            //Ensure aws can be accessed
            console.log('accessing aws in transcribeFile, try')
            await s3.headObject({ Bucket: keys.bucketName, Key: Key }).promise();

            console.log('aws successfully accessed within transcribeFile')

            //Downloads file locally to convert to wav (because remotion only uses local paths)
            const localFilePath = `./public/transcribeFiles/${Key}`
            await downloadFileFromS3(Key, localFilePath);

            //converts mp4 to wav locally
            const windowsLocalFile = `.\\public\\transcribeFiles\\${Key}`
            ffmpeg(windowsLocalFile)
                .audioCodec('pcm_s16le')    // Use the WAV codec
                .audioFrequency(16000)      // Set the sample rate to 16kHz
                .on('start', (commandLine) => {
                    console.log('FFmpeg process started with command:', commandLine);
                })
                .on('progress', (progress) => {
                    console.log(`Processing: ${progress.percent}% done`);
                })
                .on('end', async () => {
                    const { transcription } = await transcribe({
                        inputPath: path.resolve(__dirname, `.${localFilePath}-audio.wav`),
                        //gets the url but fetches it with the credentials
                        whisperPath: path.resolve(__dirname, '../remotion/whisper.cpp'),
                        model: 'large-v3', //tiny, tiny.en, base, base.en, small, small.en, medium, medium.en, large-v1, large-v2, large-v3, large-v3-turbo
                    });

                    let filteredTranscription = transcription.map(entry => {
                        const { tokens, offsets, ...rest } = entry; // Destructure to exclude the tokens field
                        return rest; // Return the modified object
                    });

                    filteredTranscription = filteredTranscription.map(item => ({
                        ...item,
                        timestamps: {
                            from: item.timestamps.from.replace(/,.*$/, ''),
                            to: item.timestamps.to.replace(/,.*$/, '')
                        }
                    }));// Removes the ",###" portion of the timestamp

                    //save transctiption as a local json
                    const jsonFilePath = `./public/transcribeFiles/${Key}.json`;


                    fs.writeFileSync(jsonFilePath, JSON.stringify({ filteredTranscription }, null, 2), 'utf-8'); //null = no modifications, 2 = 2 spaces for easier readibility
                    console.log(`Transcription saved to ${jsonFilePath}`);

                    console.log(req.body, 'REQ BODY')
                    req.session.Key = req.body.Key

                    console.log('Conversion & transcription completed!');

                    // videoController.processVideo(Key, req, res);
                    res.redirect('/process')
                    console.log('openAIcontroller called');

                    //need to call openai and send the key
                })
                .on('error', (err) => {
                    console.error('An error occurred:', err.message);
                })
                .save(`${windowsLocalFile}-audio.wav`); // Save the output file (not in order)

        } catch (err) {
            console.error('Error transcribing file:', err);
            res.status(500).json({ error: 'Failed to transcribe file' });
        }
    },
};

//function to download S3 files
async function downloadFileFromS3(filePath, localFilePath) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.BUCKETNAME,
            Key: filePath,
        };

        const fileStream = fs.createWriteStream(localFilePath);

        const s3Stream = s3.getObject(params).createReadStream();

        // Pipe S3 stream to the file stream
        s3Stream
            .pipe(fileStream)
            .on('close', () => {
                console.log(`File downloaded successfully to ${localFilePath}`);
                resolve(); // Resolve the promise on successful download
            })
            .on('error', (err) => {
                console.error('Error writing to local file:', err.message);
                reject(err); // Reject the promise if an error occurs while writing
            });

        // Handle errors from S3 stream
        s3Stream.on('error', (err) => {
            console.error('Error reading from S3:', err.message);
            reject(err); // Reject the promise if an error occurs while reading
        });
    });
}


//hardcoding for only transcription from a local file
// function transcribeFile() {
//     console.log('transcribeFile running')
//     const windowsLocalFile = `.\\transcribeFiles\\The Archives Ep. Thanksgiving 2024 (video).mp4` //spaces are fine in the file name
//     ffmpeg(windowsLocalFile)
//         .audioCodec('pcm_s16le')    // Use the WAV codec
//         .audioFrequency(16000)      // Set the sample rate to 16kHz
//         .on('start', (commandLine) => {
//             console.log('FFmpeg process started with command:', commandLine);
//         })
//         .on('progress', (progress) => {
//             console.log(`Processing: ${progress.percent}% done`);
//         })
//         .on('end', async () => {
//             const { transcription } = await transcribe({
//                 // inputPath: `E:\\Resilient_Coders\\Homework\\Github\\ClipByte\\transcribeFiles\\The Archives Ep. Thanksgiving 2024 (video).mp4-audio.wav`, //only absolute paths are working?
//                 inputPath: path.resolve(__dirname, '..\\transcribeFiles\\The Archives Ep. Thanksgiving 2024 (video).mp4-audio.wav'),
//                 // whisperPath: 'E:\\Resilient_Coders\\Homework\\Github\\ClipByte\\remotion\\whisper.cpp',
//                 whisperPath: path.resolve(__dirname, '..\\remotion\\whisper.cpp'),
//                 model: 'large-v2'
//             });

//             const filteredTranscription = transcription.map(entry => {
//                 const { tokens, offsets, ...rest } = entry; // Destructure to exclude the tokens field
//                 return rest; // Return the modified object
//             });

//             //save transctiption as a local json
//             const jsonFilePath = `./transcribeFiles/The Archives Ep. Thanksgiving 2024 (video).mp4 filtered NO OFFSETS.json`;


//             fs.writeFileSync(jsonFilePath, JSON.stringify({ filteredTranscription }, null, 2), 'utf-8'); //null = no modifications, 2 = 2 spaces for easier readibility
//             console.log(`Transcription saved to ${jsonFilePath}`);

//             //save transcription to mongodb?... untested
//             // const savedTranscription = await Transcription.create({ key: Key, transcription: transcription });
//             // console.log('Transcription saved to MongoDB:', savedTranscription);

//             res.status(200).json({ filteredTranscription });
//             console.log('Conversion & transcription completed!');

//             videoController.processVideo(Key);
//             console.log('openAIcontroller called');
//         })
//         .on('error', (err) => {
//             console.error('An error occurred:', err.message);
//         })
//         .save(`${windowsLocalFile}-audio.wav`); // Save the output file (not in order)
// };


//hardcoding function call for file in aws
// async function transcribeFile(req, res) {
//     console.log('transcribeFile running')
//     //sent from upload.ejs, Key is the filePath in s3
//     let Key = 'The Archives Ep. Thanksgiving 2024 (video).mp4';

//     if (!Key) {
//         return res.status(400).json({ error: 'Key is required' });
//     }

//     console.log('Key Received:', Key);
//     try {
//         //Ensure aws can be accessed
//         console.log('Accessing aws in transcribeFile')
//         await s3.headObject({ Bucket: keys.bucketName, Key: Key }).promise();

//         console.log('aws successfully accessed within transcribeFile')

//         //Downloads file locally to convert to wav (because remotion only uses local paths)
//         const localFilePath = `./public/transcribeFiles/${Key}`
//         console.log(localFilePath)

//         await downloadFileFromS3(Key, localFilePath);

//         //converts mp4 to wav locally
//         const windowsLocalFile = `.\\public\\transcribeFiles\\${Key}`
//         ffmpeg(windowsLocalFile)
//             .audioCodec('pcm_s16le')    // Use the WAV codec
//             .audioFrequency(16000)      // Set the sample rate to 16kHz
//             .on('start', (commandLine) => {
//                 console.log('FFmpeg process started with command:', commandLine);
//             })
//             .on('progress', (progress) => {
//                 console.log(`Processing: ${progress.percent}% done`);
//             })
//             .on('end', async () => {
//                 const { transcription } = await transcribe({
//                     inputPath: path.resolve(__dirname, `.${localFilePath}-audio.wav`),
//                     //gets the url but fetches it with the credentials
//                     whisperPath: path.resolve(__dirname, '../remotion/whisper.cpp'),
//                     model: 'large-v3', //tiny, tiny.en, base, base.en, small, small.en, medium, medium.en, large-v1, large-v2, large-v3, large-v3-turbo
//                 });

//                 let filteredTranscription = transcription.map(entry => {
//                     const { tokens, offsets, ...rest } = entry; // Destructure to exclude the tokens field
//                     return rest; // Return the modified object
//                 });

//                 filteredTranscription = filteredTranscription.map(item => ({
//                     ...item,
//                     timestamps: {
//                         from: item.timestamps.from.replace(/,.*$/, ''),
//                         to: item.timestamps.to.replace(/,.*$/, '')
//                     }
//                 }));// Removes the ",###" portion of the timestamp

//                 //save transctiption as a local json
//                 const jsonFilePath = `./public/transcribeFiles/${Key}.json`;


//                 fs.writeFileSync(jsonFilePath, JSON.stringify({ filteredTranscription }, null, 2), 'utf-8'); //null = no modifications, 2 = 2 spaces for easier readibility
//                 console.log(`Transcription saved to ${jsonFilePath}`);

//                 console.log(req.body, 'REQ BODY')
//                 req.session.Key = req.body.Key

//                 console.log('Conversion & transcription completed!');

//                 // videoController.processVideo(Key, req, res);
//                 res.redirect('/process')
//                 console.log('openAIcontroller called');

//                 //need to call openai and send the key
//             })
//             .on('error', (err) => {
//                 console.error('An error occurred:', err.message);
//             })
//             .save(`${windowsLocalFile}-audio.wav`); // Save the output file (not in order)

//     } catch (err) {
//         console.error('Error transcribing file:', err);
//         res.status(500).json({ error: 'Failed to transcribe file' });
//     }
// };


// runs the function on server load; used for testing functions
// transcribeFile()