// Shared media helpers for optimize-media.mjs and import-projects.mjs.
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });

export function probe(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" });
  const o = JSON.parse(out);
  return {
    duration: Number(o.format.duration),
    hasAudio: o.streams.some((s) => s.codec_type === "audio"),
  };
}

const fit = (w, h) => `scale=w='min(${w},iw)':h='min(${h},ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`;

export async function optimizeImage(input, output) {
  await sharp(input).rotate().resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(output);
}

// 1080p H.264 at up to 4 Mbps, faststart. Long pieces get whatever bitrate keeps
// them under maxMB, dropping to 720p when that would be too low for 1080p.
export function encodeVideo(input, output, { audio = true, maxMB = 38 } = {}) {
  const { duration, hasAudio } = probe(input);
  const keepAudio = audio && hasAudio;
  const audioK = keepAudio ? 128 : 0;
  const videoK = Math.min(4000, Math.floor((maxMB * 8000) / duration - audioK));
  const vf = (videoK < 1500 ? fit(1280, 720) : fit(1920, 1080)) + ",format=yuv420p";
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", input, "-vf", vf,
    "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-maxrate", `${videoK}k`, "-bufsize", `${videoK * 2}k`,
    "-movflags", "+faststart",
    ...(keepAudio ? ["-c:a", "aac", "-b:a", `${audioK}k`] : ["-an"]),
    output,
  ]);
}

// One frame as a PNG, for a poster or an image taken from a video.
export function grabFrame(input, seconds, output) {
  run("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(seconds), "-i", input, "-frames:v", "1", "-vf", "format=rgb24", output]);
}
