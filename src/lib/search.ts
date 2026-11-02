// Search v1: keyword + tag scoring over an index built at build time.
// Pure functions, no network. v2 (embeddings) can replace `searchIndex` and fall
// back to it on any error; the UI only depends on the SearchHit shape.

export type IndexEntry = {
  slug: string;
  title: string;
  year: string;
  discipline: string[];
  tags: string[];
  tools: string[];
  role: string;
  aiLabel: string;
  tier: 1 | 2 | 3;
  foundational: boolean;
  thumb?: string;
  thumbLabel: string;
  body: string; // plain text of the MDX body + searchText
};

export type SearchHit = {
  entry: IndexEntry;
  score: number; // 0..1 after tier weight
  pct: number; // 0..100, shown as the match bar
  why: string;
  matchedTerms: string[];
};

const TIER_WEIGHT = { 1: 1, 2: 0.85, 3: 0.7 } as const;
const FIELD_WEIGHT = { title: 3, tags: 3, tools: 3, discipline: 2, role: 1.5, body: 1 } as const;
type Field = keyof typeof FIELD_WEIGHT;

// Filler common in job postings. Words not in any project are ignored anyway;
// this list only stops very common words from matching body text.
const STOP = new Set(
  `a an and are as at be but by can for from has have i in into is it its of on or our that the their them this to we with you your will work
  working experience team strong ability skills knowledge looking intern internship role junior senior years year plus able using use used
  etc including such other who what how about all any more new well across help ensure must should would also like responsibilities requirements
  preferred qualifications candidate job position company studio within both one two own make made out up get set based level`
    .split(/\s+/)
    .filter(Boolean),
);

export function normalize(s: string) {
  return ` ${s.toLowerCase().replace(/[^a-z0-9+#\s-]/g, " ").replace(/\s+/g, " ").trim()} `;
}

function stem(w: string) {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function tokens(s: string) {
  return normalize(s)
    .split(/[\s-]+/)
    .filter((w) => w && !STOP.has(w))
    .map(stem);
}

// Map every synonym (and its tokens) to a canonical key.
function buildSynonyms(groups: string[][]) {
  const map = new Map<string, string>();
  for (const g of groups) {
    const canon = g[0];
    for (const term of g) map.set(normalize(term).trim(), canon);
  }
  return map;
}

// Expand text into a set of searchable keys: stemmed tokens + canonical synonyms.
function keysOf(text: string, syn: Map<string, string>) {
  const keys = new Set(tokens(text));
  const n = normalize(text);
  for (const [term, canon] of syn) {
    if (!n.includes(` ${term} `)) continue;
    keys.add(`=${canon}`);
    // "real time" counts once, as =realtime, not again as "real" and "time".
    if (/[\s-]/.test(term)) for (const t of tokens(term)) keys.delete(t);
  }
  for (const k of [...keys]) {
    const canon = syn.get(k);
    if (canon) keys.add(`=${canon}`);
  }
  return keys;
}

export function searchIndex(
  index: IndexEntry[],
  query: string,
  synonyms: string[][] = [],
): SearchHit[] {
  const syn = buildSynonyms(synonyms);

  // Pre-compute field keys per entry.
  const fields = index.map((e) => {
    const f: Record<Field, Set<string>> = {
      title: keysOf(e.title, syn),
      tags: keysOf(e.tags.join(" , "), syn),
      tools: keysOf(e.tools.join(" , "), syn),
      discipline: keysOf(e.discipline.join(" , "), syn),
      role: keysOf(e.role, syn),
      body: keysOf(e.body, syn),
    };
    return f;
  });

  // Only query keys that exist somewhere in the corpus count; this is what lets a
  // pasted job description work without its filler dragging every score down.
  const vocab = new Set<string>();
  for (const f of fields) for (const set of Object.values(f)) for (const k of set) vocab.add(k);
  const qKeys = [...keysOf(query, syn)].filter((k) => vocab.has(k));
  // A synonym key already covers its plain token, so don't double count.
  const effective = qKeys.filter((k) => k.startsWith("=") || !qKeys.includes(`=${syn.get(k) ?? ""}`));
  if (!effective.length) return [];

  const maxPossible = effective.length * FIELD_WEIGHT.title;

  // Display labels for "why it matched": tags/tools/discipline whose keys hit.
  const labelFor = (e: IndexEntry, k: string) =>
    [...e.tags, ...e.tools, ...e.discipline].find((t) => keysOf(t, syn).has(k));

  const hits: SearchHit[] = [];
  index.forEach((entry, i) => {
    let raw = 0;
    const labels = new Set<string>();
    const bodyWords: string[] = [];
    let titleHit = false;
    for (const k of effective) {
      let best = 0;
      let bestField: Field | null = null;
      for (const field of Object.keys(FIELD_WEIGHT) as Field[]) {
        if (fields[i][field].has(k) && FIELD_WEIGHT[field] > best) {
          best = FIELD_WEIGHT[field];
          bestField = field;
        }
      }
      if (!bestField) continue;
      raw += best;
      const label = labelFor(entry, k);
      if (label) labels.add(label);
      else if (bestField === "title") titleHit = true;
      else if (bestField === "body" || bestField === "role") bodyWords.push(k.replace(/^=/, ""));
    }
    if (raw === 0) return;
    const score = Math.min(1, raw / maxPossible) * TIER_WEIGHT[entry.tier];
    const parts: string[] = [];
    if (labels.size) parts.push(`Matched: ${[...labels].slice(0, 5).join(", ")}`);
    if (titleHit) parts.push("title");
    if (bodyWords.length) parts.push(`${labels.size ? "also" : "Matched"} in write-up: ${bodyWords.slice(0, 4).join(", ")}`);
    hits.push({
      entry,
      score,
      pct: Math.max(1, Math.round(score * 100)),
      why: parts.join(" · "),
      matchedTerms: [...labels],
    });
  });

  return hits.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
}

// Foundational matches: hidden unless they clear the threshold, capped by default.
export const FOUNDATIONAL_THRESHOLD = 0.25;
export const FOUNDATIONAL_CAP = 3;
