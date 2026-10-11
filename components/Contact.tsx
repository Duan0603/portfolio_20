"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { profile } from "@/lib/data";
import { stage } from "@/lib/stage";
import Reveal from "./Reveal";

export default function Contact() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <section id="contact" className="section-anchor mx-auto max-w-6xl px-6 py-28">
      <div className="grid items-center gap-x-12 border-t border-line pt-20 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <h2 className="max-w-2xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.1] tracking-tight text-ink">
            {t.contact.headA}
            <br />
            <span className="text-steel">{t.contact.headB}</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-steel">
            {t.contact.body}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a href={`mailto:${profile.email}`} className="plate">
              {t.contact.email}
              <span aria-hidden className="font-mono text-sm">
                →
              </span>
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="plate-steel"
            >
              GitHub
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-sm text-steel">
            <a href={`mailto:${profile.email}`} className="break-all transition-colors hover:text-amber">
              {profile.email}
            </a>
            <a href={`tel:${profile.phone}`} className="tabular-nums transition-colors hover:text-amber">
              {profile.phone}
            </a>
            <span>{profile.location[lang]}</span>
          </div>
        </Reveal>

        {/* the monolith comes back together here, closing the walk it opened */}
        <div
          aria-hidden="true"
          className="hidden h-[26rem] lg:block"
          ref={(el) => {
            stage.finale = el;
          }}
        />
      </div>
    </section>
  );
}
