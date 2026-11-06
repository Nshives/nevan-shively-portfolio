"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FOUNDATIONAL_CAP, FOUNDATIONAL_THRESHOLD, searchIndex, type IndexEntry, type SearchHit } from "@/lib/search";
import { searchChips, searchSynonyms } from "@/config/site";
import { Thumb } from "./Media";

// Search panel + inline results. The query (and the foundational checkbox) are
// mirrored in the URL as /?q=…&all=1 so results can be shared.
export function Search({ index }: { index: IndexEntry[] }) {
  const [query, setQuery] = useState("");
  const [ran, setRan] = useState<string | null>(null);
  const [includeAll, setIncludeAll] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const syncUrl = useCallback((q: string | null, all: boolean) => {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    if (all) url.searchParams.set("all", "1");
    else url.searchParams.delete("all");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  // Restore from a shared link.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q");
    const all = sp.get("all") === "1";
    if (all) setIncludeAll(true);
    if (q) {
      setQuery(q);
      setRan(q);
      requestAnimationFrame(() => document.getElementById("search")?.scrollIntoView());
    }
  }, []);

  const run = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRan(trimmed);
    syncUrl(trimmed, includeAll);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const clear = () => {
    setRan(null);
    setQuery("");
    syncUrl(null, includeAll);
  };

  const toggleAll = (v: boolean) => {
    setIncludeAll(v);
    syncUrl(ran, v);
  };

  const hits = useMemo(() => (ran ? searchIndex(index, ran, searchSynonyms) : []), [index, ran]);
  const main = hits.filter((h) => !h.entry.foundational);
  const foundAll = hits.filter((h) => h.entry.foundational);
  const foundTop = foundAll.filter((h) => h.score >= FOUNDATIONAL_THRESHOLD).slice(0, FOUNDATIONAL_CAP);
  const foundShown = includeAll ? foundAll : foundTop;
  const hiddenCount = foundAll.length - foundTop.length;
  const activeChip = searchChips.find((c) => c.query === query)?.label;

  return (
    <>
      <section id="search" className="wrap pt-24 scroll-mt-6">
        <form
          className="bg-panel border border-line-panel p-6 sm:p-10 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            run(query);
          }}
        >
          <div className="flex flex-col gap-2.5">
            <h2 className="disp m-0" style={{ fontSize: "clamp(30px,3.4vw,48px)" }}>
              Search my work
            </h2>
            <p className="m-0 text-text-3 text-[17px] leading-normal">
              Type anything: a skill, a tool, a kind of project. Or paste a full job description and get the projects that fit it best.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-stretch">
            <label htmlFor="q" className="flex-[999_1_520px] min-w-0 flex">
              <span className="sr-only">Search projects</span>
              <textarea
                id="q"
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    run(query);
                  }
                }}
                placeholder="e.g. Maya · Nuke · a game with a story · or paste a job posting"
                className="w-full text-[18px] leading-[1.4] text-text bg-ground border border-line-input px-[18px] py-4 resize-y placeholder:text-[#5F7596] focus:border-blue"
              />
            </label>
            <div className="flex-[1_1_200px] flex">
              <button type="submit" className="btn w-full">
                Search →
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="mono text-[11px] text-dim mr-1.5">Try</span>
            {searchChips.map((c) => (
              <button
                key={c.label}
                type="button"
                className="chip"
                aria-pressed={activeChip === c.label}
                onClick={() => {
                  setQuery(c.query);
                  run(c.query);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 border-t border-line pt-5 min-h-[44px]">
            <input
              type="checkbox"
              id="found"
              checked={includeAll}
              onChange={(e) => toggleAll(e.target.checked)}
              className="w-[22px] h-[22px] m-0 cursor-pointer accent-blue"
            />
            <label htmlFor="found" className="text-[16px] text-nav cursor-pointer">
              Include all foundational or beginner-level work
            </label>
          </div>
        </form>
      </section>

      <div aria-live="polite">
        {ran && (
          <section ref={resultsRef} className="wrap pt-14 scroll-mt-6" aria-label="Search results">
            <div className="flex justify-between items-baseline flex-wrap gap-3 border-b border-line pb-4">
              <h2 className="mono m-0 text-text text-[13px]">Best matches · {main.length}</h2>
              <button type="button" onClick={clear} className="mono bg-transparent border-0 text-blue-text hover:text-blue-hover cursor-pointer min-h-[44px] text-[11px] p-0">
                Clear results
              </button>
            </div>

            {main.length === 0 && (
              <p className="text-text-3 py-8 m-0">
                Nothing matched that{foundShown.length ? " outside the foundations work below" : ""}. Try a tool, a discipline or one of the suggestions above.
              </p>
            )}
            {main.map((h, i) => (
              <ResultRow key={h.entry.slug} hit={h} rank={i + 1} />
            ))}

            {foundShown.length > 0 && (
              <div className="pt-16">
                <div className="bg-panel-2 border border-line p-6 sm:p-8">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex flex-col gap-2.5 max-w-[700px]">
                      <h2 className="mono m-0 text-text text-[13px]">Foundations and earlier work · {foundShown.length}</h2>
                      <p className="m-0 text-[#9FB2CE] text-[15px] leading-[1.55]">
                        Fundamentals classes and work from before SCAD. Shown because they closely match your search.
                      </p>
                    </div>
                    {!includeAll && hiddenCount > 0 && (
                      <button type="button" className="chip" onClick={() => toggleAll(true)}>
                        Show all matches
                      </button>
                    )}
                  </div>
                  <div className="grid gap-6 mt-7" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))" }}>
                    {foundShown.map((h) => (
                      <Link key={h.entry.slug} href={`/work/${h.entry.slug}`} className="row flex flex-col gap-3 pb-2">
                        <Thumb src={h.entry.thumb} position={h.entry.thumbPos} aspect="16/10" sizes="(max-width: 700px) 100vw, 300px" label="[ still ]" />
                        <span className="mono text-[11px] text-muted">{metaOf(h.entry)}</span>
                        <h3 className="m-0 text-[19px] font-bold">{h.entry.title}</h3>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

const metaOf = (e: IndexEntry) => [e.term, ...e.tools.slice(0, 2)].join(" · ");

function ResultRow({ hit, rank }: { hit: SearchHit; rank: number }) {
  const e = hit.entry;
  return (
    <Link href={`/work/${e.slug}`} className="row flex flex-wrap gap-x-8 gap-y-5 items-center py-7 border-b border-line">
      <span className="disp text-[44px] text-[#2A4A78] w-[72px]">{String(rank).padStart(2, "0")}</span>
      <Thumb src={e.thumb} position={e.thumbPos} aspect="16/10" sizes="220px" label="[ still ]" className="flex-none" style={{ width: "min(100%, 220px)" }} />
      <div className="flex-[1_1_420px] min-w-0 flex flex-col gap-2.5">
        <span className="mono text-[11px] text-muted">{metaOf(e)}</span>
        <h3 className="disp m-0 text-[28px]">{e.title}</h3>
        <p className="m-0 text-text-3 text-[16px] leading-normal">
          <span className="mono text-[11px] text-blue-text">Matched&nbsp;&nbsp;</span>
          {hit.why}
        </p>
      </div>
      <div className="w-[120px] flex flex-col gap-2">
        <span className="mono text-[11px] text-nav">Match {hit.pct}%</span>
        <div className="h-1 bg-line" role="presentation">
          <div className="h-1 bg-blue" style={{ width: `${hit.pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
