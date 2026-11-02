import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getRelated, loadProjects, splitSections } from "@/lib/projects";
import { Media, MediaCaption } from "@/components/Media";
import { ProjectCard } from "@/components/Cards";
import { Mdx } from "@/components/Mdx";
import { Val } from "@/components/Meta";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return loadProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title } : {};
}

// Sections that have a fixed place on the page. Anything else written as a
// "## Heading" renders after Process, in the order written.
const BEFORE_GALLERY = ["the hard part", "process"];
const AFTER_FINAL = ["what i'd do differently"];

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  const { intro, sections } = splitSections(p.body);
  const fixed = [...BEFORE_GALLERY, ...AFTER_FINAL];
  const early = [
    ...BEFORE_GALLERY.flatMap((k) => sections.filter((s) => s.key === k)),
    ...sections.filter((s) => !fixed.includes(s.key)),
  ];
  const late = AFTER_FINAL.flatMap((k) => sections.filter((s) => s.key === k));
  const related = getRelated(p);

  const meta: [string, string][] = [
    ["Year", String(p.year)],
    ["Role", p.role],
    ...(p.tools.length ? [["Tools", p.tools.join(" · ")] as [string, string]] : []),
    ["Built", p.aiLabel],
  ];

  return (
    <>
      {p.hero && (
        <section className="wrap pt-8">
          <Media media={p.hero} label="hero" aspect="16/8" priority sizes="(max-width: 1280px) 100vw, 1200px" />
          <MediaCaption media={p.hero} />
        </section>
      )}

      <section className="wrap pt-12 flex justify-between items-end gap-x-12 gap-y-6 flex-wrap">
        <div className="flex flex-col gap-4">
          {(p.inProgress || p.foundational) && (
            <div className="flex gap-2">
              {p.inProgress && <span className="badge badge-wip">In progress</span>}
              {p.foundational && <span className="badge">Foundational</span>}
            </div>
          )}
          <h1 className="disp m-0 text-white" style={{ fontSize: "clamp(40px,5.5vw,80px)" }}>
            {p.title}
          </h1>
        </div>
        <dl className="mono m-0 flex flex-wrap gap-x-7 gap-y-2 text-[11px] text-[#8EA3C2]">
          {meta.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="text-dim">{k}</dt>
              <dd className="m-0">
                <Val>{v}</Val>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {p.team.length > 0 && (
        <section className="wrap pt-6">
          <p className="mono text-[11px] text-muted m-0">
            Team: {p.team.map((t) => `${t.name} (${t.role})`).join(" · ")}
          </p>
        </section>
      )}

      <article className="narrow">
        {intro && (
          <section className="pt-14 prose-body prose-intro">
            <Mdx source={intro} />
          </section>
        )}
        {early.map((s) => (
          <Section key={s.key} heading={s.heading} content={s.content} />
        ))}
      </article>

      {p.gallery.length > 0 && (
        <section className="wrap pt-10">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))" }}>
            {p.gallery.map((m, i) => (
              <figure key={i} className="m-0">
                <Media media={m} label="image" aspect="4/3" sizes="(max-width: 800px) 100vw, 640px" />
                <MediaCaption media={m} />
              </figure>
            ))}
          </div>
        </section>
      )}

      {p.final && (
        <section className="wrap pt-4">
          <Media media={p.final} label="final" aspect="16/9" sizes="(max-width: 1280px) 100vw, 1200px" />
          <MediaCaption media={p.final} />
        </section>
      )}

      {late.length > 0 && (
        <article className="narrow">
          {late.map((s) => (
            <Section key={s.key} heading={s.heading} content={s.content} />
          ))}
        </article>
      )}

      <section className="wrap pt-[120px]">
        <div className="flex justify-between items-baseline flex-wrap gap-4 border-t border-line pt-8 mb-7">
          <h2 className="mono m-0 text-text text-[13px]">Related</h2>
          <Link className="mono py-3 text-[11px]" href="/#search">
            Back to search →
          </Link>
        </div>
        {related.length > 0 && (
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
            {related.map((r) => (
              <ProjectCard key={r.slug} p={r} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Section({ heading, content }: { heading: string; content: string }) {
  return (
    <section className="flex flex-col gap-[18px] pt-[72px]">
      <h2 className="sec-label">{heading}</h2>
      <div className="prose-body">
        <Mdx source={content} />
      </div>
    </section>
  );
}
