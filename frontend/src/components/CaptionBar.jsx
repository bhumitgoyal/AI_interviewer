import { useEffect, useState, useRef } from "react";

export default function CaptionBar({ text, isActive }) {
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!text) { setDisplayed(""); indexRef.current = 0; return; }
    setDisplayed("");
    indexRef.current = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(timerRef.current);
      }
    }, 22);
    return () => clearInterval(timerRef.current);
  }, [text]);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  if (!isActive && !displayed) return null;

  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: 680,
      background: "rgba(8,12,20,0.88)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "14px 20px",
      fontFamily: "var(--font-mono)",
      fontSize: 15,
      lineHeight: 1.6,
      color: "#e2e8f0",
      textAlign: "center",
      zIndex: 50,
      animation: "fade-in 0.3s ease",
      minHeight: 52,
    }}>
      <span style={{ color: "#4f8ef7", fontWeight: 600, marginRight: 8, fontSize: 13 }}>ALEX</span>
      {displayed}
      {cursor && (
        <span style={{
          display: "inline-block",
          width: 2,
          height: "1em",
          background: "#4f8ef7",
          marginLeft: 2,
          verticalAlign: "middle",
          animation: "blink-bar 1s step-start infinite"
        }} />
      )}
    </div>
  );
}
