const mongoose = require("mongoose");

const transcriptionSchema = new mongoose.Schema(
  {
    originalFileName: {
      type: String,
      required: true,
    },
    storedFilePath: {
      type: String,
      required: true,
    },
    transcriptionText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transcription", transcriptionSchema);
