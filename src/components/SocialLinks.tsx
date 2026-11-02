import { links, type SocialLink } from "@/config/site";

type Key = keyof typeof links;

// Renders a row of links. Unset links show their [PLACEHOLDER] text so missing
// info stays visible, unless hideMissing is set (used in the footer).
export function SocialLinks({ keys, hideMissing = false, className = "" }: { keys: Key[]; hideMissing?: boolean; className?: string }) {
  return (
    <span className={`flex flex-wrap gap-x-6 ${className}`}>
      {keys.map((k) => (
        <LinkOrPlaceholder key={k} link={links[k]} hideMissing={hideMissing} />
      ))}
    </span>
  );
}

export function LinkOrPlaceholder({ link, hideMissing = false, className = "py-3" }: { link: SocialLink; hideMissing?: boolean; className?: string }) {
  if (!link.href) {
    return hideMissing ? null : <span className={`${className} text-todo`}>{link.placeholder}</span>;
  }
  const href = /^[^/:]+@/.test(link.href) ? `mailto:${link.href}` : link.href;
  const external = /^https?:/.test(href);
  return (
    <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {link.label}
    </a>
  );
}
