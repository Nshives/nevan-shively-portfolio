import Link from "next/link";
import { getFeatured, loadProjects, searchableText } from "@/lib/projects";
import { isTodo, termLabel } from "@/lib/schema";
import type { IndexEntry } from "@/lib/search";
import { reel } from "@/config/site";
import { Reel } from "@/components/Reel";
import { Search } from "@/components/Search";
import { ProjectCard, thumbSrc } from "@/components/Cards";

// Search index, built at build time and shipped to the client with the page.
function buildIndex(): IndexEntry[] {
  return loadProjects().map((p) => {
    const tools = p.tools.filter((t) => !isTodo(t));
    return {
      slug: p.slug,
      title: p.title,
      term: termLabel(p.term),
      discipline: p.discipline,
      tags: p.tags,
      tools,
      role: p.role ?? "",
      // Search weight: featured work counts most, foundational least.
      tier: p.featured ? 1 : p.foundational ? 3 : 2,
      foundational: p.foundational,
      thumb: thumbSrc(p),
      thumbPos: p.thumbPos,
      body: searchableText(p),
    };
  });
}

// Reel: the configured reel, else the first featured project with a video, silent.
function reelSource() {
  if (reel.src) return { src: reel.src, poster: reel.poster || undefined, silent: false };
  for (const p of getFeatured()) {
    if (p.hero?.type === "video") return { src: p.hero.src, poster: p.hero.poster, silent: true };
  }
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
