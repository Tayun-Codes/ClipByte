const path = require('path');
const { transcribe } = require('@remotion/install-whisper-cpp');
const aws = require("aws-sdk");
const fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
// const Transcription = require("../models/Transcription"); //for saving to mongodb but untested & not in use


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

let transcriptionProgress = 0;

module.exports = {
    getProgress: (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send initial progress (0%)
        res.write(`data: ${JSON.stringify({ progress: transcriptionProgress })}\n\n`);

        // Update the client every second with the current progress
        const intervalId = setInterval(() => {
            res.write(`data: ${JSON.stringify({ progress: transcriptionProgress })}\n\n`);
        }, 1000);

        // Cleanup when the client disconnects
        req.on('close', () => {
            clearInterval(intervalId);
        });
    },

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
            const localFilePath = `./transcribeFiles/${Key}`
            await downloadFileFromS3(Key, localFilePath);

            //converts mp4 to wav locally
            const windowsLocalFile = `.\\transcribeFiles\\${Key}`
            //             ffmpeg(windowsLocalFile)
            //                 .audioCodec('pcm_s16le')    // Use the WAV codec
            //                 .audioFrequency(16000)      // Set the sample rate to 16kHz
            //                 .on('start', (commandLine) => {
            //                     console.log('FFmpeg process started with command:', commandLine);
            //                     // transcriptionProgress = 10
            //                 })
            //                 .on('progress', (progress) => {
            //                     console.log(`Processing: ${progress.percent}% done`);
            //                     transcriptionProgress = Math.min(progress.percent || 0, 100);
            //                 })
            //                 .on('end', async () => {
            //                     console.log('ffmpeg done')
            //                     transcriptionProgress = 90
            //                     const { transcription } = await transcribe({
            //                         inputPath: path.resolve(__dirname, `.${localFilePath}-audio.wav`),
            //                         //gets the url but fetches it with the credentials
            //                         whisperPath: path.resolve(__dirname, '../remotion/whisper.cpp'),
            //                         model: 'medium.en', //what is this?
            //                     });
            //                     transcriptionProgress = 100;
            //                     //save transctiption as a local json
            //                     const jsonFilePath = `./transcribeFiles/${Key}.json`;
            //                     fs.writeFileSync(jsonFilePath, JSON.stringify({ transcription }, null, 2), 'utf-8'); //null = no modifications, 2 = 2 spaces for easier readibility
            //                     console.log(`Transcription saved to ${jsonFilePath}`);

            //                     //save transcription to mongodb in theory... untested
            //                     // const savedTranscription = await Transcription.create({ key: Key, transcription: transcription });
            //                     // console.log('Transcription saved to MongoDB:', savedTranscription);


            //                     res.status(200).json({ transcription }); //the transcription needs to go to OpenAI
            //                     console.log('Conversion completed!');
            //                 })
            //                 .on('error', (err) => {
            //                     console.error('An error occurred:', err.message);
            //                 })
            //                 .save(`${windowsLocalFile}-audio.wav`); // Save the output file (not in order)

            //         } catch (err) {
            //             console.error('Error transcribing file:', err);
            //             res.status(500).json({ error: 'Failed to transcribe file' });
            //         }
            //     },
            // };
            const transcriptionFilePath = `${windowsLocalFile}-audio.wav`;

            // Start FFmpeg conversion
            await runFFmpegConversion(windowsLocalFile, transcriptionFilePath);

            // Now perform transcription
            await startTranscription(`.${transcriptionFilePath}`, Key, res);

        } catch (error) {
            console.error('Error during transcription:', error);
            res.status(500).json({ error: 'Failed to transcribe file' });
        }
    },
};

// Method to run FFmpeg conversion (async)
async function runFFmpegConversion(inputFilePath, outputFilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .audioCodec('pcm_s16le') // Use WAV codec
            .audioFrequency(16000)  // Set the sample rate to 16kHz
            .on('start', (commandLine) => {
                console.log('FFmpeg process started with command:', commandLine);
                transcriptionProgress = 10; // Set progress to 10% at start
            })
            .on('progress', (progress) => {
                console.log(`FFmpeg Progress: ${progress.percent}%`);
                transcriptionProgress = Math.min(progress.percent || 0, 90); // Set progress based on FFmpeg
            })
            .on('end', () => {
                console.log('FFmpeg conversion finished');
                resolve(); // Resolve the promise once FFmpeg finishes
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(err); // Reject the promise if there's an error
            })
            .save(outputFilePath); // Save the output
    });
}

// Method to start transcription (async)
async function startTranscription(filePath, Key, res) {
    try {
        transcriptionProgress = 90; // Update to 90% after FFmpeg finishes

        console.log('Starting transcription...');
        const transcription = await transcribe({
            inputPath: path.resolve(__dirname, filePath),
            whisperPath: path.resolve(__dirname, '../remotion/whisper.cpp'),
            model: 'medium.en',
        });

        transcriptionProgress = 100; // Final progress at 100%
        console.log('Transcription complete!');

        // Save the transcription result
        const jsonFilePath = `./transcribeFiles/${Key}.json`;
        fs.writeFileSync(jsonFilePath, JSON.stringify({ transcription }, null, 2), 'utf-8');

        // Send the transcription result back to the client
        res.status(200).json({ transcription });
    } catch (error) {
        console.error('Error during transcription:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
}

// Utility function to download a file from S3
// async function downloadFileFromS3(Key, localFilePath) {
//     const s3Object = await s3.getObject({
//         Bucket: 'your-bucket-name',
//         Key,
//     }).promise();
//     fs.writeFileSync(localFilePath, s3Object.Body);
// }


// //function to download S3 files
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





//hardcoding to see if transcription works
// function transcribeFile() {
//     console.log('transcribeFile running')
//     const windowsLocalFile = `.\\transcribeFiles\\test.mp4` //spaces are fine in the file name
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
//                 // inputPath: `E:\\Resilient_Coders\\Homework\\Github\\ClipByte\\transcribeFiles\\test.mp4-audio.wav`, //only absolute paths are working?
//                 inputPath: path.resolve(__dirname, '..\\transcribeFiles\\test.mp4-audio.wav'),
//                 // whisperPath: 'E:\\Resilient_Coders\\Homework\\Github\\ClipByte\\remotion\\whisper.cpp',
//                 whisperPath: path.resolve(__dirname, '..\\remotion\\whisper.cpp'),
//                 model: 'medium.en'
//             });
//             console.log('200', transcription)
//             console.log('Conversion completed!');
//         })
//         .on('error', (err) => {
//             console.error('An error occurred:', err.message);
//         })
//         .save(`${windowsLocalFile}-audio.wav`); // Save the output file (not in order)
// };
//runs the function on server load
// transcribeFile()