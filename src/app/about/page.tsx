import type { Metadata } from "next";
import { site, links } from "@/config/site";
import { Thumb } from "@/components/Media";
import { SocialLinks } from "@/components/SocialLinks";

export const metadata: Metadata = { title: "About" };

// Portrait: drop the photo at public/media/about/portrait.jpg and set this.
const portrait: string | undefined = undefined;

export default function AboutPage() {
  return (
    <section className="wrap pt-[72px] flex flex-wrap gap-x-[72px] gap-y-12 items-start">
      <Thumb src={portrait} aspect="4/5" sizes="(max-width: 700px) 100vw, 440px" label="[ portrait ]" className="flex-[1_1_320px] max-w-[440px]" />
      <div className="flex-[999_1_520px] min-w-0 max-w-[720px] flex flex-col gap-[26px]">
        <div className="flex flex-col gap-3">
          <h1 className="disp m-0 text-white shadow-offset" style={{ fontSize: "clamp(40px,5vw,72px)" }}>
            {site.name}
          </h1>
          <p className="mono m-0 text-[#8EA3C2]">{site.aboutLine}</p>
        </div>
        <p className="m-0 text-[23px] leading-[1.45] text-text">
          I believe the most powerful digital experiences happen at the intersection of “How did they do that?” and “What’s next?”
        </p>
        <p className="m-0 prose-body">
          I’m a Visual Effects Artist and Game Developer at SCAD. My work sits where technical programming meets high-impact digital art, and my
          core strength is rapid, real-time ideation, using a mix of traditional pipelines and AI-aided tools so creativity never gets stuck on a
          technical bottleneck.
        </p>
        <p className="m-0 prose-body">
          I don’t just want to use the industry standard; I want to build it. My goal is to design software and AI-aided tools that make complex VFX
          and game design more accessible, so people with brilliant ideas can realize them without being limited by traditional resource barriers.
        </p>
        <div className="flex flex-wrap gap-x-7 gap-y-3 items-center pt-2">
          {links.resume.href ? (
            <a className="btn" href={links.resume.href}>
              Résumé (PDF)
            </a>
          ) : (
            <span className="btn opacity-60 cursor-default">Résumé (PDF) · {links.resume.placeholder}</span>
          )}
          <SocialLinks keys={["email", "linkedin", "instagram", "youtube"]} className="mono" />
        </div>
      </div>
    </section>
  );
}
