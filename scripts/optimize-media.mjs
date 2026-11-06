#!/usr/bin/env node
// Turn originals into web versions in public/media/<slug>/.
//
//   npm run media -- <slug> <file or folder> [more…]
//
// Images (jpg/png/tif/webp; flatten PSDs to PNG first) → <name>.jpg at max 2400px
//   wide. next/image serves resized AVIF/WebP from it automatically.
// Videos (mov/mp4/mkv/webm) → <name>.mp4 (1080p H.264, up to 4 Mbps, under ~40 MB,
//   keeps sound) and a <name>.jpg poster. Add --mute to drop the sound, or
//   --max-mb=75 to let something important stay 1080p past the usual limit.
//
// Originals are never modified. Needs ffmpeg on PATH for video.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { encodeVideo, grabFrame, optimizeImage, probe } from "./media-lib.mjs";

const IMG = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".heic"]);
const VID = new Set([".mov", ".mp4", ".m4v", ".mkv", ".webm"]);

const args = process.argv.slice(2);
const mute = args.includes("--mute");
const maxMB = Number(args.find((a) => a.startsWith("--max-mb="))?.split("=")[1]) || undefined;
const [slug, ...inputs] = args.filter((a) => !a.startsWith("--"));
if (!slug || !inputs.length) {
  console.error("Usage: npm run media -- <slug> <file or folder> [more…] [--mute]");
  process.exit(1);
}

const outDir = path.resolve("public", "media", slug);
fs.mkdirSync(outDir, { recursive: true });

const files = inputs.flatMap((p) => (fs.statSync(p).isDirectory() ? fs.readdirSync(p).map((f) => path.join(p, f)) : [p]));
const name = (f) => path.basename(f, path.extname(f)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  const base = path.join(outDir, name(f));
  if (IMG.has(ext)) {
    await optimizeImage(f, `${base}.jpg`);
    report(`${base}.jpg`);
  } else if (VID.has(ext)) {
    encodeVideo(f, `${base}.mp4`, { audio: !mute, ...(maxMB ? { maxMB } : {}) });
    const frame = path.join(os.tmpdir(), `${name(f)}-poster.png`);
    grabFrame(f, probe(f).duration * 0.15, frame);
    await optimizeImage(frame, `${base}.jpg`);
    fs.rmSync(frame);
    report(`${base}.mp4`);
    report(`${base}.jpg`, "poster");
  } else {
    console.log(`skip  ${f}`);
  }
}

function report(file, note = "") {
  const mb = fs.statSync(file).size / 1e6;
  const rel = "/" + path.relative(path.resolve("public"), file).split(path.sep).join("/");
  console.log(`wrote ${rel}  ${mb.toFixed(1)} MB ${note}`);
}
