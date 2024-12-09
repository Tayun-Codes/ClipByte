//not in use
const mongoose = require("mongoose");

const TranscriptionSchema = new mongoose.Schema({
  key: { type: String },
  transcription: { },
});

module.exports = mongoose.model("Transcription", TranscriptionSchema);
