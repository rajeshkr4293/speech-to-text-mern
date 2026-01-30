import { useState, useRef, useEffect } from "react";

function App() {
  const [history, setHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://speech-to-text-mern.onrender.com/api/transcriptions")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("audio/")) {
      alert("Please upload a valid audio file");
      return;
    }

    setFile(selectedFile);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });
      setFile(audioFile);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select or record an audio file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    setLoading(true);
    setTranscription("");

    try {
      const res = await fetch(
        "https://speech-to-text-mern.onrender.com/api/transcribe",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setTranscription(data.transcription);
    } catch {
      setTranscription("Failed to transcribe audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 space-y-7">

        <h1 className="text-3xl font-bold text-center text-gray-800 tracking-tight">
          🎙️ Speech to Text
        </h1>

        <p className="text-center text-gray-500 text-sm leading-relaxed">
          Upload or record audio and get instant transcription
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {!recording ? (
            <button
              onClick={startRecording}
              className="w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition-all duration-200 active:scale-[0.98]"
            >
              🎙️ Record
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-full bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition-all duration-200 active:scale-[0.98]"
            >
              ⏹ Stop
            </button>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
        >
          {loading ? "Transcribing..." : "Transcribe Audio"}
        </button>

        <div className="bg-gray-100 rounded-xl p-4 min-h-[100px]">
          <h2 className="text-sm font-semibold text-gray-600 mb-1">
            Transcription
          </h2>
          <p className="text-gray-800 text-sm whitespace-pre-line">
            {transcription || "Your transcription will appear here..."}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Previous Transcriptions
          </h2>

          {history.length === 0 ? (
            <p className="text-sm text-gray-500">
              No transcriptions yet.
            </p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((item) => (
                <li
                  key={item._id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm hover:shadow-md transition"
                >
                  <p className="text-gray-800">{item.transcriptionText}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
