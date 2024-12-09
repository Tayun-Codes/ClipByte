// /controllers/videoController.js
const path = require('path');
const { render } = require('remotion');
const { RemotionVideo } = require('../remotion/remotionVideo');
const timestamps = require('../models/timestamps'); //this is going to be a json file.. um


exports.getVideoClips = async (req, res) => {
  try {
    const videoPath = path.resolve(__dirname, `../transcribeFiles/${Key}`);

    // Render compositions for each timestamp range
    const renderPromises = timestamps.map(async (clip, index) => {
      const outputPath = path.resolve(__dirname, `../public/videos/clip${index + 1}.mp4`);
      await render({
        composition: RemotionVideo(videoPath, clip.start, clip.end),
        codec: 'h264',
        outputLocation: outputPath,
      });
      return `/videos/clip${index + 1}.mp4`; // URL for the rendered clip
    });

    // Wait for all renderings to complete
    const renderedClips = await Promise.all(renderPromises);

    // Render the player view with the rendered clip URLs
    res.render('player', { clips: renderedClips });
  } catch (error) {
    console.error('Error rendering video clips:', error);
    res.status(500).send('Error rendering video clips.');
  }
};
