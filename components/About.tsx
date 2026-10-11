"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { education, certifications, profile } from "@/lib/data";

export default function About() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <div className="face-in">
      <h2 className="f-title text-ink">{t.about.title}</h2>
      <p className="f-lead mt-4 max-w-[38rem] text-ink/90">{profile.summary[lang]}</p>

      <div className="mt-auto pt-6">
        <h3 className="spec-label">{t.about.education}</h3>
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-line py-3">
          <div>
            <p className="f-row font-display text-ink">{education.school}</p>
            <p className="f-small text-steel">{education.major}</p>
          </div>
          <p className="f-mono tabular-nums text-steel">
            GPA {education.gpa}
            <span className="mx-2 text-steel-dim">/</span>
            {education.period[lang]}
          </p>
        </div>

        <h3 className="spec-label mt-5">{t.about.certs}</h3>
        <ul>
          {certifications.map((c) => (
            <li key={c} className="f-small border-b border-line py-3 text-ink">
              {c}
            </li>
          ))}
        </ul>

        <h3 className="spec-label mt-5">{t.about.quick}</h3>
        <div className="f-mono flex flex-wrap gap-x-8 gap-y-1 pt-2 text-steel">
          <a href={`mailto:${profile.email}`} className="break-all transition-colors hover:text-amber">
            {profile.email}
          </a>
          <a href={`tel:${profile.phone}`} className="tabular-nums transition-colors hover:text-amber">
            {profile.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
