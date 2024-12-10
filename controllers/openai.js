const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require("dotenv").config({ path: "./config/.env" });

//hardcoding -> Key will come from the end of transcribeFile from controllers/transcribe.js
const Key = 'The Archives Ep. Thanksgiving 2024 (video).mp4 filtered NO OFFSETS' //first half'

// Set up the OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
});


// Define the prompt to send to OpenAI
const prompt = `From this file, identify standalone engaging segments throughout the entire video that are at least 30 seconds long, up to 60 seconds. These segments should be cohesive and meaningful, with a clear story, message, or entertaining content that can hold the audience's attention as standalone Instagram Reels. Only respond with the results in this JSON format:

{ "timestamps" = [
  { start: <start-time>, end: <end-time>, why: <reason-for-selection> },
]};`;

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
                let responseData = response.choices[0].message.content;

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
        console.log('analyzeForClips running!');
        // Define the folder where files are stored
        const transcribeFolderPath = path.join(__dirname, '..\\transcribeFiles');
        console.log(transcribeFolderPath, 'transcribeFolderPath');

        // File path to the local JSON file you want to upload
        const filePath = path.join(transcribeFolderPath, `${Key}.json`);
        console.log(filePath, 'filePath');

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
        console.log('RESPONSE:', response, 'RESPONSE');
        if (response.usage) {
            console.log("Input Tokens:", response.usage.prompt_tokens);
            console.log("Output Tokens:", response.usage.completion_tokens);
            console.log("Total Tokens:", response.usage.total_tokens);
        }

        // If the response is successful
        if (response && response.choices && response.choices.length > 0) {
            const responseData = response.choices[0].message.content;
            console.log(responseData, 'RESPONSEDATA')
            

            // Step 1: Extract the array from the response
            let cleanedResponse = responseData
            .replace(/^const\s+\w+\s+=\s+/i, '') // Remove "const timestamps ="
            .replace(/```json|\n/g, '')           // Remove backticks and newlines (if any)
            .replace(/`/g, '')
            .trim();                             // Trim any extra spaces
            console.log(cleanedResponse, 'CLEANED RESPONSE')

            // Step 2: Parse the cleaned data to ensure valid JSON
            let parsedData;
            try {
                parsedData = JSON.parse(cleanedResponse);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                return;
            }

            // Prepare the output file path
            const outputFilePath = path.join(transcribeFolderPath, `${Key}-openAiClips.json`);
            console.log(outputFilePath, 'outputFilePath');

            // Save the response JSON to a file
            fs.writeFileSync(outputFilePath, JSON.stringify(JSON.parse(cleanedResponse), null, 2));
            console.log(`The result has been saved to ${outputFilePath}`);

            // Calls controllers/videoController.getVideoClips when succesful
            if (callback) {
                console.log('Running callback after analyzeForClips...');
                await callback(Key, outputFilePath); // Pass the file path or other relevant data to the callback
            }
        } else {
            console.error('Error with OpenAI API response:', response);
        }
    } catch (error) {
        console.error('Error while processing the file with OpenAI:', error);
    }
}

let responseData = '```json const timestamps = [{ start: "00:01:27,340", end: "00:01:32,480", why: "A narrative about Thanksgiving and emotions that reflects on personal experiences." }, { start: "00:05:10,140", end: "00:05:15,160", why: "Reflection on growing as a person through hardships and being grateful for the experience." }, { start: "00:10:02,130", end: "00:10:05,310", why: "Expression of gratitude towards followers and the growth of the podcast." }];```'


// Call the function to process the file
// analyzeForClips(Key);