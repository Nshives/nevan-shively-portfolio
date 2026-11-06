import { z } from "zod";

const path = z.string().startsWith("/");
const aspect = z.string().regex(/^\d+\/\d+$/, 'aspect like "16/9"');
const fit = z.enum(["contain", "cover"]);

const image = z.object({
  type: z.literal("image"),
  src: path,
  alt: z.string().min(1, "images need alt text"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
}).strict();

const video = z.object({
  type: z.literal("video"),
  src: path,
  poster: path.optional(),
  caption: z.string().optional(),
}).strict();

const vimeo = z.object({
  type: z.literal("vimeo"),
  id: z.string().regex(/^\d+(\/[a-z0-9]+)?$/i, "Vimeo id like 123456789 or 123456789/abcdef"),
  title: z.string().min(1),
  poster: path.optional(),
  caption: z.string().optional(),
}).strict();

// Renders as a dashed todo box with its label.
const placeholder = z.object({ type: z.literal("placeholder"), label: z.string().min(1) }).strict();

// Hero: an image also says how it sits in its frame.
const heroSchema = z.union([
  image.extend({ aspect, fit }).strict(),
  video,
  vimeo,
  placeholder,
]);

// The page body, rendered in exactly this order.
const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), heading: z.string().min(1), text: z.string().min(1) }).strict(),
  z.object({ type: z.literal("subheading"), text: z.string().min(1) }).strict(),
  video,
  vimeo,
  image,
  z.object({
    type: z.literal("grid"),
    minColumnWidth: z.string().regex(/^\d+px$/, 'width like "520px"'),
    aspect,
    fit,
    items: z.array(image).min(1),
  }).strict(),
  placeholder,
]);

export const AI_LABELS = ["Built solo", "AI-assisted", "AI-accelerated"] as const;

const TERM = /^((Fall|Winter|Spring|Summer) \d{4}|Before SCAD|\[.*\])$/;

export const frontmatterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase-with-dashes"),
  title: z.string().min(1),
  term: z.string().regex(TERM, '"Fall 2026", "Before SCAD", or "[date]" until it\'s known'),
  date: z.string().regex(/^(\d{4}(-(0[1-9]|1[0-2]))?|\[DATE\])$/, 'YYYY-MM, YYYY, or "[DATE]"'),
  foundational: z.boolean().default(false),
  featured: z.boolean().default(false),
  order: z.number().int().optional(),
  inProgress: z.boolean().default(false),
  group: z.string().min(1),
  archiveOrder: z.number().int().optional(),
  meta: z.string().optional(),
  thumb: path.optional(),
  thumbPos: z.string().optional(),
  role: z.string().optional(),
  tools: z.array(z.string()).default([]),
  discipline: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  aiLabel: z.enum(AI_LABELS).optional(),
  description: z.string().optional(),
  hero: heroSchema.optional(),
  blocks: z.array(blockSchema).default([]),
  searchText: z.string().default(""),
  course: z.string().optional(),
}).strict().refine((p) => !p.featured || p.order !== undefined, {
  message: "featured projects need an `order`",
  path: ["order"],
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type Hero = NonNullable<Frontmatter["hero"]>;
export type Block = Frontmatter["blocks"][number];
export type Project = Frontmatter & { file: string };

// A string still waiting on Nevan, e.g. "[medium]".
export const isTodo = (s: string) => /^\[.*\]$/.test(s.trim());

// Newest term first, then Before SCAD, then anything with no date yet.
const SEASON: Record<string, number> = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };
export function termRank(term: string) {
  const m = term.match(/^(\w+) (\d{4})$/);
  if (m) return -(Number(m[2]) * 10 + SEASON[m[1]]);
  return term === "Before SCAD" ? 1 : 2;
}
export const termLabel = (term: string) => (isTodo(term) ? "Date to confirm" : term);
