const fs = require('fs');
const path = require('path');
const fsPromise = require('fs/promises');
const { render } = require('remotion');
const { RemotionVideo } = require('./composition');
const { OpenAI } = require('openai');
require("dotenv").config({ path: "./config/.env" });


//hardcoding -> Key will come from the end of transcribeFile from controllers/transcribe.js
const Key = 'The Archives Ep. Thanksgiving 2024 (video).mp4 filtered' //first half'


// Set up the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
});


// Define the prompt to send to OpenAI
const prompt = `From this file, identify standalone engaging segments throughout the entire video that are at least 30 seconds long, up to 60 seconds. These segments should be cohesive and meaningful, with a clear story, message, or entertaining content that can hold the audience's attention as standalone Instagram Reels. Export the results in this JSON format:

const timestamps = [
{ start: <start-time>, end: <end-time>, why: <reason-for-selection> },
];`;


exports.processVideo = async (req, res) => {
  const { Key } = req.body;

  const analyzeForClips = async (Key, callback) => {
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

        // Prepare the output file path
        const outputFilePath = path.join(transcribeFolderPath, `${Key}-openAiClips.json`);
        console.log(outputFilePath, 'outputFilePath');

        // Save the response JSON to a file
        fs.writeFileSync(outputFilePath, JSON.stringify(JSON.parse(responseData), null, 2));
        console.log(`The result has been saved to ${outputFilePath}`);

        // Calls controllers/videoController.getVideoClips when succesful
        if (callback) {
          console.log('Running callback after analyzeForClips...');
          await callback(Key, outputFilePath, res); // Pass the file path or other relevant data to the callback
        }
      } else {
        console.error('Error with OpenAI API response:', response);
      }
    } catch (error) {
      console.error('Error while processing the file with OpenAI:', error);
    }
  };

  // Takes the json from OpenAI and renders it into data for completed.ejs 
  const getVideoClips = async (Key, jsonPath, res) => {
    try {
      console.log(jsonPath, 'jsonPath GETVIDEOCLIPS');
      console.log(Key, 'Key GETVIDEOCLIPS');
      console.log('getVideoClips running with:', jsonPath);

      const videoPath = path.resolve(__dirname, `../transcribeFiles/${Key}`);
      console.log(videoPath, 'videoPath');

      // Read and parse the JSON file
      const jsonData = await fsPromise.readFile(jsonPath, 'utf-8');
      const timestamps = JSON.parse(jsonData);

      // Render compositions for each timestamp range
      const renderPromises = timestamps.map(async (clip, index) => {
        const outputPath = path.resolve(__dirname, `../public/videos/${Key}/clip${index + 1}.mp4`);
        console.log(outputPath, 'outputPath');
        await render({
          composition: RemotionVideo(videoPath, clip.start, clip.end),
          codec: 'h264',
          outputLocation: outputPath,
        });
        return {
          src: `/videos/${Key}/clip${index + 1}.mp4`, // URL for the rendered clip
          why: clip.why,
        }
      });

      // Wait for all renderings to complete
      const renderedClips = await Promise.all(renderPromises);
      console.log('Rendering completed:', renderedClips);

      // Render the player view with the rendered clip URLs
      res.render('completed', { clips: renderedClips });

    } catch (error) {
      console.error('Error rendering video clips:', error);
      res.status(500).send('Error rendering video clips.');
    }
  };

  await analyzeForClips(Key, getVideoClips);

};