import Link from "next/link";
import type { Project } from "@/lib/schema";
import { Thumb } from "./Media";

// A project's picture for cards and search: explicit thumb, else the hero,
// else the first image or video in its blocks.
export function thumbSrc(p: Project): string | undefined {
  if (p.thumb) return p.thumb;
  const h = p.hero;
  if (h?.type === "image") return h.src;
  if (h?.type === "video" || h?.type === "vimeo") return h.poster;
  for (const b of p.blocks) {
    if (b.type === "grid") return b.items[0].src;
    if (b.type === "image") return b.src;
    if (b.type === "video" || b.type === "vimeo") return b.poster;
  }
  return undefined;
}

export function ProjectCard({ p, aspect = "16/10", titleSize = 20, sizes = "(max-width: 700px) 100vw, 400px" }: { p: Project; aspect?: string; titleSize?: number; sizes?: string }) {
  return (
    <Link href={`/work/${p.slug}`} className="card flex flex-col gap-3.5">
      <Thumb src={thumbSrc(p)} position={p.thumbPos} aspect={aspect} sizes={sizes} label="[ still ]" />
      <h3 className="disp m-0" style={{ fontSize: titleSize }}>
        {p.title}
      </h3>
    </Link>
  );
}
