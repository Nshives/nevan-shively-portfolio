"use client";

import { useEffect, useRef, useState } from "react";
import { Corners } from "./Media";
import { site } from "@/config/site";

type Props = { src?: string; poster?: string; silent?: boolean; hudFile: string };

const FPS = 24;
function timecode(t: number) {
  const f = Math.floor((t % 1) * FPS);
  const s = Math.floor(t);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}

// Home reel in a viewfinder frame. Autoplays muted; the button toggles sound.
// Viewers who prefer reduced motion get the poster and a play button instead.
export function Reel({ src, poster, silent, hudFile }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [tc, setTc] = useState(timecode(0));

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {});
    let raf = 0;
    const tick = () => {
      setTc(timecode(v.currentTime));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function toggleSound() {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  }

  function togglePlay() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  return (
    <div className="ph w-full max-h-[720px]" style={{ aspectRatio: "16/9" }}>
      {src ? (
        <video
          ref={ref}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="Reel"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <span className="mono text-[12px] text-[#5F7596] px-4 hidden sm:inline">[ reel, autoplays muted · click for sound ]</span>
      )}
      {src && <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45 pointer-events-none" />}
      <Corners />
      <div className="mono absolute top-[30px] left-6 right-6 sm:left-12 sm:right-12 flex justify-between gap-4 flex-wrap text-[11px] text-[#8EA3C2] pointer-events-none">
        <span>
          <span className={`text-blue-text ${playing ? "" : "opacity-40"}`}>●</span> REC&nbsp;&nbsp;{hudFile}
        </span>
        <span aria-hidden="true">{tc}</span>
      </div>
      <div className="absolute left-6 right-6 sm:left-12 sm:right-12 bottom-[30px] flex justify-between items-end gap-4 flex-wrap">
        <p className="mono m-0 text-[11px] sm:text-[12px] text-nav">
          {site.name} · {site.roleLine}
        </p>
        {src && (
          <span className="flex gap-2">
            <button type="button" className="chip bg-ground/60 min-h-[40px]" onClick={togglePlay} aria-label={playing ? "Pause reel" : "Play reel"}>
              {playing ? "Pause" : "Play"}
            </button>
            {!silent && (
              <button type="button" className="chip bg-ground/60 min-h-[40px]" onClick={toggleSound} aria-pressed={!muted}>
                {muted ? "Sound on" : "Mute"}
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
