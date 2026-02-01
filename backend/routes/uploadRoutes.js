const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const Transcription = require("../models/Transcription");

const router = express.Router();

const FFMPEG_PATH = "C:\\Users\\Rajesh\\Softwares\\ffmpeg\\bin\\ffmpeg.exe";

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
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const inputPath = req.file.path;
  const outputPath = inputPath.replace(path.extname(inputPath), ".wav");

  const whisperScript = path.join(
    __dirname,
    "../../whisper/transcribe.py"
  );

  exec(
    `"${FFMPEG_PATH}" -y -i "${inputPath}" "${outputPath}"`,
    (ffmpegErr) => {
      if (ffmpegErr) {
        return res.status(500).json({
          error: "Audio conversion failed",
        });
      }

      exec(
        `python "${whisperScript}" "${outputPath}"`,
        async (whisperErr, stdout, stderr) => {
          if (whisperErr) {
            return res.status(500).json({
              error: stderr || whisperErr.message,
            });
          }

          const transcriptionText = stdout.trim();

          if (!transcriptionText) {
            return res.status(500).json({
              error: "Transcription failed",
            });
          }

          try {
            const newTranscription = new Transcription({
              originalFileName: req.file.originalname,
              storedFilePath: outputPath,
              transcriptionText,
            });

            await newTranscription.save();

            res.json({ transcription: transcriptionText });
          } catch {
            res.status(500).json({
              error: "Failed to save transcription to database",
            });
          }
        }
      );
    }
  );
});

router.get("/transcriptions", async (req, res) => {
  try {
    const transcriptions = await Transcription.find().sort({
      createdAt: -1,
    });
    res.json(transcriptions);
  } catch {
    res.status(500).json({
      error: "Failed to fetch transcriptions",
    });
  }
});

module.exports = router;
