#!/usr/bin/env node
// Turn originals into web versions in public/media/<slug>/.
//
//   npm run media -- <slug> <file or folder> [more…]
//
// Images (jpg/png/tif/webp; flatten PSDs to PNG first) → <name>.jpg at max 2400px
//   wide. next/image serves resized AVIF/WebP from it automatically.
// Videos (mov/mp4/mkv/webm) → <name>.mp4 (H.264, no audio, ≤1920px, CRF 24),
//   <name>.webm (VP9) and <name>.jpg poster from the first second.
//   Add --audio to keep sound (e.g. for a reel). Long pieces belong on Vimeo.
//
// Originals are never modified. Needs ffmpeg on PATH for video.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const IMG = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".heic"]);
const VID = new Set([".mov", ".mp4", ".m4v", ".mkv", ".webm"]);
const MAX_MB = 20;

const args = process.argv.slice(2);
const keepAudio = args.includes("--audio");
const [slug, ...inputs] = args.filter((a) => !a.startsWith("--"));
if (!slug || !inputs.length) {
  console.error("Usage: npm run media -- <slug> <file or folder> [more…] [--audio]");
  process.exit(1);
}

const outDir = path.resolve("public", "media", slug);
fs.mkdirSync(outDir, { recursive: true });

const files = inputs.flatMap((p) =>
  fs.statSync(p).isDirectory() ? fs.readdirSync(p).map((f) => path.join(p, f)) : [p],
);

const name = (f) =>
  path
    .basename(f, path.extname(f))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  const base = path.join(outDir, name(f));
  if (IMG.has(ext)) {
    const img = sharp(f).rotate();
    const meta = await img.metadata();
    await img.resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`);
    report(`${base}.jpg`, `${meta.width}×${meta.height}`);
  } else if (VID.has(ext)) {
    const scale = "scale='min(1920,iw)':-2";
    const audio = keepAudio ? ["-c:a", "aac", "-b:a", "160k"] : ["-an"];
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", f, "-vf", scale, "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", ...audio, `${base}.mp4`], { stdio: "inherit" });
    const webmAudio = keepAudio ? ["-c:a", "libopus", "-b:a", "128k"] : ["-an"];
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", f, "-vf", scale, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", ...webmAudio, `${base}.webm`], { stdio: "inherit" });
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1", "-i", f, "-frames:v", "1", "-vf", scale, "-q:v", "3", `${base}.jpg`], { stdio: "inherit" });
    report(`${base}.mp4`);
    report(`${base}.webm`);
    report(`${base}.jpg`, "poster");
  } else {
    console.log(`skip  ${f}`);
  }
}

function report(file, note = "") {
  const mb = fs.statSync(file).size / 1e6;
  const rel = "/" + path.relative(path.resolve("public"), file).split(path.sep).join("/");
  const warn = mb > MAX_MB ? `  ⚠ over ${MAX_MB} MB, put it on Vimeo instead` : "";
  console.log(`wrote ${rel}  ${mb.toFixed(1)} MB ${note}${warn}`);
}
