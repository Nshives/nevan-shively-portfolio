import Link from "next/link";
import { getFeatured, loadProjects, plainText } from "@/lib/projects";
import type { IndexEntry } from "@/lib/search";
import { reel } from "@/config/site";
import { Reel } from "@/components/Reel";
import { Search } from "@/components/Search";
import { ProjectCard, thumbLabel, thumbSrc } from "@/components/Cards";

// Search index, built at build time and shipped to the client with the page.
function buildIndex(): IndexEntry[] {
  return loadProjects().map((p) => ({
    slug: p.slug,
    title: p.title,
    year: String(p.year),
    discipline: p.discipline,
    tags: p.tags,
    tools: p.tools.filter((t) => !/^\[.*\]$/.test(t)),
    role: p.role,
    aiLabel: p.aiLabel,
    tier: p.tier,
    foundational: p.foundational,
    thumb: thumbSrc(p),
    thumbLabel: thumbLabel(p),
    // Unwritten "[prompt]" paragraphs aren't content, so they're left out.
    body: `${plainText(p.body.replace(/^\[.*\]$/gm, "").replace(/\[UNVERIFIED\]/g, ""))} ${p.searchText}`,
  }));
}

// Reel: the configured reel, else the first featured project with a video hero.
function reelSource() {
  if (reel.src) return { src: reel.src, webm: reel.webm || undefined, poster: reel.poster || undefined };
  const p = getFeatured().find((f) => f.hero?.type === "video");
  if (p?.hero?.type === "video") return { src: p.hero.src, webm: p.hero.webm, poster: p.hero.poster };
  return {};
}

export default function Home() {
  const featured = getFeatured();
  return (
    <>
      <section className="wrap pt-8">
        <Reel {...reelSource()} hudFile={reel.hudFile} />
      </section>

      {featured.length > 0 && (
        <section className="pt-24">
          <div className="wrap flex justify-between items-baseline gap-4 flex-wrap mb-7">
            <h2 className="mono m-0 text-text text-[13px]">Featured work</h2>
            <Link className="mono py-3 text-[11px]" href="/archive">
              See everything →
            </Link>
          </div>
          <div className="wrap">
            <ul className="strip list-none m-0 p-0" aria-label="Featured projects">
              {featured.map((p) => (
                <li key={p.slug} className="flex-[0_0_min(78vw,520px)]">
                  <ProjectCard p={p} aspect="4/3" titleSize={22} sizes="(max-width: 700px) 78vw, 520px" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Search index={buildIndex()} />
    </>
  );
}
