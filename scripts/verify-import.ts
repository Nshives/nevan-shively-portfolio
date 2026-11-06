// Confirms the generated content matches ../Claude Work/projects.json word for word, and every media file exists.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(import.meta.dirname, "..");
const { projects } = JSON.parse(fs.readFileSync(path.join(ROOT, "..", "Claude Work", "projects.json"), "utf8"));
let bad = 0;
const fail = (slug: string, what: string) => { bad++; console.log(`✗ ${slug}: ${what}`); };
const files = (b: any): string[] => b.type === "grid" ? b.items.map((i: any) => i.src) : [b.src, b.poster].filter(Boolean);

// Confirmed by Nevan after the export (same as import-projects.mjs).
Object.assign(projects.find((p: any) => p.slug === "auction-video"), { term: "Before SCAD", date: "2024-12", foundational: true, tools: "Blender · Premiere" });
projects.find((p: any) => p.slug === "sad-1").tools = "Graphite · Ink";
projects.find((p: any) => p.slug === "sad-3").tools = "Ink pen";
const coffee = projects.find((p: any) => p.slug === "coffee-maker");
Object.assign(coffee, { tools: "Python · Onshape", aiLabel: "AI-assisted" });
coffee.blocks[0].text = coffee.blocks[0].text.replace("to build the CAD model.", "to build the CAD model, which I then refined in Onshape.");

for (const p of projects) {
  const { data: d } = matter(fs.readFileSync(path.join(ROOT, "content", "projects", `${p.slug}.mdx`), "utf8"));
  for (const k of ["title", "term", "date", "role", "description", "foundational", "featured", "group"]) if (d[k] !== p[k]) fail(p.slug, `${k}: ${d[k]} ≠ ${p[k]}`);
  if ((d.aiLabel ?? null) !== p.aiLabel) fail(p.slug, "aiLabel");
  if ((d.order ?? undefined) !== p.featuredOrder) fail(p.slug, "order");
  if ((d.tools ?? []).join(" · ") !== p.tools) fail(p.slug, "tools");
  if (d.blocks.length !== p.blocks.length) fail(p.slug, "block count");
  p.blocks.forEach((b: any, i: number) => {
    const g = d.blocks[i];
    if (g.type !== b.type) return fail(p.slug, `block ${i} type`);
    if (g.text !== b.text || g.heading !== b.heading || g.caption !== b.caption) fail(p.slug, `block ${i} text`);
    if (b.type === "grid") {
      if (g.minColumnWidth !== b.minColumnWidth || g.aspect !== b.aspect || g.fit !== b.fit) fail(p.slug, `block ${i} grid settings`);
      b.items.forEach((it: any, j: number) => {
        if (g.items[j].caption !== it.caption || !g.items[j].src.endsWith(`/${it.key}.jpg`)) fail(p.slug, `block ${i} item ${j}`);
      });
    }
  });
  for (const b of [d.hero, ...d.blocks].filter(Boolean)) {
    for (const f of files(b)) if (!fs.existsSync(path.join(ROOT, "public", f))) fail(p.slug, `missing ${f}`);
  }
}
console.log(bad ? `${bad} problem(s)` : `all ${projects.length} projects match`);
