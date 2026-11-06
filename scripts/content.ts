// Content helpers. Run through npm:
//   npm run content:check                 validate every project, list open todos
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
    // Only what's shown to visitors or still open: every string, minus file paths.
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") { if (!v.startsWith("/")) strings.push(v); }
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(data);
    const written = strings.join("\n");
    const todos = [...new Set(written.match(/\[[^\]\n]+\]/g) ?? [])].filter((t) => t !== "[UNVERIFIED]");
    const unverified = (written.match(/\[UNVERIFIED\]/g) ?? []).length;
    const banned = BANNED.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(written));
    if (content.trim()) notes.push("ERROR  body: all text goes in description or a text block, not below the frontmatter");
    if (/highschool/i.test(written)) notes.push('voice  never use "Highschool"; use the date');
    if (todos.length) notes.push(`todo   ${todos.join(" ")}`);
    if (unverified) notes.push(`check  ${unverified} [UNVERIFIED] sentence(s) to confirm or cut`);
    if (banned.length) notes.push(`voice  banned word(s): ${banned.join(", ")}`);
    const failed = notes.some((n) => n.startsWith("ERROR"));
    if (failed && r.success && r.data.slug === f.replace(/\.mdx$/, "")) bad++;
    console.log(`${failed ? "✗" : "✓"} ${f}`);
    for (const n of notes) console.log(`    ${n}`);
  }
  if (bad) {
    console.error(`\n${bad} file(s) invalid. The build will fail until they're fixed.`);
    process.exit(1);
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
  const tpl = fs
    .readFileSync(path.join(DIR, "_template.mdx"), "utf8")
    .replace('"SLUG"', JSON.stringify(slug))
    .replace('"TITLE"', JSON.stringify(title));
  fs.writeFileSync(target, tpl);
  fs.mkdirSync(path.join(MEDIA, slug), { recursive: true });
  console.log(`created content/projects/${slug}.mdx and public/media/${slug}/`);
  console.log(`next: npm run media -- ${slug} <files…>`);
} else {
  console.log("commands: check | new <slug> <title>");
}
