import { useEffect } from "react";
import { useCamera } from "../hooks/useCamera";

export default function CameraFeed({ videoRef, onReady }) {
  const { hasPermission, error, startCamera } = useCamera(videoRef);

  useEffect(() => {
    startCamera().then(() => onReady?.());
  }, []);

  return (
    <div style={{
      width: "100%",
      aspectRatio: "16/9",
      background: "#0d1117",
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      border: "1px solid var(--border)"
    }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          display: hasPermission ? "block" : "none"
        }}
      />
      {!hasPermission && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 8, padding: 16, textAlign: "center"
        }}>
          <div style={{ fontSize: 32 }}>📷</div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            {error || "Requesting camera access..."}
          </p>
        </div>
      )}
      {hasPermission && (
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          background: "rgba(0,0,0,0.6)",
          padding: "3px 10px",
          borderRadius: 20,
          fontSize: 11,
          color: "var(--text-secondary)",
          display: "flex", alignItems: "center", gap: 5
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#34d399", display: "inline-block",
            animation: "recording-pulse 2s ease infinite"
          }} />
          You
        </div>
      )}
    </div>
  );
}
