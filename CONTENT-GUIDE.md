# Content guide

How projects are stored, how to add one, and the rules every word on the site follows. Read this before adding or editing any project (people and Claude sessions both).

## Add a project (the short version)

```bash
npm run new-project -- my-project "My Project"   # creates content/projects/my-project.mdx + public/media/my-project/
npm run media -- my-project ~/path/to/exports    # optimizes images/clips into public/media/my-project/
# edit content/projects/my-project.mdx: fill in the fields and blocks, pointing at the files the media script printed
npm run content:check                            # validates everything, lists open [todos]
npm run dev                                      # look at it on http://localhost:3000
```

The archive, search index, featured strip and related cards all pick it up automatically.

The first 38 projects were generated from the approved export, `../Claude Work/projects.json`, by `scripts/import-projects.mjs`. Running its `mdx` command again overwrites `content/projects/`, so once you've edited files by hand, edit them directly from then on. `scripts/verify-import.ts` confirms the generated text still matches the export word for word.

## Media

- Originals stay in `../Works/` (outside the repo, never modified). Only optimized web versions go in `public/media/<slug>/`.
- `npm run media -- <slug> <files or folders>`:
  - images → `<name>.jpg`, max 2400 px wide. `next/image` makes the AVIF/WebP sizes.
  - videos → `<name>.mp4` (1080p H.264, up to 4 Mbps, faststart, under ~40 MB, sound kept) + `<name>.jpg` poster. Add `--mute` to drop sound. Pieces too long to stay under 40 MB at a good bitrate drop to 720p.
  - Flatten PSDs to PNG first.
- Long pieces are better on **Vimeo** once uploaded: swap the block for `{ type: "vimeo", id: "123456789", title: "…", poster: "/media/slug/x.jpg" }`.
- `.psd`, `.mov`, `.step`, `.blend` and friends are in `.gitignore`, so originals can't be committed by accident.

## Project file

File: `content/projects/<slug>.mdx`. Everything is frontmatter; nothing goes below it. The build **fails** if any field is wrong, and `npm run content:check` tells you which file and field.

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | lowercase-with-dashes, must equal the file name |
| `title` | yes | |
| `term` | yes | shown as When, and the archive group: `Fall 2026`, `Before SCAD`, or `[date]` until known (grouped under "Date to confirm") |
| `date` | yes | `2026-10`, `2025`, or `[DATE]`. Sorts inside a term |
| `group` | yes | `3d`, `comp`, `code`, `film`, `motion`, `design`, `drawing`, `color`. Related cards show the same group first |
| `foundational` | | `true` for foundations classes, beginner exercises, pre-SCAD work. Gets a badge, and search shows it only in the "Foundations and earlier work" panel |
| `featured` + `order` | | `featured: true` puts it in the home strip, sorted by `order` |
| `inProgress` | | shows an "In progress" badge |
| `role` | | team projects state the actual role. Empty fields are hidden |
| `tools` | | `[Nuke, "[editor]"]`. A `[bracketed]` value renders as a todo |
| `aiLabel` | | `Built solo` · `AI-assisted` · `AI-accelerated`. Leave it out until known (see below) |
| `description` | | one paragraph under the title |
| `hero` | | media (below). Images also need `aspect` and `fit` |
| `blocks` | | the page body, rendered in exactly the order written |
| `meta` | | archive row's mono line. Defaults to the tools |
| `archiveOrder` | | position inside a term in the archive |
| `thumb`, `thumbPos` | | card picture and CSS crop like `center 35%`. Defaults to the hero, then the first image or video in the blocks |
| `discipline`, `tags`, `searchText` | | extra search words, never shown |
| `course` | | internal only, never shown |

### Blocks

```yaml
blocks:
  - { type: text, heading: Process, text: "Paragraph.\n\nSecond paragraph." }
  - { type: subheading, text: "Separates pieces on one page" }
  - { type: video, src: /media/slug/x.mp4, poster: /media/slug/x.jpg, caption: "Optional" }
  - { type: vimeo, id: "123456789", title: "Full film", poster: /media/slug/x.jpg }
  - { type: image, src: /media/slug/x.jpg, alt: "What's in it", width: 1920, height: 1080, caption: "Optional" }  # full width, uncropped
  - type: grid
    minColumnWidth: 520px
    aspect: 4/3
    fit: contain        # or cover
    items:
      - { type: image, src: /media/slug/y.jpg, alt: "…", width: 1600, height: 1200, caption: "Mono caption" }
  - { type: placeholder, label: "[ what goes here ]" }   # dashed todo box
```

The only written sections are the **description** and **Process**. A paragraph written entirely in `[brackets]` renders as a dashed todo box, so known gaps stay visible, and `content:check` lists them.

### AI build labels

One honest label per project:

- **Built solo**: he wrote it. Occasional troubleshooting help is fine.
- **AI-assisted**: AI as tutor or debugger. The architecture is his.
- **AI-accelerated**: significant generation, directed and understood by him.

If unknown, leave the field out and ask Nevan. Never guess.

## Rules for every word on the site

1. **Let the work speak.** No manifestos, taglines or life-story arcs.
2. **Defensible.** Nothing Nevan couldn't defend for two minutes to someone in the field. Never invent facts, numbers, dates, tools, team sizes or outcomes. Unknown → visible placeholder like `[medium]`.
3. **Mark inferences.** A sentence inferred from files rather than told by Nevan gets `[UNVERIFIED]`. He confirms it or it's cut. `content:check` counts them.
4. **Team projects state Nevan's actual role.**
5. **One honest AI label** (above).
6. **Voice:** a smart person explaining their work plainly. Short, specific, a little self-critical. Banned (flagged by `content:check`): leveraged, utilized, passionate about, seamlessly, cutting-edge, delve, showcase, robust, journey.
7. **No course codes as headings.** Course info goes in `course` only. Never label anything "Highschool"; use the date.

## Where other things live

| What | Where |
|---|---|
| Email, GitHub, résumé, social links | `src/config/site.ts` → `links` (empty = shows a `[PLACEHOLDER]`) |
| Reel video | `src/config/site.ts` → `reel` (empty = first featured project with a video, as a silent loop) |
| Suggested search chips | `src/config/site.ts` → `searchChips` |
| Search synonyms (UE5 = Unreal …) | `src/config/site.ts` → `searchSynonyms` |
| Portrait | `src/app/about/page.tsx` → `portrait` |
| Logo | `public/logo-mark-nav.svg`, favicon `src/app/icon.svg` |
| Colors and type | `src/app/globals.css` (`@theme` tokens) |
| Fonts (Encamp swap) | `src/app/layout.tsx` |
| Search scoring | `src/lib/search.ts` |
