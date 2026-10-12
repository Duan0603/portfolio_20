"use client";

import { useState } from "react";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { skillGroups } from "@/lib/data";
import { skillMeta } from "@/lib/skillMeta";

const order = ["Frontend", "Backend", "Database", "AI / IoT", "Ngôn ngữ", "Công cụ & DevOps"];
const rank = (title: string) => {
  const i = order.indexOf(title);
  return i < 0 ? order.length : i;
};
const layers = [...skillGroups].sort((a, b) => rank(a.title) - rank(b.title));

export default function Skills() {
  const { lang } = usePrefs();
  const t = ui[lang];

  // Default to YOLOv8 so inspector is immediately interesting
  const [picked, setPicked] = useState<string>("YOLOv8");
  const meta = skillMeta[picked] ?? null;

  return (
    <section id="skills" className="relative py-24 border-t border-line/40">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-amber font-semibold tracking-wider">
            <span>[03]</span>
            <span>{lang === "vi" ? "MA TRẬN NĂNG LỰC" : "TECHNOLOGY MATRIX"}</span>
          </div>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {t.skills.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-steel">
            {t.skills.intro}
          </p>
        </div>

        {/* 6 Architectural Layers Bento Grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {layers.map((group, idx) => (
            <div
              key={group.title}
              className="rounded-xl border border-line bg-obsidian/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-amber/30 hover:bg-obsidian"
            >
              <div className="flex items-center justify-between border-b border-line/50 pb-3">
                <h3 className="font-display text-lg font-bold text-ink">
                  {group.label[lang]}
                </h3>
                <span className="font-mono text-xs font-semibold text-amber">
                  0{idx + 1}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((skill) => {
                  const active = picked === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setPicked(skill)}
                      className={`rounded px-3 py-1.5 font-mono text-xs transition-all duration-200 ${
                        active
                          ? "bg-amber text-vault font-semibold shadow-md shadow-amber/25 scale-105"
                          : "bg-obsidian-hi text-steel border border-line/60 hover:border-amber/40 hover:text-ink"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Active Technology Deep Inspector */}
        <div className="mt-10 rounded-xl border border-amber/30 bg-gradient-to-r from-obsidian via-vault-2 to-obsidian p-6 md:p-8 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-line/50 pb-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-bright animate-pulse" />
              <span className="text-steel-dim">ACTIVE INSPECTOR:</span>
              <span className="text-amber-bright font-bold">{picked}</span>
            </div>
            <span className="text-steel-dim hidden sm:inline">{t.skills.hint}</span>
          </div>

          {meta ? (
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <span className="font-mono text-[0.7rem] text-steel-dim tracking-wider uppercase">
                  EXPERIENCE & HIGHLIGHT
                </span>
                <p className="mt-1 text-base text-ink leading-relaxed font-normal">
                  {meta.highlight[lang]}
                </p>
              </div>

              <div className="md:col-span-4 rounded-lg border border-line bg-obsidian/80 p-4 font-mono text-xs">
                <span className="text-steel-dim block text-[0.68rem]">{t.skills.usedIn.toUpperCase()}</span>
                <span className="mt-1 text-amber-bright font-semibold block text-sm">
                  {meta.projects[lang]}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-steel">{t.skills.hint}</p>
          )}
        </div>
      </div>
    </section>
  );
}
