"use client";

import { useEffect, useRef } from "react";
import useMusicStore from "@/lib/stores/music";
import { API_URL } from "@/lib/config";

export default function MusicProvider() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPlaying, isMuted, volume, src, setPlaying } = useMusicStore();

  useEffect(() => {
    console.log("[Music] Creating audio for:", src);
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    audioRef.current = audio;

    const handleCanPlay = () => {
      console.log("[Music] canplaythrough event, attempting play");
      audio.play().catch((err) => console.error("[Music] Play error:", err));
      setPlaying(true);
    };

    const handleError = (e: any) => {
      console.error("[Music] Audio error:", e);
    };

    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [src, setPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Switch to lobby music when logged in, pause on logout
  useEffect(() => {
    const { setSrc } = useMusicStore.getState();

    const checkAuth = () => {
      const token = localStorage.getItem("classified.auth.token");
      if (token) {
        const currentSrc = useMusicStore.getState().src;
        if (currentSrc !== `${API_URL}/api/music/lobby.mp3`) {
          setSrc(`${API_URL}/api/music/lobby.mp3`);
        }
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          setPlaying(false);
        }
        const currentSrc = useMusicStore.getState().src;
        if (currentSrc !== `${API_URL}/api/music/background.mp3`) {
          setSrc(`${API_URL}/api/music/background.mp3`);
        }
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    const interval = setInterval(checkAuth, 2000);

    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, [setPlaying]);

  return null;
}
