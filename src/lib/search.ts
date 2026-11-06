// Search v1: keyword + tag scoring over an index built at build time.
// Pure functions, no network. v2 (embeddings) can replace `searchIndex` and fall
// back to it on any error; the UI only depends on the SearchHit shape.

export type IndexEntry = {
  slug: string;
  title: string;
  term: string;
  discipline: string[];
  tags: string[];
  tools: string[];
  role: string;
  tier: 1 | 2 | 3;
  foundational: boolean;
  thumb?: string;
  thumbPos?: string;
  body: string; // all written text + searchText
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
  etc including such other who what how about all any more new well across help ensure must should would also like responsibilities requirements artist artists creative build building write
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

// Every synonym mapped to its group's key, longest phrase first.
function buildSynonyms(groups: string[][]) {
  const pairs: [string, string][] = [];
  for (const g of groups) for (const term of g) pairs.push([normalize(term).trim(), g[0]]);
  return new Map(pairs.sort((a, b) => b[0].length - a[0].length));
}

// Expand text into a set of searchable keys. Phrases are taken out as they match,
// so "After Effects" doesn't also count as "effects", or "Hunger Games" as "games".
function keysOf(text: string, syn: Map<string, string>) {
  const keys = new Set<string>();
  let n = normalize(text);
  for (const [term, canon] of syn) {
    const phrase = ` ${term} `;
    if (!n.includes(phrase)) continue;
    keys.add(`=${canon}`);
    while (n.includes(phrase)) n = n.replace(phrase, " ");
  }
  for (const t of tokens(n)) keys.add(syn.has(t) ? `=${syn.get(t)}` : t);
  return keys;
}

export function searchIndex(
  index: IndexEntry[],
  query: string,
  synonyms: string[][] = [],
): SearchHit[] {
  const syn = buildSynonyms(synonyms);
  const cache = new Map<string, Set<string>>();
  const keysFor = (text: string) => {
    let keys = cache.get(text);
    if (!keys) cache.set(text, (keys = keysOf(text, syn)));
    return keys;
  };
  // Each tag or tool is its own phrase, so words never run across two of them.
  const keysOfList = (list: string[]) => new Set(list.flatMap((t) => [...keysFor(t)]));

  // Pre-compute field keys per entry.
  const fields = index.map((e) => {
    const f: Record<Field, Set<string>> = {
      title: keysFor(e.title),
      tags: keysOfList(e.tags),
      tools: keysOfList(e.tools),
      discipline: keysOfList(e.discipline),
      role: keysFor(e.role),
      body: keysFor(e.body),
    };
    return f;
  });

  // Only query keys that exist somewhere in the corpus count; this is what lets a
  // pasted job description work without its filler dragging every score down.
  const vocab = new Set<string>();
  for (const f of fields) for (const set of Object.values(f)) for (const k of set) vocab.add(k);
  const effective = [...keysOf(query, syn)].filter((k) => vocab.has(k));
  // Stems read badly in "why it matched", so remember the words as typed.
  const asTyped = new Map<string, string>();
  for (const w of normalize(query).split(/[\s-]+/)) if (w) asTyped.set(stem(w), w);
  if (!effective.length) return [];

  // Five strong matches count as a perfect fit, so a long pasted posting can still score high.
  const maxPossible = Math.min(effective.length, 5) * FIELD_WEIGHT.title;

  // Display labels for "why it matched": tags/tools/discipline whose keys hit.
  const labelFor = (e: IndexEntry, k: string) =>
    [...e.tags, ...e.tools, ...e.discipline].find((t) => keysFor(t).has(k));

  const hits: SearchHit[] = [];
  index.forEach((entry, i) => {
    let raw = 0;
    const labels = new Set<string>();
    const bodyWords: string[] = [];
    const titleWords: string[] = [];
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
      else if (bestField === "title") titleWords.push(k);
      else if (bestField === "body" || bestField === "role") bodyWords.push(k);
    }
    if (raw === 0) return;
    const score = Math.min(1, raw / maxPossible) * TIER_WEIGHT[entry.tier];
    // Only names what actually matched: tags, tools and disciplines, then title words, then words in the text.
    const typed = (k: string) => asTyped.get(k.replace(/^=/, "")) ?? k.replace(/^=/, "");
    const words = bodyWords.map(typed);
    const parts = [...[...labels].slice(0, 5), ...titleWords.map(typed)];
    if (words.length) parts.push(`in the write-up: ${words.slice(0, 4).join(", ")}`);
    hits.push({
      entry,
      score,
      pct: Math.max(1, Math.round(score * 100)),
      why: parts.join(", "),
      matchedTerms: [...labels],
    });
  });

  return hits.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
}

// Foundational matches: hidden unless they clear the threshold, capped by default.
export const FOUNDATIONAL_THRESHOLD = 0.25;
export const FOUNDATIONAL_CAP = 3;
