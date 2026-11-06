import Image from "next/image";
import type { Block, Hero } from "@/lib/schema";

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

const FULL = "(max-width: 1280px) 100vw, 1200px";

export function Caption({ text }: { text?: string }) {
  return text ? <figcaption className="mono text-[11px] text-dim">{text}</figcaption> : null;
}

// Videos: 16:9, contained on black, with controls and sound.
export function Player({ m }: { m: Extract<Hero, { type: "video" | "vimeo" }> }) {
  if (m.type === "vimeo") {
    const src = `https://player.vimeo.com/video/${m.id.replace("/", "?h=")}${m.id.includes("/") ? "&" : "?"}dnt=1`;
    return (
      <div className="relative w-full bg-black border border-line" style={{ aspectRatio: "16/9" }}>
        <iframe src={src} title={m.title} className="absolute inset-0 w-full h-full" allow="fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
      </div>
    );
  }
  return <video src={m.src} poster={m.poster} controls playsInline preload="none" className="block w-full object-contain bg-black border border-line" style={{ aspectRatio: "16/9" }} />;
}

// An image in a frame of a set shape, as used by heroes and grids.
export function FramedImage({ src, alt, aspect, fit, sizes, priority }: { src: string; alt: string; aspect: string; fit: "contain" | "cover"; sizes: string; priority?: boolean }) {
  return (
    <div className="relative w-full bg-media border border-line overflow-hidden" style={{ aspectRatio: aspect }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={fit === "contain" ? "object-contain" : "object-cover"} />
    </div>
  );
}

export function TodoFrame({ label, aspect }: { label: string; aspect: string }) {
  return (
    <div className="w-full bg-media flex items-center justify-center text-center p-6 border border-dashed border-[#2E5A92] mono text-todo" style={{ aspectRatio: aspect }}>
      {label}
    </div>
  );
}

export function HeroMedia({ hero, priority }: { hero: Hero; priority?: boolean }) {
  if (hero.type === "image") return <FramedImage src={hero.src} alt={hero.alt} aspect={hero.aspect} fit={hero.fit} sizes={FULL} priority={priority} />;
  if (hero.type === "placeholder") return <TodoFrame label={hero.label} aspect="16/9" />;
  return <Player m={hero} />;
}

// Full width and uncropped.
export function FullImage({ m }: { m: Extract<Block, { type: "image" }> }) {
  return <Image src={m.src} alt={m.alt} width={m.width} height={m.height} sizes={FULL} className="block w-full h-auto max-h-[960px] object-contain bg-media border border-line" />;
}

// Thumbnail for cards and rows. No image yet gets a dashed frame.
export function Thumb({ src, position, aspect, sizes, label, className = "", style }: { src?: string; position?: string; aspect: string; sizes: string; label: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`ph ${src ? "" : "!border-dashed !border-[#2E5A92]"} ${className}`} style={{ aspectRatio: aspect, ...style }}>
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: position ?? "center" }} />
      ) : (
        <span className="mono text-[10px] px-3 text-todo">{label}</span>
      )}
    </div>
  );
}
