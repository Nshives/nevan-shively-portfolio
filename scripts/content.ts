// Content helpers. Run through npm:
//   npm run content:check                 validate every project, list open todos
//   npm run placeholders                  list placeholder projects
//   npm run placeholders -- --remove      delete them (and their media folders)
//   npm run new-project -- my-slug "My Title"
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { frontmatterSchema } from "../src/lib/schema";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "content", "projects");
const MEDIA = path.join(ROOT, "public", "media");
const BANNED = ["leveraged", "leverage", "utilized", "utilize", "passionate about", "seamlessly", "cutting-edge", "delve", "showcase", "robust", "journey"];

const files = () => fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));
const read = (f: string) => matter(fs.readFileSync(path.join(DIR, f), "utf8"));

const [cmd, ...args] = process.argv.slice(2);

if (cmd === "check") {
  let bad = 0;
  for (const f of files()) {
    const { data, content } = read(f);
    const r = frontmatterSchema.safeParse(data);
    const notes: string[] = [];
    if (!r.success) {
      bad++;
      for (const i of r.error.issues) notes.push(`ERROR  ${i.path.join(".")}: ${i.message}`);
    } else if (r.data.slug !== f.replace(/\.mdx$/, "")) {
      bad++;
      notes.push(`ERROR  slug "${r.data.slug}" must match the file name`);
    }
    const raw = JSON.stringify(data) + "\n" + content;
    const todos = [...new Set(raw.match(/\[[A-Z][A-Z0-9 ,'’.]+\]/g) ?? [])].filter((t) => t !== "[UNVERIFIED]");
    const unverified = (content.match(/\[UNVERIFIED\]/g) ?? []).length;
    const prompts = content.split("\n").filter((l) => /^\[.*\]$/.test(l.trim())).length;
    const banned = BANNED.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(content));
    if (data.placeholder) notes.push("placeholder project");
    if (todos.length) notes.push(`todo   ${todos.join(" ")}`);
    if (prompts) notes.push(`todo   ${prompts} unwritten [prompt] paragraph(s)`);
    if (unverified) notes.push(`check  ${unverified} [UNVERIFIED] sentence(s) to confirm or cut`);
    if (banned.length) notes.push(`voice  banned word(s): ${banned.join(", ")}`);
    console.log(`${notes.some((n) => n.startsWith("ERROR")) ? "✗" : "✓"} ${f}`);
    for (const n of notes) console.log(`    ${n}`);
  }
  if (bad) {
    console.error(`\n${bad} file(s) invalid. The build will fail until they're fixed.`);
    process.exit(1);
  }
} else if (cmd === "placeholders") {
  const ph = files().filter((f) => read(f).data.placeholder === true);
  if (!ph.length) {
    console.log("No placeholder projects.");
  } else if (args.includes("--remove")) {
    for (const f of ph) {
      fs.rmSync(path.join(DIR, f));
      const media = path.join(MEDIA, f.replace(/\.mdx$/, ""));
      if (fs.existsSync(media)) fs.rmSync(media, { recursive: true });
      console.log(`removed ${f}`);
    }
  } else {
    for (const f of ph) console.log(`${f}  (${read(f).data.title})`);
    console.log(`\n${ph.length} placeholder(s). Remove with: npm run placeholders -- --remove`);
  }
} else if (cmd === "new") {
  const [slug, ...titleParts] = args;
  const title = titleParts.join(" ");
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !title) {
    console.error('Usage: npm run new-project -- my-slug "My Title"');
    process.exit(1);
  }
  const target = path.join(DIR, `${slug}.mdx`);
  if (fs.existsSync(target)) {
    console.error(`${slug}.mdx already exists`);
    process.exit(1);
  }
  const now = new Date();
  const tpl = fs
    .readFileSync(path.join(DIR, "_template.mdx"), "utf8")
    .replace('"SLUG"', JSON.stringify(slug))
    .replace('"TITLE"', JSON.stringify(title))
    .replace('"YYYY-MM"', `"${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}"`);
  fs.writeFileSync(target, tpl);
  fs.mkdirSync(path.join(MEDIA, slug), { recursive: true });
  console.log(`created content/projects/${slug}.mdx and public/media/${slug}/`);
  console.log(`next: npm run media -- ${slug} <files…>`);
} else {
  console.log("commands: check | placeholders [--remove] | new <slug> <title>");
}
