"use client";

import { useEffect, useState } from "react";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";

const links = [
  { href: "#work", key: "work" },
  { href: "#skills", key: "skills" },
  { href: "#about", key: "about" },
  { href: "#contact", key: "contact" },
] as const;

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.4 9.6A5.6 5.6 0 0 1 6.4 2.6a5.6 5.6 0 1 0 7 7Z" />
    </svg>
  );
}

export default function Navbar() {
  const { lang, setLang, colorway, toggleColorway } = usePrefs();
  const t = ui[lang];
  const [activeSection, setActiveSection] = useState<string>("top");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      const sectionIds = ["work", "skills", "about", "contact"];
      const scrollY = window.scrollY + 200;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sectionIds[i]);
          return;
        }
      }
      setActiveSection("top");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-vault/85 backdrop-blur-md border-b border-line shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="#top" className="group flex min-w-0 items-center gap-2.5">
          <span className="relative h-2.5 w-2.5 shrink-0 rounded-[1px] bg-gradient-to-b from-amber-bright to-amber shadow-[0_0_12px_var(--amber)]" />
          <span className="truncate font-display text-base font-semibold tracking-tight text-ink transition-colors group-hover:text-amber-bright">
            Hoàng Đức Duẫn
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-4">
          <ul className="hidden items-center gap-1.5 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={activeSection === l.key ? "true" : undefined}
                  className={`rounded-[3px] px-3.5 py-1.5 text-sm transition-all duration-200 ${
                    activeSection === l.key
                      ? "text-amber-bright font-medium bg-amber/10 border border-amber/20"
                      : "text-steel hover:text-ink hover:bg-obsidian/60"
                  }`}
                >
                  {t.nav[l.key]}
                </a>
              </li>
            ))}
          </ul>

          <div className="pref-seg" role="group" aria-label={t.langLabel}>
            <button
              type="button"
              aria-pressed={lang === "vi"}
              onClick={() => setLang("vi")}
              lang="vi"
              title="Tiếng Việt"
            >
              VI
            </button>
            <button
              type="button"
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
              lang="en"
              title="English"
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className="pref-icon"
            onClick={toggleColorway}
            aria-label={colorway === "day" ? t.toNight : t.toDay}
            title={colorway === "day" ? t.toNight : t.toDay}
          >
            {colorway === "day" ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </nav>
    </header>
  );
}
