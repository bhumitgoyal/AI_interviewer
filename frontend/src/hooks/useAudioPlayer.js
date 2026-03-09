import { useState, useRef, useCallback } from "react";
import { base64ToAudioBlob } from "../utils/audioUtils";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const playBase64Audio = useCallback((base64String, onEnd) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const blob = base64ToAudioBlob(base64String);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
    };

    audio.play().catch(console.error);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, playBase64Audio, stop };
}
