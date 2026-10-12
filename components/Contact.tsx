"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { profile } from "@/lib/data";

export default function Contact() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <section id="contact" className="relative py-28 border-t border-line/40">
      <div className="mx-auto max-w-6xl px-6">
        {/* Big Impact Callout */}
        <div className="rounded-2xl border border-amber/30 bg-gradient-to-b from-obsidian via-vault-2 to-vault p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-black/60">
          <span className="font-mono text-xs font-semibold tracking-widest text-amber uppercase">
            DIRECT CHANNELS · OPEN FOR ROLES
          </span>

          <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink">
            {t.contact.headA} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber to-amber-bright bg-clip-text text-transparent">
              {t.contact.headB}
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-steel">
            {t.contact.body}
          </p>

          {/* Primary Action Button */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2.5 rounded-[3px] bg-gradient-to-r from-amber to-amber-bright px-8 py-3.5 text-base font-bold text-vault shadow-xl shadow-amber/25 transition-all hover:-translate-y-0.5 hover:shadow-amber/40"
            >
              <span>{t.contact.email}</span>
              <span aria-hidden className="font-mono text-lg">↗</span>
            </a>

            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[3px] border border-line bg-obsidian px-6 py-3.5 text-base font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-amber/40 hover:text-amber-bright"
            >
              GitHub ↗
            </a>
          </div>

          {/* Direct Info Details */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-line/40 pt-8 font-mono text-xs text-steel">
            <div>
              <span className="text-steel-dim block text-[0.68rem]">EMAIL ADDRESS</span>
              <a href={`mailto:${profile.email}`} className="mt-1 text-ink hover:text-amber-bright transition-colors font-semibold block text-sm">
                {profile.email}
              </a>
            </div>

            <div>
              <span className="text-steel-dim block text-[0.68rem]">DIRECT PHONE / ZALO</span>
              <a href={`tel:${profile.phone}`} className="mt-1 text-ink hover:text-amber-bright transition-colors font-semibold block text-sm">
                {profile.phone}
              </a>
            </div>

            <div>
              <span className="text-steel-dim block text-[0.68rem]">BASE LOCATION</span>
              <span className="mt-1 text-ink block text-sm font-semibold">
                {profile.location[lang]}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-line/40 pt-8 font-mono text-xs text-steel-dim">
          <p>© {new Date().getFullYear()} Hoàng Đức Duẫn · Full-Stack &amp; Edge AI Developer</p>
          <p>{t.footer}</p>
        </footer>
      </div>
    </section>
  );
}
