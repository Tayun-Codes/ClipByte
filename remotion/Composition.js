export const MyComposition = () => {
    return null;
  };


  const { Composition } = require('remotion');
const { Clip } = require('./clips');
const path = require('path');

const videoSrc = path.resolve(__dirname, '../transcribeFiles/test.mp4');

function RemotionVideo() {
  return [
    Composition({
      id: 'Clip1',
      component: () =>
        Clip({
          src: videoSrc,
          start: 0,
          end: 15,
        }),
      durationInFrames: 15 * 30, // 15 seconds * 30fps
      fps: 30,
      width: 1920,
      height: 1080,
    }),
    Composition({
      id: 'Clip2',
      component: () =>
        Clip({
          src: videoSrc,
          start: 60,
          end: 90,
        }),
      durationInFrames: 30 * 30, // 30 seconds * 30fps
      fps: 30,
      width: 1920,
      height: 1080,
    }),
  ];
}

module.exports = { RemotionVideo };
