"use client";

import { useEffect, useRef, useState } from "react";

// Short muted loop. Autoplays unless the viewer prefers reduced motion, in
// which case it shows the poster with native controls.
export function LoopVideo({ src, webm, poster, label }: { src: string; webm?: string; poster?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (!mq.matches) ref.current?.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover"
      muted
      loop
      playsInline
      preload={reduced ? "none" : "metadata"}
      poster={poster}
      controls={reduced}
      aria-label={label}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
