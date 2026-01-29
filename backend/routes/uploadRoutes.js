const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");


const Transcription = require("../models/Transcription");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("audio"), (req, res) => {
  res.json({
    message: "Audio file uploaded successfully",
    file: req.file,
  });
});


router.post("/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No audio file uploaded",
    });
  }

  const audioPath = req.file.path;

  const scriptPath = path.join(
    __dirname,
    "../../whisper/transcribe.py"
  );

  exec(`python "${scriptPath}" "${audioPath}"`, async (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: stderr || error.message,
      });
    }


    const transcriptionText = stdout.trim();

    try {

      const newTranscription = new Transcription({
        originalFileName: req.file.originalname,
        storedFilePath: audioPath,
        transcriptionText: transcriptionText,
      });

      await newTranscription.save();


      res.json({
        transcription: transcriptionText,
      });
    } catch (dbError) {
      res.status(500).json({
        error: "Failed to save transcription to database",
      });
    }
  });
});

router.get("/transcriptions", async (req, res) => {
  try {
    const transcriptions = await Transcription.find()
      .sort({ createdAt: -1 }); // latest first

    res.json(transcriptions);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch transcriptions",
    });
  }
});


module.exports = router;
