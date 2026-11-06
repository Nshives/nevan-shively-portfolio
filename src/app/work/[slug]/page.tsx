import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getRelated, loadProjects } from "@/lib/projects";
import type { Block } from "@/lib/schema";
import { Caption, FullImage, HeroMedia, Player, TodoFrame } from "@/components/Media";
import { ProjectCard } from "@/components/Cards";
import { Paragraphs, Val } from "@/components/Meta";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return loadProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.description } : {};
}

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  // Empty fields are left out of the meta row.
  const meta: [string, string[]][] = [
    ["When", [p.term]],
    ["Role", p.role ? [p.role] : []],
    ["Tools", p.tools],
    ["Built", p.aiLabel ? [p.aiLabel] : []],
  ];
  const related = getRelated(p);

  return (
    <>
      <section className="wrap pt-16 flex justify-between items-end gap-x-12 gap-y-6 flex-wrap">
        <div className="flex flex-col gap-3.5">
          {p.foundational && <span className="badge self-start">Foundational</span>}
          {p.inProgress && <span className="badge badge-wip self-start">In progress</span>}
          <h1 className="disp m-0 text-white" style={{ fontSize: "clamp(40px,5.5vw,80px)" }}>
            {p.title}
          </h1>
        </div>
        <dl className="mono m-0 flex flex-wrap gap-x-7 gap-y-2 text-[11px] text-[#8EA3C2] max-w-[620px]">
          {meta
            .filter(([, v]) => v.length > 0)
            .map(([k, values]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-dim">{k}</dt>
                <dd className="m-0">
                  {values.map((v, i) => (
                    <span key={v}>
                      {i > 0 && " · "}
                      <Val>{v}</Val>
                    </span>
                  ))}
                </dd>
              </div>
            ))}
        </dl>
      </section>

      {p.description && (
        <section className="wrap pt-8">
          <div className="max-w-[860px] flex flex-col gap-4">
            <Paragraphs text={p.description} className="m-0 text-[#C3CEDF] text-[21px] leading-[1.6]" />
          </div>
        </section>
      )}

      {p.hero && (
        <section className="wrap pt-10">
          <HeroMedia hero={p.hero} priority />
        </section>
      )}

      {p.blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}

      <section className="wrap pt-[120px]">
        <div className="flex justify-between items-baseline flex-wrap gap-4 border-t border-line pt-8 mb-7">
          <h2 className="mono m-0 text-text text-[13px] font-medium">Related</h2>
          <Link className="mono py-3 text-[11px]" href="/#search">
            Back to search →
          </Link>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
          {related.map((r) => (
            <ProjectCard key={r.slug} p={r} />
          ))}
        </div>
      </section>
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "text":
      return (
        <section className="narrow pt-14 flex flex-col gap-3.5">
          <h2 className="sec-label">{b.heading}</h2>
          <Paragraphs text={b.text} className="m-0 text-[#C3CEDF] text-[19px] leading-[1.65]" />
        </section>
      );
    case "subheading":
      return (
        <section className="wrap pt-[88px]">
          <h2 className="disp m-0 pt-6 border-t border-line text-[28px] leading-none text-white">{b.text}</h2>
        </section>
      );
    case "video":
    case "vimeo":
      return (
        <figure className="wrap pt-10 flex flex-col gap-2.5">
          <Player m={b} />
          <Caption text={b.caption} />
        </figure>
      );
    case "image":
      return (
        <figure className="wrap pt-10 flex flex-col gap-2.5">
          <FullImage m={b} />
          <Caption text={b.caption} />
        </figure>
      );
    case "grid":
      return (
        <div className="wrap pt-10 grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${b.minColumnWidth}), 1fr))` }}>
          {b.items.map((m) => (
            <figure key={m.src} className="m-0 flex flex-col gap-2.5">
              <div className="relative w-full bg-media border border-line overflow-hidden" style={{ aspectRatio: b.aspect }}>
                <Image src={m.src} alt={m.alt} fill sizes="(max-width: 800px) 100vw, 640px" className={b.fit === "contain" ? "object-contain" : "object-cover"} />
              </div>
              <Caption text={m.caption} />
            </figure>
          ))}
        </div>
      );
    case "placeholder":
      return (
        <div className="wrap pt-10">
          <TodoFrame label={b.label} aspect="16/7" />
        </div>
      );
  }
}
