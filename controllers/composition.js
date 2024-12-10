const { Composition } = require('remotion');
const { Clip } = require('./clips');

const RemotionVideo = (videoSrc, start, end) => {
  return Composition({
    id: `Clip_${start}_${end}`,
    component: () => Clip({ src: videoSrc, start, end }),
    durationInFrames: (end - start) * 30, // Assuming 30fps
    fps: 30,
    width: 1920,
    height: 1080,
  });
};

module.exports = { RemotionVideo };
