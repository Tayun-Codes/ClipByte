import path from 'path';
import {downloadWhisperModel} from '@remotion/install-whisper-cpp';
 
const {alreadyExisted} = await downloadWhisperModel({
  model: 'large-v2',
  folder: path.join(process.cwd(), 'remotion/whisper.cpp'),
});