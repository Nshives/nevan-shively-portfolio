# Nevan Shively portfolio

Next.js (App Router) + TypeScript + Tailwind. Static pages, one MDX file per project.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # also validates all project content
```

- Adding work, media, frontmatter and writing rules: **[CONTENT-GUIDE.md](CONTENT-GUIDE.md)**
- Design and product decisions: `../Claude Work/BUILD-BRIEF.md`, then `BUILD-HANDOFF-2.md`, which overrides it

## Layout

```
content/projects/   one .mdx per project, all frontmatter (_template.mdx is the starter)
public/media/<slug> optimized media per project
scripts/            content checks, first-import scripts, media optimizer
src/app/            pages: / · /work/[slug] · /archive · /about · /contact
src/components/     Header, Footer, Media, Reel, Search, cards
src/config/site.ts  links, reel, search chips and synonyms
src/lib/            schema + loader (projects.ts), search scoring (search.ts)
```

## Search

v1 runs in the browser. The home page ships a small index (title, tags, tools, discipline, role, all written text, `searchText`) built at build time. Query words that appear nowhere in the work are ignored, which is why pasting a whole job description works. Score = weighted field matches (title/tags/tools 3, discipline 2, role 1.5, body 1) ÷ the best possible, × a weight (featured 1.0, others 0.85, foundational 0.7). Foundational work shows in its own panel: top 3 above 25% by default, everything when the checkbox is on. The query is mirrored to `/?q=…` so results can be shared.

v2 (later): embeddings at build time + a serverless query endpoint, same `SearchHit` shape, silent fallback to v1.
