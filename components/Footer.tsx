"use client";

import { profile } from "@/lib/data";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";

export default function Footer() {
  const { lang } = usePrefs();

  return (
    <footer className="relative mx-auto max-w-6xl px-6 pb-12">
      <div className="hairline mb-8" />
      <div className="flex flex-col items-center justify-between gap-3 text-sm text-steel-dim sm:flex-row">
        <p className="font-mono">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="font-mono text-xs">{ui[lang].footer}</p>
      </div>
    </footer>
  );
}
