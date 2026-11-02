"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { site } from "@/config/site";

const NAV = [
  { href: "/#search", label: "Search", match: null },
  { href: "/archive", label: "Archive", match: "/archive" },
  { href: "/about", label: "About", match: "/about" },
  { href: "/contact", label: "Contact", match: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="border-b border-[#12203A]">
      <div className="wrap flex items-center justify-between gap-x-8 gap-y-1 flex-wrap min-h-[76px] py-2 sm:py-0">
        <Link href="/" aria-label={`${site.name}, home`} className="flex items-center gap-3 text-text hover:text-white py-2">
          <Logo />
          <span className="disp text-[17px] leading-none">{site.name}</span>
        </Link>
        <nav aria-label="Primary" className="mono flex flex-wrap gap-x-7 gap-y-1">
          {NAV.map((n) => {
            const current = n.match !== null && pathname.startsWith(n.match);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={current ? "page" : undefined}
                className={`inline-block py-3.5 ${current ? "text-blue-text" : "text-nav hover:text-blue-text"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
