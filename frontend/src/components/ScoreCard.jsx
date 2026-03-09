import { useEffect, useRef } from "react";

export default function ScoreCard({ score, label, color = "#4f8ef7" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2, r = W/2 - 8;
    let current = 0;

    const step = () => {
      ctx.clearRect(0, 0, W, H);
      // Background arc
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, 1.5*Math.PI);
      ctx.stroke();
      // Fill arc
      const end = -Math.PI/2 + (current / 100) * 2 * Math.PI;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "99");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, end);
      ctx.stroke();
      // Score text
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 22px Sora, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.round(current), cx, cy - 3);
      ctx.fillStyle = "rgba(148,163,184,0.8)";
      ctx.font = "10px Sora, sans-serif";
      ctx.fillText("/100", cx, cy + 14);

      if (current < score) {
        current = Math.min(current + 1.5, score);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [score, color]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <canvas ref={canvasRef} width={100} height={100} />
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
