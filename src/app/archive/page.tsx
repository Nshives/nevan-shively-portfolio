import type { Metadata } from "next";
import Link from "next/link";
import { loadProjects } from "@/lib/projects";
import { termLabel, type Project } from "@/lib/schema";
import { Thumb } from "@/components/Media";
import { thumbSrc } from "@/components/Cards";

export const metadata: Metadata = { title: "Archive" };

const count = (n: number) => `${n} ${n === 1 ? "project" : "projects"}`;

export default function ArchivePage() {
  const projects = loadProjects();
  // loadProjects is already sorted, so groups come out newest first.
  const groups: { term: string; items: Project[] }[] = [];
  for (const p of projects) {
    const term = termLabel(p.term);
    const g = groups.find((x) => x.term === term);
    if (g) g.items.push(p);
    else groups.push({ term, items: [p] });
  }

  return (
    <>
      <section className="wrap pt-16 flex justify-between items-end flex-wrap gap-5">
        <div className="flex flex-col gap-3.5">
          <h1 className="disp m-0 text-white shadow-offset" style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
            Archive
          </h1>
          <p className="mono m-0 text-[11px] text-[#8EA3C2]">{count(projects.length)} · newest first</p>
        </div>
        <Link className="mono py-3 text-[11px]" href="/#search">
          Search instead →
        </Link>
      </section>

      <section className="wrap">
        {groups.map((g) => (
          <div key={g.term}>
            <div className="flex items-baseline gap-4 pt-16 pb-4">
              <h2 className="disp m-0 text-[28px] text-blue-text">{g.term}</h2>
              <span className="mono text-[11px] text-dim">{count(g.items.length)}</span>
            </div>
            <ul className="list-none m-0 p-0 border-t border-line">
              {g.items.map((p) => (
                <li key={p.slug} className="border-b border-line">
                  <Link href={`/work/${p.slug}`} className="row flex flex-wrap items-center gap-x-9 gap-y-5 py-6 pr-4">
                    <Thumb src={thumbSrc(p)} position={p.thumbPos} aspect="16/10" sizes="(max-width: 700px) 100vw, 300px" label="[ still ]" className="flex-none" style={{ width: "min(100%, 300px)" }} />
                    <div className="flex-[1_1_360px] min-w-0 flex flex-col gap-3">
                      <h3 className="disp m-0" style={{ fontSize: "clamp(22px,2.2vw,30px)" }}>
                        {p.title}
                      </h3>
                      <span className="mono text-[11px] text-muted">{p.meta ?? p.tools.join(" · ")}</span>
                      {(p.foundational || p.inProgress) && (
                        <div className="flex gap-2 flex-wrap">
                          {p.foundational && <span className="badge">Foundational</span>}
                          {p.inProgress && <span className="badge badge-wip">In progress</span>}
                        </div>
                      )}
                    </div>
                    <span className="arrow mono text-[22px] hidden sm:inline" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
