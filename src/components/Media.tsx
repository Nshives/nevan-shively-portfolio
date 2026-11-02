import Image from "next/image";
import type { Media as MediaT } from "@/lib/schema";
import { LoopVideo } from "./LoopVideo";

export function Corners() {
  return (
    <>
      <span className="vf-c vf-tl" />
      <span className="vf-c vf-tr" />
      <span className="vf-c vf-bl" />
      <span className="vf-c vf-br" />
    </>
  );
}

type Props = {
  media?: MediaT;
  // Fallback for a bare image path (e.g. a project's `thumb`).
  src?: string;
  alt?: string;
  label: string; // shown in the hatched frame when there's no media
  aspect: string; // e.g. "16/9"
  sizes?: string;
  viewfinder?: boolean;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

// Every media slot on the site. Renders the right element for the media type,
// or the hatched placeholder frame labelled with what goes there.
export function Media({ media, src, alt = "", label, aspect, sizes = "100vw", viewfinder, priority, className = "", style }: Props) {
  const m: MediaT | undefined = media ?? (src ? { type: "image", src, alt: alt || label } : undefined);

  let inner: React.ReactNode;
  if (!m || m.type === "placeholder") {
    const text = m?.type === "placeholder" ? m.label : label;
    inner = <span className="mono text-[11px] px-4">{text.startsWith("[") ? text : `[ ${text} ]`}</span>;
  } else if (m.type === "image") {
    inner = <Image src={m.src} alt={m.alt} fill sizes={sizes} priority={priority} className="object-cover" />;
  } else if (m.type === "video") {
    inner = <LoopVideo src={m.src} webm={m.webm} poster={m.poster} label={m.alt} />;
  } else {
    inner = (
      <iframe
        src={`https://player.vimeo.com/video/${m.id.replace("/", "?h=")}${m.id.includes("/") ? "&" : "?"}dnt=1`}
        title={m.title}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <div className={`ph ${className}`} style={{ aspectRatio: aspect, ...style }}>
      {inner}
      {viewfinder && <Corners />}
    </div>
  );
}

export function MediaCaption({ media }: { media?: MediaT }) {
  const caption = media && "caption" in media ? media.caption : undefined;
  return caption ? <p className="mono text-[11px] text-muted mt-3">{caption}</p> : null;
}
