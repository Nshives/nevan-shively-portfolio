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

// Home reel. Leave src empty until the reel is cut: the home page then plays the
// first featured project with a video as a silent loop.
export const reel = {
  src: "", // e.g. "/media/reel/reel.mp4"
  poster: "", // e.g. "/media/reel/reel.jpg"
  hudFile: "NSV_REEL_2026.MOV",
};

// Suggested searches under the search box.
export const searchChips: { label: string; query: string }[] = [
  { label: "3D / Maya", query: "3D artist intern: model, UV and texture props in Maya for real-time scenes." },
  { label: "Compositing", query: "Junior compositor: keying, roto and integrating CG into live plates in Nuke." },
  { label: "Tools / Python", query: "Pipeline or tools intern: write Python scripts that automate repetitive artist work in Maya." },
  { label: "Gameplay programming", query: "Gameplay programmer intern: prototype mechanics, timing systems and UI in code." },
  { label: "Motion / Film", query: "Motion designer or editor: animation, titles, shooting and cutting short films." },
  { label: "Hardware / maker", query: "Creative technologist: build physical prototypes with microcontrollers, CAD and 3D printing." },
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
