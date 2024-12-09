//not in use
const mongoose = require("mongoose");

const ClipSchema = new mongoose.Schema({
  number: { type: Number },
  start: { type: String },
  end: { type: String },
  transcription: { },
  why: { type: String }
});

//openai code
/*
# Refine the search for high-quality moments (15-60 seconds long) across the entire video
# Initialize variables
final_clips = []
current_clip = []
clip_start = None

# Loop through all transcription entries
for entry in transcription:
    text = entry.get('text', '').strip()
    start_time = entry['timestamps']['from']
    end_time = entry['timestamps']['to']
    
    if text:
        # Build up the current clip
        current_clip.append(text)
        if clip_start is None:
            clip_start = start_time
    else:
        # Evaluate the clip if we reach an empty text entry
        if current_clip and clip_start:
            clip_text = " ".join(current_clip)
            # Calculate clip duration in seconds
            start_secs = sum(int(x) * 60 ** i for i, x in enumerate(reversed(clip_start.split(":"))))
            end_secs = sum(int(x) * 60 ** i for i, x in enumerate(reversed(end_time.split(":"))))
            duration = end_secs - start_secs
            
            # Include clips with a duration of 15-60 seconds
            if 15 <= duration <= 60:
                final_clips.append({
                    'start': clip_start,
                    'end': end_time,
                    'text': clip_text
                })
            
            # Reset for the next potential clip
            current_clip = []
            clip_start = None

# Display all the high-quality clips found
final_clips
*/


module.exports = mongoose.model("Transcription", TranscriptionSchema);
