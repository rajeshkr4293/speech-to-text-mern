import { useState, useRef, useEffect } from "react";

function App() {
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetch("https://speech-to-text-mern.onrender.com/api/transcriptions")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("audio/")) {
      alert("Please upload a valid audio file");
      return;
    }
    setFile(f);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setFile(new File([blob], "recording.webm", { type: "audio/webm" }));
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select or record audio");

    const formData = new FormData();
    formData.append("audio", file);

    setLoading(true);
    setTranscription("");

    try {
      const res = await fetch(
        "https://speech-to-text-mern.onrender.com/api/transcribe",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setTranscription(data.transcription);
    } catch {
      setTranscription("Transcription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 px-6 py-12">

      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">
            🎙️ Speech to Text
          </h1>
          <p className="text-sm text-slate-600">
            Upload or record audio and get instant AI transcription
          </p>
        </div>

        {/* Audio Input Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-medium text-slate-800">
            Audio Input
          </h2>

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block text-sm"
          />

          {file && (
            <p className="text-sm text-slate-600">
              Selected: {file.name}
            </p>
          )}

          <div className="flex gap-4">
            {!recording ? (
              <button
                onClick={startRecording}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm"
              >
                Stop Recording
              </button>
            )}
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-center">
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-6 py-2 rounded-lg border border-slate-400 text-sm disabled:opacity-50"
          >
            {loading ? "Transcribing..." : "Transcribe Audio"}
          </button>
        </div>

        {/* Result Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-medium text-slate-800">
            Transcription
          </h2>
          <div className="min-h-[120px] text-sm text-slate-700">
            {transcription || "Your transcription will appear here..."}
          </div>
        </div>

        {/* History Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-slate-800">
            Previous Transcriptions
          </h2>

          {history.length === 0 ? (
            <p className="text-sm text-slate-600">
              No transcriptions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="border border-slate-200 rounded-lg p-3 text-sm"
                >
                  <div className="text-slate-800">
                    {item.transcriptionText}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
