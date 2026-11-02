// Site-wide settings. Anything left as "" is still unknown and renders as a
// visible placeholder (or is hidden in the footer) until Nevan fills it in.

export const site = {
  name: "Nevan Shively",
  copyright: "© 2026 Nevan Shively Visuals",
  roleLine: "Visual Effects Artist | Game Developer",
  aboutLine: "Visual Effects Artist | Game Developer | SCAD ’29 · Savannah, GA",
  // Set once the domain is chosen (see BUILD-BRIEF §8).
  url: "",
};

export type SocialLink = { label: string; href: string; placeholder: string };

export const links: Record<"email" | "linkedin" | "github" | "instagram" | "youtube" | "resume", SocialLink> = {
  email: { label: "Email", href: "", placeholder: "[EMAIL]" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/nevanshively/", placeholder: "[LINKEDIN]" },
  github: { label: "GitHub", href: "", placeholder: "[GITHUB URL]" },
  instagram: { label: "Instagram", href: "https://www.instagram.com/ngs.creative/", placeholder: "[INSTAGRAM]" },
  youtube: { label: "YouTube", href: "https://www.youtube.com/@ngs.creative", placeholder: "[YOUTUBE]" },
  // Drop the PDF at public/files/nevan-shively-resume.pdf, then set href to "/files/nevan-shively-resume.pdf".
  resume: { label: "Résumé", href: "", placeholder: "[RÉSUMÉ PDF]" },
};

// Home reel. Leave src empty to fall back to the hero clip of the first
// featured project that has a video hero (and then to a hatched placeholder).
export const reel = {
  src: "", // e.g. "/media/reel/reel.mp4"
  webm: "", // optional "/media/reel/reel.webm"
  poster: "", // e.g. "/media/reel/reel.jpg"
  hudFile: "NSV_REEL_2026.MOV",
};

// Suggested searches under the search box. Placeholders until real work is in;
// refine the labels and queries here and nothing else needs to change.
export const searchChips: { label: string; query: string }[] = [
  { label: "FX TD", query: "FX technical director intern: procedural effects, Houdini or Unreal Niagara, Python tooling." },
  { label: "Gameplay programmer", query: "Gameplay programmer intern: prototyping mechanics, Blueprints or C++, working closely with designers." },
  { label: "Pipeline / tools", query: "Pipeline TD: Python tools for artists, Maya and Nuke scripting, automating repetitive work." },
  { label: "AI R&D", query: "R&D intern exploring machine learning tools for artists and content creation." },
  { label: "Film", query: "Junior editor: shooting, cutting and sound for short films." },
  { label: "3D", query: "3D generalist intern: modeling, lighting and rendering in Blender or Maya." },
];

// Words that mean the same thing to a recruiter. Each group is treated as one
// term when searching. Lowercase.
export const searchSynonyms: string[][] = [
  ["unreal", "ue5", "ue4", "unreal engine"],
  ["vfx", "fx", "visual effects", "effects"],
  ["realtime", "real-time", "real time"],
  ["c++", "cpp"],
  ["ml", "machine learning", "ai"],
  ["comp", "compositing", "nuke"],
  ["3d", "cg", "cgi"],
  ["tools", "tooling", "tool"],
  ["edit", "editing", "editor", "cutting"],
];

// Archive: years before this are grouped under "Earlier".
export const archiveEarlierBefore = 2025;
