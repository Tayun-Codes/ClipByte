const { Player } = require('@remotion/player');
const { RemotionVideo } = require('./Player');

const path = require('path');
const express = require('express');
const app = express();

// Serve static files like video
app.use('/transcribeFiles', express.static(path.join(__dirname, '../transcribeFiles')));

app.get('/', (req, res) => {
  const playerHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Video Clips</title>
      </head>
      <body>
        <h1>Video Clips</h1>
        <div id="player"></div>
        <script type="module">
          import { Player } from "https://cdn.jsdelivr.net/npm/@remotion/player/dist/index.esm.js";
          const { RemotionVideo } = ${JSON.stringify(RemotionVideo())};

          const playerContainer = document.getElementById('player');
          RemotionVideo.forEach((clip) => {
            const player = Player({
              component: clip.component,
              compositionWidth: clip.width,
              compositionHeight: clip.height,
              durationInFrames: clip.durationInFrames,
              fps: clip.fps,
              controls: true,
            });
            playerContainer.appendChild(player);
          });
        </script>
      </body>
    </html>
  `;

  res.send(playerHTML);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
