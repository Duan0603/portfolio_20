"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { education, certifications, profile } from "@/lib/data";
import Reveal from "./Reveal";

export default function About() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <section id="about" className="section-anchor mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="mb-12 flex items-baseline gap-4">
          <span className="font-mono text-sm text-amber">02</span>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t.about.title}
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[1.35fr_1fr]">
        <Reveal>
          <p className="spec-label mb-5">{t.about.direction}</p>
          <p className="max-w-[40rem] text-xl leading-relaxed text-ink/90 sm:text-2xl sm:leading-[1.5]">
            {profile.summary[lang]}
          </p>

          <div className="mt-12 border-t border-line pt-6">
            <p className="spec-label mb-4">{t.about.education}</p>
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <div>
                <p className="font-display text-xl text-ink">{education.school}</p>
                <p className="text-steel">{education.major}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-mono text-sm tabular-nums text-ink">GPA {education.gpa}</p>
                <p className="font-mono text-xs tabular-nums text-steel">{education.period[lang]}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="spec-label mb-1">{t.about.certs}</p>
          <ul>
            {certifications.map((c) => (
              <li key={c} className="border-b border-line py-4 leading-relaxed text-ink">
                {c}
              </li>
            ))}
          </ul>

          <p className="spec-label mb-3 mt-10">{t.about.quick}</p>
          <div className="space-y-2 font-mono text-sm text-steel">
            <a href={`mailto:${profile.email}`} className="block break-all transition-colors hover:text-amber">
              {profile.email}
            </a>
            <a href={`tel:${profile.phone}`} className="block tabular-nums transition-colors hover:text-amber">
              {profile.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
