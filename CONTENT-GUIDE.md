# Content guide

How projects are stored, how to add one, and the rules every word on the site follows. Read this before adding or editing any project (people and Claude sessions both).

## Add a project (the short version)

```bash
npm run new-project -- coffee-maker "Custom Coffee Maker"   # creates content/projects/coffee-maker.mdx + public/media/coffee-maker/
npm run media -- coffee-maker ~/path/to/exports              # optimizes images/clips into public/media/coffee-maker/
# edit content/projects/coffee-maker.mdx: frontmatter + write-up, point hero/thumb/gallery at the files the media script printed
npm run content:check                                        # validates everything, lists open [TODOS]
npm run dev                                                  # look at it on http://localhost:3000
```

That's it. The archive, search index, featured strip and related cards all pick it up automatically.

When the real work is in, remove the fake projects:

```bash
npm run placeholders              # list them
npm run placeholders -- --remove  # delete them and their media folders
```

## Media

- Originals stay in `../Works/` (outside the repo). Only optimized web versions go in `public/media/<slug>/`.
- `npm run media -- <slug> <files or folders>`:
  - images → `<name>.jpg`, max 2400 px wide. `next/image` makes the AVIF/WebP sizes.
  - videos → `<name>.mp4` + `<name>.webm` (muted, ≤1920 px) + `<name>.jpg` poster. Add `--audio` to keep sound.
  - Flatten PSDs to PNG first. It warns on anything over 20 MB.
- Short loops (under ~30 s) are self-hosted. The reel and anything long goes on **Vimeo**, embedded with `{ type: "vimeo", id: "123456789", title: "…" }`.
- `.psd`, `.mov`, `.step`, `.blend` and friends are in `.gitignore`, so originals can't be committed by accident.

## Frontmatter

File: `content/projects/<slug>.mdx`. The build **fails** if any field is wrong, and `npm run content:check` tells you which file and field.

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | lowercase-with-dashes, must equal the file name |
| `title` | yes | |
| `date` | yes | `"2026-08"`, or `"2026"` if the month is unknown. Drives archive order and grouping |
| `tier` | yes | `1` featured case study · `2` selected · `3` brief. Search weight 1.0 / 0.85 / 0.7 |
| `foundational` | | `true` for foundations classes, beginner exercises, pre-SCAD work. Shown in search only in the "Foundations and earlier work" panel |
| `featured` + `order` | | `featured: true` puts it in the home strip, sorted by `order` |
| `inProgress` | | shows an "In progress" badge |
| `type` | yes | `personal` · `class` · `freelance` |
| `course` | | internal only, never shown |
| `role` | yes | e.g. `Solo`, `Lead programmer`. Team projects state the actual role |
| `team` | | `[{ name, role }]` |
| `tools` | | `["Houdini", "Nuke"]`. Use `"[TOOLS]"` until known |
| `discipline` | yes | `["VFX", "Compositing"]`. First one shows in result meta |
| `tags` | | search keywords. Tags and tools weigh the most in search |
| `aiLabel` | yes | `Built solo` · `AI-assisted` · `AI-accelerated` · `[ASK NEVAN]` (see below) |
| `hero` | | media (below). Top of the project page, 16:8 |
| `thumb` | | `/media/<slug>/thumb.jpg`. Falls back to the hero image or video poster |
| `thumbLabel` | | text in the hatched frame while there's no thumb |
| `gallery` | | list of media, 2-up 4:3 grid |
| `final` | | one media item after the gallery, 16:9 |
| `searchText` | | extra words for search only, never shown |
| `placeholder` | | `true` only on the fake seed projects |

**Media** is one of:

```yaml
{ type: "image", src: "/media/slug/still.jpg", alt: "What's in the image" }
{ type: "video", src: "/media/slug/loop.mp4", webm: "/media/slug/loop.webm", poster: "/media/slug/loop.jpg" }
{ type: "vimeo", id: "123456789", title: "Full film" }     # private links: "123456789/abcdef1234"
{ type: "placeholder", label: "[hero clip]" }              # hatched frame until the media exists
```

Any of them can take `caption: "…"`.

### AI build labels

One honest label per project:

- **Built solo**: he wrote it. Occasional troubleshooting help is fine.
- **AI-assisted**: AI as tutor or debugger. The architecture is his.
- **AI-accelerated**: significant generation, directed and understood by him.

If unknown, use `[ASK NEVAN]`. Never guess.

## Body

Markdown under the frontmatter. Text before the first `##` is the intro (1–2 sentences). Then:

```md
## The hard part      ← the most important section: what broke and how it got fixed
## Process            ← short, including one thing that failed
## What I'd do differently
```

- Sections only render if they have content. Leave them out freely: a tier-3 project can be one sentence.
- Any other `## Heading` renders after Process, in the order written. The long case study is a ceiling for tier-1 work, not a requirement.
- A paragraph written entirely in `[brackets]` renders as a dashed "todo" box, so unfinished bits stay visible and searchable via `npm run content:check`. Bracketed prompts are left out of the search index.

## Rules for every word on the site

1. **Let the work speak.** No manifestos, taglines or life-story arcs.
2. **Defensible.** Nothing Nevan couldn't defend for two minutes to someone in the field. Never invent facts, numbers, dates, tools, team sizes or outcomes. Unknown → visible placeholder like `[TOOLS]`.
3. **Mark inferences.** A sentence inferred from files rather than told by Nevan gets `[UNVERIFIED]`. He confirms it or it's cut. `content:check` counts them.
4. **Team projects state Nevan's actual role.**
5. **One honest AI label** (above).
6. **Voice:** a smart person explaining their work plainly. Short, specific, a little self-critical. Banned (flagged by `content:check`): leveraged, utilized, passionate about, seamlessly, cutting-edge, delve, showcase, robust, journey.
7. **No course codes as headings.** Course info goes in `course` only. Never label anything "Highschool"; use the date.

## Where other things live

| What | Where |
|---|---|
| Email, GitHub, résumé, social links | `src/config/site.ts` → `links` (empty = shows a `[PLACEHOLDER]`) |
| Reel video | `src/config/site.ts` → `reel` (empty = first featured project with a video hero) |
| Suggested search chips | `src/config/site.ts` → `searchChips` |
| Search synonyms (UE5 = Unreal …) | `src/config/site.ts` → `searchSynonyms` |
| Portrait | `src/app/about/page.tsx` → `portrait` |
| Logo | `src/components/Logo.tsx` |
| Colors and type | `src/app/globals.css` (`@theme` tokens) |
| Fonts (Encamp swap) | `src/app/layout.tsx` |
| Search scoring | `src/lib/search.ts` |
