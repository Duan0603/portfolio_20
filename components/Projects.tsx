"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { projects } from "@/lib/data";
import Reveal from "./Reveal";
import LitRow from "./LitRow";

const featured = projects.filter((p) => p.highlights);
const rest = projects.filter((p) => !p.highlights);

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

export default function Projects() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <section id="work" className="section-anchor mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="mb-4 flex items-baseline gap-4">
          <span className="font-mono text-sm text-amber">01</span>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t.work.title}
          </h2>
        </div>
        <p className="mb-14 max-w-xl text-steel">
          {t.work.intro}
        </p>
      </Reveal>

      {/* Featured — mounted straight on the floor, one lit row each */}
      <div>
        {featured.map((p, i) => (
          <Reveal key={p.name} delay={i * 90}>
            <LitRow
              as="article"
              className="grid gap-x-14 gap-y-9 py-12 sm:py-14 lg:grid-cols-[1fr_1.1fr]"
            >
              <div>
                <h3 className="lit-title font-display text-[clamp(1.9rem,4.2vw,2.9rem)] font-semibold leading-[1.05] text-ink">
                  {p.name}
                </h3>
                <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-steel">
                  {p.description[lang]}
                </p>
                <ul className="tag-run mt-6 font-mono text-[0.76rem] text-steel">
                  {p.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                {(p.repo || p.demo) && (
                  <div className="mt-7">
                    <Links repo={p.repo} demo={p.demo} />
                  </div>
                )}
              </div>

              <div>
                <p className="spec-label mb-1">{t.work.highlights}</p>
                <ul>
                  {p.highlights!.map((h) => (
                    <li
                      key={h.vi}
                      className="flex gap-4 border-b border-line py-4 leading-relaxed text-ink/90 last:border-b-0"
                    >
                      <span className="mt-[0.62rem] h-1 w-1 shrink-0 rounded-full bg-amber-bright shadow-[0_2px_7px_-1px_var(--amber)]" />
                      <span>{h[lang]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </LitRow>
          </Reveal>
        ))}
      </div>

      {/* The rest — a catalogue index, one line per repo */}
      <Reveal>
        <p className="spec-label mb-5 mt-20">{t.work.more}</p>
      </Reveal>
      <ul className="border-b border-line">
        {rest.map((p, i) => (
          <Reveal key={p.name} as="li" delay={i * 50}>
            <LitRow className="grid items-baseline gap-x-10 gap-y-2 py-5 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_auto]">
              <h3 className="lit-title font-display text-xl font-semibold text-ink">
                {p.name}
              </h3>
              <div>
                <p className="leading-relaxed text-steel">{p.description[lang]}</p>
                <ul className="tag-run mt-1.5 font-mono text-[0.72rem] text-steel-dim">
                  {p.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <Links repo={p.repo} demo={p.demo} />
            </LitRow>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
