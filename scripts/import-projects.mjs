#!/usr/bin/env node
// Builds the site's content from the approved export, ../Claude Work/projects.json.
//
//   node scripts/import-projects.mjs media    optimize every source into public/media/<slug>/ (skips finished files)
//   node scripts/import-projects.mjs mdx      write content/projects/<slug>.mdx (run after media, it reads image sizes)
//
// Only needed for this first import. New projects are added by hand (CONTENT-GUIDE.md).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";
import { encodeVideo, grabFrame, optimizeImage, probe } from "./media-lib.mjs";

const SITE = path.resolve(import.meta.dirname, "..");
const WORK = path.resolve(SITE, "..", "Claude Work");
const WORKS = path.resolve(SITE, "..", "Works");
const MEDIA = path.join(SITE, "public", "media");
const OUT = path.join(SITE, "content", "projects");
const TMP = path.join(os.tmpdir(), "portfolio-import");

const { projects } = JSON.parse(fs.readFileSync(path.join(WORK, "projects.json"), "utf8"));

// Handoff §5: the auction video gets compressed and a real hero.
const auction = projects.find((p) => p.slug === "auction-video");
auction.hero = { type: "video", key: "auction", source: "AuctionVideo/Auction Video Draft 3 copy.mp4" };
// Nevan, 5 Nov 2026: made December 2024, before SCAD. Pre-SCAD work counts as foundational.
Object.assign(auction, { term: "Before SCAD", date: "2024-12", foundational: true });
auction.tools = "Blender · Premiere";
projects.find((p) => p.slug === "sad-1").tools = "Graphite · Ink";
projects.find((p) => p.slug === "sad-3").tools = "Ink pen";
// Nevan: match the résumé.
const coffee = projects.find((p) => p.slug === "coffee-maker");
Object.assign(coffee, { tools: "Python · Onshape", aiLabel: "AI-assisted" });
coffee.blocks[0].text = coffee.blocks[0].text.replace("to build the CAD model.", "to build the CAD model, which I then refined in Onshape.");

// Files renamed since the export.
const RENAMED = { "Aliens VFX/Draft 6.mp4": "Aliens VFX/Draft 6 Video Compression.mp4" };

// Screen recordings of a video player: keep only the playback, cropped above the player's controls.
const CLIPS = { trickshot: { start: 3.9, end: 15.25, crop: "crop=2268:1276:60:0" } };

// Handoff §5: the Geometry Nodes and short compositing clips can be muted.
const isMuted = (slug) => slug === "geo-nodes" || slug.startsWith("comp-");

// Poster frame, in seconds, where the default (15% in) lands on a bad frame.
const POSTER_AT = JSON.parse(fs.existsSync(path.join(import.meta.dirname, "poster-times.json")) ? fs.readFileSync(path.join(import.meta.dirname, "poster-times.json"), "utf8") : "{}");

function mediaItems(p) {
  const items = [];
  if (p.hero && p.hero.source) items.push(p.hero.type === "video" ? { ...p.hero, video: true } : p.hero);
  for (const b of p.blocks) {
    if (b.type === "image") items.push(b);
    if (b.type === "video") items.push({ ...b, video: true });
    if (b.type === "grid") items.push(...b.items);
  }
  return items;
}

// "frame @5s of X" / "page 2 of X" / "embedded image i-003 of X" / "X", minus trailing notes.
function parseSource(raw) {
  const s = raw.replace(/\s*\((the build|pdfimages|or ).*\)$/, "");
  let m;
  if ((m = s.match(/^frame @(\d+)s of (.*)$/))) return { kind: "frame", at: Number(m[1]), file: m[2] };
  if ((m = s.match(/^page (\d+) of (.*)$/))) return { kind: "page", page: Number(m[1]), file: m[2] };
  if ((m = s.match(/^embedded image (i-\d+) of (.*)$/))) return { kind: "embedded", image: m[1], file: m[2] };
  return { kind: "file", file: s };
}

// Screen recordings have a narrow no-break space before AM/PM, so match loosely.
const loose = (s) => s.normalize("NFC").replace(/[  ]/g, " ");
function resolve(file) {
  const full = path.normalize(path.join(WORKS, RENAMED[file] ?? file));
  if (fs.existsSync(full)) return full;
  const dir = path.dirname(full);
  const hit = fs.readdirSync(dir).find((f) => loose(f) === loose(path.basename(full)));
  if (!hit) throw new Error(`Source not found: ${file}`);
  return path.join(dir, hit);
}

function renderPage(pdf, page) {
  const prefix = path.join(TMP, `page-${path.basename(pdf, ".pdf").replace(/\W+/g, "_")}-${page}`);
  execFileSync("pdftoppm", ["-r", "150", "-png", "-singlefile", "-f", String(page), "-l", String(page), pdf, prefix]);
  return `${prefix}.png`;
}

function embeddedImage(pdf, image) {
  const dir = path.join(TMP, `embedded-${path.basename(pdf, ".pdf").replace(/\W+/g, "_")}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    execFileSync("pdfimages", ["-j", "-png", pdf, path.join(dir, "i")]);
  }
  const hit = fs.readdirSync(dir).find((f) => f.startsWith(`${image}.`));
  if (!hit) throw new Error(`${image} not found in ${pdf}`);
  return path.join(dir, hit);
}

async function runMedia(only) {
  fs.mkdirSync(TMP, { recursive: true });
  const videos = [];
  let images = 0;
  for (const p of projects) {
    if (only && !only.includes(p.slug)) continue;
    const dir = path.join(MEDIA, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    for (const m of mediaItems(p)) {
      const src = parseSource(m.source);
      const file = resolve(src.file);
      if (m.video) {
        videos.push({ slug: p.slug, key: m.key, file });
        continue;
      }
      const out = path.join(dir, `${m.key}.jpg`);
      if (fs.existsSync(out)) continue;
      let input = file;
      if (src.kind === "frame") {
        input = path.join(TMP, `${p.slug}-${m.key}.png`);
        grabFrame(file, src.at, input);
      } else if (src.kind === "page") input = renderPage(file, src.page);
      else if (src.kind === "embedded") input = embeddedImage(file, src.image);
      await optimizeImage(input, out);
      images++;
    }
  }
  console.log(`images done (${images} new). ${videos.length} videos queued.`);
  for (const v of videos) {
    const base = path.join(MEDIA, v.slug, v.key);
    const poster = `${base}.jpg`;
    if (!fs.existsSync(poster)) {
      const frame = path.join(TMP, `${v.slug}-${v.key}-poster.png`);
      grabFrame(v.file, POSTER_AT[v.key] ?? probe(v.file).duration * 0.15, frame, CLIPS[v.key]?.crop);
      await optimizeImage(frame, poster);
    }
    if (fs.existsSync(`${base}.mp4`)) continue;
    const started = Date.now();
    // Write beside the target first so a stopped run never leaves a half-finished file.
    const part = path.join(TMP, `${v.slug}-${v.key}.mp4`);
    encodeVideo(v.file, part, { audio: !isMuted(v.slug), clip: CLIPS[v.key] });
    fs.copyFileSync(part, `${base}.mp4`);
    fs.rmSync(part);
    console.log(`${v.slug}/${v.key}.mp4  ${(fs.statSync(`${base}.mp4`).size / 1e6).toFixed(1)} MB  ${Math.round((Date.now() - started) / 1000)}s`);
  }
  console.log("MEDIA DONE");
}

// ---- mdx ----

// Archive row text, order and thumbnail crop come from the approved Archive mockup.
function archiveInfo() {
  const src = fs.readFileSync(path.join(WORK, "mockup", "Archive.dc.html"), "utf8");
  const info = {};
  let i = 0;
  for (const m of src.matchAll(/P\('([^']+)', '[^']*', '([^']*)', '[^']*'(?:, (?:true|false))?(?:, '([^']*)')?\)/g)) {
    info[m[1]] = { meta: m[2], order: ++i, pos: m[3] };
  }
  return info;
}

const DISCIPLINE = {
  "3d": ["3D"],
  comp: ["Compositing", "VFX"],
  code: ["Programming"],
  film: ["Film"],
  motion: ["Motion"],
  design: ["Design"],
  drawing: ["Drawing"],
  color: ["Color"],
};

// Search-only keywords. Drawn from each project's approved text and tools; shown only in "Matched".
const TAGS = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "search-tags.json"), "utf8"));

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ""));
const url = (slug, key, ext) => `/media/${slug}/${key}.${ext}`;

async function imageMedia(p, m, extra = {}) {
  const src = url(p.slug, m.key, "jpg");
  const meta = await sharp(path.join(SITE, "public", src)).metadata();
  const alt = m.caption && !/^\d+$/.test(m.caption) ? `${p.title}: ${m.caption}` : p.title;
  return clean({ type: "image", src, alt, width: meta.width, height: meta.height, caption: m.caption, ...extra });
}

const videoMedia = (p, m) => clean({ type: "video", src: url(p.slug, m.key, "mp4"), poster: url(p.slug, m.key, "jpg"), caption: m.caption });

async function hero(p) {
  const h = p.hero;
  if (!h) return undefined;
  if (h.type === "video") return videoMedia(p, h);
  if (h.type === "image") return imageMedia(p, h, { aspect: h.aspect, fit: h.fit });
  return { type: "placeholder", label: h.label };
}

async function block(p, b) {
  if (b.type === "text") return { type: "text", heading: b.heading, text: b.text };
  if (b.type === "subheading") return { type: "subheading", text: b.text };
  if (b.type === "video") return videoMedia(p, b);
  if (b.type === "image") return imageMedia(p, b);
  if (b.type === "grid") {
    return {
      type: "grid",
      minColumnWidth: b.minColumnWidth,
      aspect: b.aspect,
      fit: b.fit,
      items: await Promise.all(b.items.map((i) => imageMedia(p, i))),
    };
  }
  return { type: "placeholder", label: b.label ?? b.text };
}

async function runMdx() {
  const info = archiveInfo();
  fs.mkdirSync(OUT, { recursive: true });
  for (const p of projects) {
    const a = info[p.slug];
    if (!a) console.warn(`no archive row in the mockup for ${p.slug}`);
    const data = clean({
      slug: p.slug,
      title: p.title,
      term: p.term,
      date: p.date,
      foundational: p.foundational,
      featured: p.featured,
      order: p.featuredOrder,
      group: p.group,
      archiveOrder: a?.order,
      meta: p.slug === "coffee-maker" ? "Python · Onshape · personal" : a?.meta,
      thumbPos: a?.pos,
      role: p.role,
      tools: p.tools ? p.tools.split(" · ") : undefined,
      discipline: DISCIPLINE[p.group],
      tags: TAGS[p.slug] ?? [],
      aiLabel: p.aiLabel ?? undefined,
      description: p.description,
      hero: await hero(p),
      blocks: await Promise.all(p.blocks.map((b) => block(p, b))),
    });
    fs.writeFileSync(path.join(OUT, `${p.slug}.mdx`), matter.stringify("", data, { lineWidth: -1 }));
  }
  console.log(`wrote ${projects.length} projects`);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "media") await runMedia(rest.length ? rest : null);
else if (cmd === "mdx") await runMdx();
else console.log("usage: import-projects.mjs media [slug…] | mdx");
