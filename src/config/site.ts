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
  email: { label: "Email", href: "nevanshively06@gmail.com", placeholder: "[EMAIL]" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/nevanshively/", placeholder: "[LINKEDIN]" },
  github: { label: "GitHub", href: "https://github.com/Nshives", placeholder: "[GITHUB URL]" },
  instagram: { label: "Instagram", href: "https://www.instagram.com/ngs.creative/", placeholder: "[INSTAGRAM]" },
  youtube: { label: "YouTube", href: "https://www.youtube.com/@ngs.creative", placeholder: "[YOUTUBE]" },
  resume: { label: "Résumé", href: "/files/nevan-shively-resume.pdf", placeholder: "[RÉSUMÉ PDF]" },
};

// Home reel. It autoplays muted with a sound button. If src is ever empty, the home
// page plays the first featured project with a video as a silent loop instead.
export const reel = {
  src: "/media/reel/portreel.mp4",
  poster: "/media/reel/portreel.jpg",
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
  ["aftereffects", "after effects", "ae"],
  ["hunger games"],
  ["3d printing", "3d printed", "3d print", "3d-printing", "3d-printed"],
  ["vfx", "fx", "visual effects", "visual effect", "effects", "effect", "fx td"],
  ["realtime", "real-time", "real time"],
  ["c++", "cpp"],
  ["ml", "machine learning", "machine-learning"],
  ["ai", "ai tools", "ai-assisted", "ai-aided", "ai assisted"],
  ["comp", "comps", "compositing", "composite", "composited", "composites", "compositor", "compositors"],
  ["3d", "cg", "cgi"],
  ["tools", "tool", "tooling", "tool development"],
  ["edit", "edits", "editing", "edited", "editor", "editors", "cutting"],
  ["programming", "programmer", "programmers", "coding", "code", "coder", "software", "developer"],
  ["game", "games", "gaming", "video game", "video games"],
  ["gameplay", "game mechanics", "mechanics", "mechanic"],
  ["modeling", "modelling", "modeler", "modeller", "model", "models", "modeled"],
  ["animation", "animations", "animator", "animators", "animate", "animated", "animating"],
  ["motion graphics", "motion design", "motion designer", "mograph"],
  ["design", "designs", "designer", "designers", "designed"],
  ["roto", "rotoscoping", "rotoscope", "rotoscoped"],
  ["texturing", "texture", "textures", "textured"],
  ["uv", "uvs", "uv mapping", "unwrapping"],
  ["keying", "keyed", "green screen", "greenscreen", "chroma key"],
  ["tracking", "track", "tracked", "tracker", "matchmove", "match move"],
  ["film", "films", "filmmaking", "short film", "short films"],
  ["hardware", "electronics", "embedded", "microcontroller", "microcontrollers", "physical computing"],
  ["prototype", "prototypes", "prototyping"],
  ["script", "scripts", "scripting"],
  ["automation", "automate", "automates", "automating"],
  ["sculpting", "sculpt", "sculpted"],
  ["environment", "environments", "environment art", "set dressing"],
  ["drawing", "drawings", "sketch", "sketches", "sketching"],
  ["sound", "audio", "sound design"],
  ["shooting", "cinematography", "camera"],
  ["rendering", "render", "renders", "rendered"],
  ["simulation", "simulations", "sim", "sims"],
];
