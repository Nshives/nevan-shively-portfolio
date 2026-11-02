import Link from "next/link";
import type { Project } from "@/lib/schema";
import { Media } from "./Media";

export function thumbLabel(p: Project) {
  return p.thumbLabel ?? (p.hero?.type === "placeholder" ? p.hero.label : p.title);
}

// Poster image for a card: explicit thumb, else the hero's poster/image.
export function thumbSrc(p: Project) {
  if (p.thumb) return p.thumb;
  if (p.hero?.type === "image") return p.hero.src;
  if (p.hero?.type === "video") return p.hero.poster;
  return undefined;
}

export function ProjectCard({ p, aspect = "16/10", titleSize = 20, sizes = "(max-width: 700px) 100vw, 400px" }: { p: Project; aspect?: string; titleSize?: number; sizes?: string }) {
  return (
    <Link href={`/work/${p.slug}`} className="card flex flex-col gap-3.5">
      <Media src={thumbSrc(p)} alt="" label={thumbLabel(p)} aspect={aspect} sizes={sizes} />
      <h3 className="disp m-0" style={{ fontSize: titleSize }}>
        {p.title}
      </h3>
    </Link>
  );
}
