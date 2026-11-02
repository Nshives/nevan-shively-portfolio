import type { Metadata } from "next";
import { links } from "@/config/site";
import { LinkOrPlaceholder } from "@/components/SocialLinks";

export const metadata: Metadata = { title: "Contact" };

const ROWS: { key: keyof typeof links; handle?: string }[] = [
  { key: "email" },
  { key: "linkedin" },
  { key: "github" },
  { key: "instagram", handle: "@ngs.creative" },
  { key: "youtube", handle: "@ngs.creative" },
  { key: "resume" },
];

export default function ContactPage() {
  return (
    <section className="wrap pt-16">
      <h1 className="disp m-0 text-white shadow-offset" style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
        Contact
      </h1>
      <ul className="list-none m-0 p-0 mt-12 border-t border-line max-w-[760px]">
        {ROWS.map(({ key, handle }) => {
          const link = links[key];
          return (
            <li key={key} className="border-b border-line flex flex-wrap justify-between items-baseline gap-x-6 gap-y-1 py-5">
              <span className="mono text-muted">{link.label}</span>
              <span className="text-[19px]">
                <LinkOrPlaceholder link={{ ...link, label: handle ?? displayHref(link.href) ?? link.label }} className="" />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function displayHref(href: string) {
  if (!href) return undefined;
  if (href.startsWith("/")) return "Download PDF";
  return href.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
