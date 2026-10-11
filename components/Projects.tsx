"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import type { Project } from "@/lib/data";
import { featured, rest } from "@/lib/stage";
import LitRow from "./LitRow";

function Links({ repo, demo }: { repo?: string; demo?: string }) {
  return (
    <div className="flex shrink-0 gap-5 font-mono text-xs">
      {repo && (
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-steel transition-colors hover:text-amber"
        >
          CODE ↗
        </a>
      )}
      {demo && (
        <a
          href={demo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber transition-colors hover:text-amber-bright"
        >
          DEMO ↗
        </a>
      )}
    </div>
  );
}

/** One featured project, mounted on its own face of the monolith. */
export function ProjectFace({ project: p, index }: { project: Project; index: number }) {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <article className="face-in">
      <h2 className="f-title text-ink">{p.name}</h2>
      <p className="f-lead mt-4 max-w-[38rem]">{p.description[lang]}</p>
      <ul className="tag-run f-mono mt-4 text-steel">
        {p.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <h3 className="spec-label">{t.work.highlights}</h3>
        <ul>
          {p.highlights!.map((h) => (
            <li key={h.vi} className="f-small flex gap-3 border-b border-line py-3 text-ink/90">
              <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-amber-bright shadow-[0_2px_7px_-1px_var(--amber)]" />
              <span>{h[lang]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4">
        <Links repo={p.repo} demo={p.demo} />
        <p className="f-mono ml-auto tabular-nums text-steel">
          {index + 1} / {featured.length}
        </p>
      </div>
    </article>
  );
}

/** The rest: a catalogue index, one line per repo. */
export function RepoIndex() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <div className="face-in">
      <h2 className="f-title text-ink">{t.work.more}</h2>
      <ul className="mt-auto border-b border-line">
        {rest.map((p) => (
          <LitRow as="li" key={p.name} className="py-[0.7em]">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="lit-title f-row min-w-0 font-display font-semibold text-ink">{p.name}</h3>
              <Links repo={p.repo} demo={p.demo} />
            </div>
            <p className="f-small mt-0.5 text-steel">{p.description[lang]}</p>
          </LitRow>
        ))}
      </ul>
    </div>
  );
}
