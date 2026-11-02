import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { frontmatterSchema, type Project } from "./schema";

export const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

let cache: Project[] | null = null;

// Reads and validates every project. Any malformed file throws, which fails
// `next build` with the file name and the exact problem.
export function loadProjects(): Project[] {
  if (cache && process.env.NODE_ENV === "production") return cache;

  const files = fs.existsSync(PROJECTS_DIR)
    ? fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    : [];

  const errors: string[] = [];
  const projects: Project[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `    ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
      errors.push(`  content/projects/${file}\n${issues}`);
      continue;
    }
    if (parsed.data.slug !== file.replace(/\.mdx$/, "")) {
      errors.push(`  content/projects/${file}\n    slug: "${parsed.data.slug}" must match the file name`);
      continue;
    }
    projects.push({ ...parsed.data, year: Number(parsed.data.date.slice(0, 4)), body: content.trim(), file });
  }

  if (errors.length) {
    throw new Error(`Invalid project content:\n${errors.join("\n")}`);
  }

  // Newest first. "2026" (month unknown) sorts after "2026-12".
  projects.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  cache = projects;
  return projects;
}

export function getProject(slug: string) {
  return loadProjects().find((p) => p.slug === slug);
}

export function getFeatured() {
  return loadProjects()
    .filter((p) => p.featured)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Up to n projects sharing the most tags/disciplines/tools with this one.
export function getRelated(project: Project, n = 3) {
  const terms = new Set([...project.tags, ...project.discipline, ...project.tools].map((t) => t.toLowerCase()));
  return loadProjects()
    .filter((p) => p.slug !== project.slug)
    .map((p) => ({
      p,
      score:
        [...p.tags, ...p.discipline, ...p.tools].filter((t) => terms.has(t.toLowerCase())).length +
        (p.foundational ? 0 : 0.5) +
        (4 - p.tier) * 0.1,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ p }) => p);
}

// Splits the MDX body into the intro (before the first ##) and named sections.
export function splitSections(body: string) {
  const parts = body.split(/^##\s+/m);
  const intro = parts.shift()?.trim() ?? "";
  const sections = parts.map((chunk) => {
    const nl = chunk.indexOf("\n");
    const heading = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    const content = nl === -1 ? "" : chunk.slice(nl + 1).trim();
    return { heading, key: heading.toLowerCase().replace(/[’']/g, "'"), content };
  });
  return { intro, sections: sections.filter((s) => s.content) };
}

// Plain text of the body for the search index.
export function plainText(md: string) {
  return md
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
