import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader } from "lucide-react";

export default function RecordButton({ onRecordComplete, isDisabled, isLoading }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const [analyserBars, setAnalyserBars] = useState([4,4,4,4,4,4,4]);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  function updateBars() {
    if (!analyserRef.current) return;
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const slice = Math.floor(dataArrayRef.current.length / 7);
    const bars = Array.from({length: 7}, (_, i) => {
      const val = dataArrayRef.current[i * slice] || 0;
      return Math.max(3, Math.floor((val / 255) * 24));
    });
    setAnalyserBars(bars);
    animFrameRef.current = requestAnimationFrame(updateBars);
  }

  async function startRec() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    animFrameRef.current = requestAnimationFrame(updateBars);

    const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const dur = (Date.now() - startTimeRef.current) / 1000;
      stream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      setAnalyserBars([4,4,4,4,4,4,4]);
      audioCtx.close();
      onRecordComplete(blob, dur);
    };
    mr.start(100);
    startTimeRef.current = Date.now();
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    setIsRecording(true);
  }

  function stopRec() {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
    setDuration(0);
  }

  useEffect(() => () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleClick = () => {
    if (isDisabled || isLoading) return;
    if (isRecording) stopRec(); else startRec();
  };

  const mins = String(Math.floor(duration / 60)).padStart(2, "0");
  const secs = String(duration % 60).padStart(2, "0");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* Waveform bars */}
      <div style={{
        display: "flex", alignItems: "center", gap: 3, height: 28,
        opacity: isRecording ? 1 : 0.3, transition: "opacity 0.3s"
      }}>
        {analyserBars.map((h, i) => (
          <div key={i} style={{
            width: 3, height: h,
            background: `linear-gradient(to top, #4f8ef7, #a78bfa)`,
            borderRadius: 2,
            transition: "height 0.05s ease"
          }} />
        ))}
      </div>

      {/* Main button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        style={{
          width: 72, height: 72,
          borderRadius: "50%",
          border: isRecording ? "2px solid #ef4444" : "2px solid var(--border-accent)",
          background: isRecording
            ? "radial-gradient(circle, rgba(239,68,68,0.2), rgba(239,68,68,0.05))"
            : "radial-gradient(circle, rgba(79,142,247,0.15), rgba(79,142,247,0.03))",
          cursor: isLoading || isDisabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          animation: isRecording ? "recording-pulse 1.5s ease infinite" : "none",
          opacity: isDisabled ? 0.4 : 1,
          boxShadow: isRecording
            ? "0 0 0 0 rgba(239,68,68,0.4)"
            : "0 0 24px rgba(79,142,247,0.2)"
        }}
      >
        {isLoading
          ? <Loader size={24} color="#4f8ef7" style={{ animation: "spin 1s linear infinite" }} />
          : isRecording
            ? <MicOff size={24} color="#ef4444" />
            : <Mic size={24} color="#4f8ef7" />
        }
      </button>

      {/* Status text */}
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: isRecording ? "#ef4444" : "var(--text-secondary)"
      }}>
        {isLoading ? "Processing..." : isRecording ? `Recording ${mins}:${secs}` : "Tap to speak"}
      </p>
    </div>
  );
}
