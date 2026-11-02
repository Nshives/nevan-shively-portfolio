import { z } from "zod";

// One piece of media. "placeholder" renders the hatched frame with its label,
// so a project can be laid out before its media exists.
export const mediaSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("image"),
    src: z.string().startsWith("/"),
    alt: z.string().min(1, "images need alt text"),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    caption: z.string().optional(),
  }).strict(),
  z.object({
    type: z.literal("video"),
    src: z.string().startsWith("/"),
    webm: z.string().startsWith("/").optional(),
    poster: z.string().startsWith("/").optional(),
    alt: z.string().optional(),
    caption: z.string().optional(),
  }).strict(),
  z.object({
    type: z.literal("vimeo"),
    id: z.string().regex(/^\d+(\/[a-z0-9]+)?$/i, "Vimeo id like 123456789 or 123456789/abcdef"),
    title: z.string().min(1),
    caption: z.string().optional(),
  }).strict(),
  z.object({
    type: z.literal("placeholder"),
    label: z.string().min(1),
  }).strict(),
]);

export const AI_LABELS = ["Built solo", "AI-assisted", "AI-accelerated", "[ASK NEVAN]"] as const;

export const frontmatterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase-with-dashes"),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, "YYYY-MM or YYYY"),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  foundational: z.boolean().default(false),
  featured: z.boolean().default(false),
  order: z.number().int().optional(),
  inProgress: z.boolean().default(false),
  type: z.enum(["personal", "class", "freelance"]),
  course: z.string().default(""),
  role: z.string().min(1),
  team: z.array(z.object({ name: z.string(), role: z.string() }).strict()).default([]),
  tools: z.array(z.string()).default([]),
  discipline: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  aiLabel: z.enum(AI_LABELS),
  hero: mediaSchema.optional(),
  thumb: z.string().startsWith("/").optional(),
  thumbLabel: z.string().optional(),
  gallery: z.array(mediaSchema).default([]),
  final: mediaSchema.optional(),
  searchText: z.string().default(""),
  placeholder: z.boolean().default(false),
}).strict().refine((p) => !p.featured || p.order !== undefined, {
  message: "featured projects need an `order`",
  path: ["order"],
});

export type Media = z.infer<typeof mediaSchema>;
export type Frontmatter = z.infer<typeof frontmatterSchema>;

export type Project = Frontmatter & {
  year: number;
  body: string;
  file: string;
};

// A string still waiting on Nevan, e.g. "[TOOLS]" or "[ASK NEVAN]".
export const isTodo = (s: string) => /^\[.*\]$/.test(s.trim());
