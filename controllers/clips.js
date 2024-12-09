const { Video } = require('remotion');

function clip({ src, start, end }) {
  const durationInFrames = (end - start) * 30; // Assuming 30fps
  return Video({
    src,
    startFrom: start * 30, // Convert seconds to frames
    endAt: end * 30,       // Convert seconds to frames
    durationInFrames,
  });
}

module.exports = { clip };