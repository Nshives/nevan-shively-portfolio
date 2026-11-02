import type { Metadata } from "next";
import Link from "next/link";
import { loadProjects } from "@/lib/projects";
import type { Project } from "@/lib/schema";
import { archiveEarlierBefore } from "@/config/site";
import { Media } from "@/components/Media";
import { thumbLabel, thumbSrc } from "@/components/Cards";
import { metaLine } from "@/components/Meta";

export const metadata: Metadata = { title: "Archive" };

export default function ArchivePage() {
  const projects = loadProjects();
  const groups: { year: string; items: Project[] }[] = [];
  for (const p of projects) {
    const year = p.year < archiveEarlierBefore ? "Earlier" : String(p.year);
    const g = groups.find((x) => x.year === year);
    if (g) g.items.push(p);
    else groups.push({ year, items: [p] });
  }

  return (
    <>
      <section className="wrap pt-16 flex justify-between items-end flex-wrap gap-5">
        <div className="flex flex-col gap-3.5">
          <h1 className="disp m-0 text-white shadow-offset" style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
            Archive
          </h1>
          <p className="mono m-0 text-[11px] text-[#8EA3C2]">
            {projects.length} {projects.length === 1 ? "project" : "projects"} · newest first
          </p>
        </div>
        <Link className="mono py-3 text-[11px]" href="/#search">
          Search instead →
        </Link>
      </section>

      <section className="wrap">
        {groups.length === 0 && <p className="mono text-muted pt-16">No projects yet.</p>}
        {groups.map((g) => (
          <div key={g.year}>
            <div className="flex items-baseline gap-4 pt-16 pb-4">
              <h2 className="disp m-0 text-[28px] text-blue-text">{g.year}</h2>
              <span className="mono text-[11px] text-dim">
                {g.items.length} {g.items.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <ul className="list-none m-0 p-0 border-t border-line">
              {g.items.map((p) => (
                <li key={p.slug} className="border-b border-line">
                  <Link href={`/work/${p.slug}`} className="row flex flex-wrap items-center gap-x-9 gap-y-5 py-6 pr-4">
                    <Media
                      src={thumbSrc(p)}
                      label={thumbLabel(p)}
                      aspect="16/10"
                      sizes="(max-width: 700px) 100vw, 300px"
                      className="flex-none"
                      style={{ width: "min(100%, 300px)" }}
                    />
                    <div className="flex-[1_1_360px] min-w-0 flex flex-col gap-3">
                      <h3 className="disp m-0" style={{ fontSize: "clamp(22px,2.2vw,30px)" }}>
                        {p.title}
                      </h3>
                      <span className="mono text-[11px] text-muted">
                        {metaLine([g.year === "Earlier" && String(p.year), ...p.discipline, p.team.length > 0 && "Team"])}
                      </span>
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
