const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require("dotenv").config({ path: "./config/.env" });

//hardcoding -> Key will come from the end of transcribeFile from controllers/transcribe.js
const Key = 'The Archives Ep. Thanksgiving 2024 (video).mp4 large' //first half'

// Set up the OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
});


// Define the prompt to send to OpenAI
const prompt = `From this file, identify standalone engaging segments throughout the entire video that are at least 30 seconds long, up to 60 seconds. These segments should be cohesive and meaningful, with a clear story, message, or entertaining content that can hold the audience's attention as standalone Instagram Reels. Export the results in this JSON format:

const timestamps = [
  { start: <start-time>, end: <end-time>, why: <reason-for-selection> },
];`;

//testing to make sure the paths are correct to get the transcribefolder and the file path (it seems a little redundant tbh)
// function analyzeForClips() {
//     console.log(transcribeFolderPath, 'TRANSCRIBEFOLDERPATH')
//     console.log(filePath, 'FILEPATH')
//     const outputFilePath = path.join(transcribeFolderPath, `${Key}-openAiClips.json`);
//     console.log(outputFilePath, 'OUTPUTFILEPATH')
// }

// Function to process file with OpenAI API
module.exports = {
    analyzeForClips: async (Key) => {
        console.log(Key, 'KEY in analyzeForClips');
        // Define the folder where files are stored
        const transcribeFolderPath = path.join(__dirname, '..\\transcribeFiles');

        // File path to the local JSON file you want to upload
        const filePath = path.join(transcribeFolderPath, `${Key}.json`);
        try {
            // Read the file content (json transcription)
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            // Set up the request to OpenAI API using the provided prompt and file content
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo', // Or another model you want to use
                messages: [
                    { role: 'user', content: prompt },
                    { role: 'user', content: fileContent } // Sending the file content as part of the conversation
                ],
            });

            // If the response is successful
            if (response && response.choices && response.choices.length > 0) {
                const responseData = response.choices[0].message.content;

                // Prepare the output file path
                const outputFilePath = path.join(transcribeFolderPath, `${Key}-openAiClips.json`);
                // const outputFilePath = path.join(transcribeFolderPath, 'test.mp4-openAiClips.json');

                // Save the response JSON to a file
                fs.writeFileSync(outputFilePath, JSON.stringify(JSON.parse(responseData), null, 2));
                console.log(`The result has been saved to ${outputFilePath}`);
            } else {
                console.error('Error with OpenAI API response:', response);
            }
        } catch (error) {
            console.error('Error while processing the file with OpenAI:', error);
        }
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeForClips(Key) {
    try {
        console.log(Key, 'KEY in analyzeForClips');
        // Define the folder where files are stored
        const transcribeFolderPath = path.join(__dirname, '..\\transcribeFiles');

        // File path to the local JSON file you want to upload
        const filePath = path.join(transcribeFolderPath, `${Key}.json`);
        // Read the file content (json transcription)
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Set up the request to OpenAI API using the provided prompt and file content
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Or another model you want to use gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, and gpt-3.5-turbo
            messages: [
                { role: 'user', content: prompt },
                { role: 'user', content: fileContent } // Sending the file content as part of the conversation
            ],
        });

        // Log the response and token usage if successful
        console.log("Response:", response);
        if (response.usage) {
            console.log("Input Tokens:", response.usage.prompt_tokens);
            console.log("Output Tokens:", response.usage.completion_tokens);
            console.log("Total Tokens:", response.usage.total_tokens);
        }

        // If the response is successful
        if (response && response.choices && response.choices.length > 0) {
            const responseData = response.choices[0].message.content;

            // Prepare the output file path
            const outputFilePath = path.join(transcribeFolderPath, `${Key}-openAiClips.json`);

            // Save the response JSON to a file
            fs.writeFileSync(outputFilePath, JSON.stringify(JSON.parse(responseData), null, 2));
            console.log(`The result has been saved to ${outputFilePath}`);
            res.render('completed.ejs')
        } else {
            console.error('Error with OpenAI API response:', response);
        }
    } catch (error) {
        // If rate limit exceeded (Error code 429)
        if (error.response && error.response.status === 429) {
            console.error("Rate limit exceeded! Please check your usage.");

            // Log retry-after headers if available
            if (error.response.headers['retry-after']) {
                console.log(`Retry after: ${error.response.headers['retry-after']} seconds`);
                const retryAfter = parseInt(error.response.headers['retry-after'], 10);
                console.log(`Waiting for ${retryAfter} seconds before retrying...`);

                // Wait for the retry interval before retrying the request
                await delay(retryAfter * 1000); // Convert to milliseconds
                // Optionally, retry the request after the delay
                return analyzeForClips(); // Retry the function call
            }
        } else {
            // Handle other types of errors
            console.error('Error while processing the file with OpenAI:', error);
        }
    }
}

// async function analyzeForClips() {
//     try {
//         // Read the file content (json transcription)
//         const fileContent = fs.readFileSync(filePath, 'utf-8');

//         // Set up the request to OpenAI API using the provided prompt and file content
//         const response = await openai.chat.completions.create({
//             model: 'gpt-3.5-turbo', // Or another model you want to use
//             messages: [
//                 { role: 'user', content: prompt },
//                 { role: 'user', content: fileContent } // Sending the file content as part of the conversation
//             ],
//         });
//         console.log("Response:", response);
//         console.log("Input Tokens:", response.usage.prompt_tokens);
//         console.log("Output Tokens:", response.usage.completion_tokens);
//         console.log("Total Tokens:", response.usage.total_tokens);
//         // If the response is successful
//         if (response && response.choices && response.choices.length > 0) {
//             const responseData = response.choices[0].message.content;

//             // Prepare the output file path
//             const outputFilePath = path.join(transcribeFolderPath, `${Key}-openAiClips.json`);
//             // const outputFilePath = path.join(transcribeFolderPath, 'test.mp4-openAiClips.json');

//             // Save the response JSON to a file
//             fs.writeFileSync(outputFilePath, JSON.stringify(JSON.parse(responseData), null, 2));
//             console.log(`The result has been saved to ${outputFilePath}`);
//         } else {
//             console.error('Error with OpenAI API response:', response);
//         }
//     } catch (error) {
//         console.error('Error while processing the file with OpenAI:', error);
//     }
// }


// Call the function to process the file
analyzeForClips(Key);