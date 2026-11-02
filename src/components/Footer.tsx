import { site } from "@/config/site";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-[#12203A] mt-[120px]">
      <div className="wrap mono py-7 flex justify-between flex-wrap gap-x-7 gap-y-2 text-[11px] text-dim">
        <span className="py-3">{site.copyright}</span>
        <SocialLinks keys={["email", "linkedin", "instagram", "resume"]} hideMissing />
      </div>
    </footer>
  );
}
