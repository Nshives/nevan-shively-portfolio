import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { frontmatterSchema, termRank, type Project } from "./schema";

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
    if (content.trim()) {
      errors.push(`  content/projects/${file}\n    body: all text goes in description or a text block, not below the frontmatter`);
      continue;
    }
    projects.push({ ...parsed.data, file });
  }

  if (errors.length) {
    throw new Error(`Invalid project content:\n${errors.join("\n")}`);
  }

  // Newest term first; inside a term, newest date, then the archive order.
  projects.sort(
    (a, b) =>
      termRank(a.term) - termRank(b.term) ||
      b.date.localeCompare(a.date) ||
      (a.archiveOrder ?? 0) - (b.archiveOrder ?? 0) ||
      a.title.localeCompare(b.title),
  );
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

// Same group first, then anything else.
export function getRelated(project: Project, n = 3) {
  const others = loadProjects().filter((p) => p.slug !== project.slug);
  return [...others.filter((p) => p.group === project.group), ...others.filter((p) => p.group !== project.group)].slice(0, n);
}

// All written text on a project, for the search index.
export function searchableText(p: Project) {
  const parts = [p.description ?? "", p.searchText];
  for (const b of p.blocks) {
    if (b.type === "text" || b.type === "subheading") parts.push(b.text);
    if (b.type === "image" || b.type === "video" || b.type === "vimeo") parts.push(b.caption ?? "");
    if (b.type === "grid") parts.push(...b.items.map((i) => i.caption ?? ""));
  }
  return parts.filter((t) => t && !/^\[.*\]$/.test(t.trim())).join(" ");
}
