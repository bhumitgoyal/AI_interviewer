import { useRef, useEffect, useState } from "react";

// Realistic photo-based interviewer avatar with animated effects
export default function AvatarCanvas({ isSpeaking, isThinking }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load avatar image once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/assets/alex-avatar.png";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);

      // --- Circular clip for avatar ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (imgRef.current) {
        // Subtle breathing animation — slight scale oscillation
        const breathScale = 1 + Math.sin(t * 0.0015) * 0.008;
        const sw = W / breathScale;
        const sh = H / breathScale;
        const sx = (W - sw) / 2;
        const sy = (H - sh) / 2;
        ctx.drawImage(imgRef.current, sx, sy, sw, sh);
      } else {
        // Fallback gradient while loading
        const grad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W / 2);
        grad.addColorStop(0, "rgba(79,142,247,0.15)");
        grad.addColorStop(1, "rgba(8,12,20,0.5)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Loading text
        ctx.fillStyle = "rgba(79,142,247,0.6)";
        ctx.font = "14px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Loading...", W / 2, H / 2);
      }

      ctx.restore();

      // --- Speaking: animated blue soundwave overlay at bottom ---
      if (isSpeaking) {
        const waveY = H - 30;
        const bars = 12;
        const barWidth = 3;
        const gap = 5;
        const totalWidth = bars * (barWidth + gap) - gap;
        const startX = (W - totalWidth) / 2;

        for (let i = 0; i < bars; i++) {
          const phase = t * 0.008 + i * 0.5;
          const barH = 4 + Math.abs(Math.sin(phase)) * 14;
          const alpha = 0.5 + Math.abs(Math.sin(phase)) * 0.5;

          const grad = ctx.createLinearGradient(0, waveY - barH, 0, waveY);
          grad.addColorStop(0, `rgba(79,142,247,${alpha})`);
          grad.addColorStop(1, `rgba(167,139,250,${alpha * 0.6})`);
          ctx.fillStyle = grad;

          const x = startX + i * (barWidth + gap);
          ctx.beginPath();
          ctx.roundRect(x, waveY - barH, barWidth, barH, 1.5);
          ctx.fill();
        }
      }

      // --- Thinking: animated dots ---
      if (isThinking) {
        for (let i = 0; i < 3; i++) {
          const dotPhase = (t * 0.005 + i * 0.7) % (Math.PI * 2);
          const dotY = Math.sin(dotPhase) * 5;
          const alpha = 0.4 + Math.sin(dotPhase) * 0.4;
          ctx.fillStyle = `rgba(79,142,247,${alpha})`;
          ctx.beginPath();
          ctx.arc(W / 2 - 12 + i * 12, H - 20 + dotY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Outer glow ring when speaking ---
      if (isSpeaking) {
        const pulse = (Math.sin(t * 0.004) + 1) / 2;
        ctx.strokeStyle = `rgba(79,142,247,${0.15 + pulse * 0.35})`;
        ctx.lineWidth = 2 + pulse * 2;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function loop(timestamp) {
      drawFrame(timestamp);
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isSpeaking, isThinking, imageLoaded]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      style={{ borderRadius: "50%", display: "block", width: 160, height: 160 }}
    />
  );
}
