"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { profile } from "@/lib/data";

export default function Contact() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <div className="face-in">
      <div className="my-auto">
        <h2 className="f-title text-ink">
          {t.contact.headA}
          <br />
          <span className="text-steel">{t.contact.headB}</span>
        </h2>
        <p className="f-lead mt-5 max-w-[30rem]">{t.contact.body}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={`mailto:${profile.email}`} className="plate">
            {t.contact.email}
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

        <div className="f-mono mt-8 flex flex-wrap gap-x-8 gap-y-2 text-steel">
          <a href={`mailto:${profile.email}`} className="break-all transition-colors hover:text-amber">
            {profile.email}
          </a>
          <a href={`tel:${profile.phone}`} className="tabular-nums transition-colors hover:text-amber">
            {profile.phone}
          </a>
          <span>{profile.location[lang]}</span>
        </div>
      </div>

      <footer className="f-mono flex flex-wrap justify-between gap-x-8 gap-y-1 border-t border-line pt-4 text-steel">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
