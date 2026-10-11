"use client";

import { useEffect, useState } from "react";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { skillGroups } from "@/lib/data";
import { skillMeta } from "@/lib/skillMeta";
import { stage } from "@/lib/stage";
import Reveal from "./Reveal";

// Top of the stack first: what the visitor touches, down to what it all runs on.
// Each layer has one slab of the monolith docked beside it (see Atelier).
const order = ["Frontend", "Backend", "Database", "AI / IoT", "Ngôn ngữ", "Công cụ & DevOps"];
const rank = (title: string) => {
  const i = order.indexOf(title);
  return i < 0 ? order.length : i;
};
const layers = [...skillGroups].sort((a, b) => rank(a.title) - rank(b.title));

export default function Skills() {
  const { lang } = usePrefs();
  const t = ui[lang];

  const [hovered, setHovered] = useState(-1);
  const [picked, setPicked] = useState<string | null>(null);

  const pickedLayer = picked ? layers.findIndex((g) => g.items.includes(picked)) : -1;
  const active = hovered >= 0 ? hovered : pickedLayer;

  useEffect(() => {
    stage.active = active;
    return () => {
      stage.active = -1;
    };
  }, [active]);

  return (
    <section id="skills" className="section-anchor mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="mb-4 flex items-baseline gap-4">
          <span className="font-mono text-sm text-amber">03</span>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t.skills.title}
          </h2>
        </div>
        <p className="mb-12 max-w-2xl text-steel">{t.skills.intro}</p>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-x-4 sm:grid-cols-[minmax(0,1fr)_9rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-x-12">
        <ol
          className="border-b border-line"
          onPointerLeave={() => setHovered(-1)}
        >
          {layers.map((group, i) => {
            const meta = pickedLayer === i && picked ? skillMeta[picked] : null;
            return (
              <li
                key={group.title}
                data-active={active === i}
                className="skill-layer grid gap-x-8 gap-y-3 border-t border-line py-6 md:grid-cols-[11rem_minmax(0,1fr)]"
                onPointerEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
              >
                <h3
                  ref={(el) => {
                    stage.rows[i] = el;
                  }}
                  className="font-display text-xl font-semibold sm:text-2xl"
                >
                  {group.label[lang]}
                </h3>

                <div>
                  <ul className="flex flex-wrap gap-x-5 gap-y-1">
                    {group.items.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="skill"
                          aria-pressed={picked === item}
                          onClick={() => setPicked((p) => (p === item ? null : item))}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div aria-live="polite">
                    {meta && (
                      <div key={picked} className="skill-note mt-4 max-w-xl">
                        <p className="text-sm leading-relaxed text-ink/90">
                          {meta.highlight[lang]}
                        </p>
                        <p className="mt-1.5 font-mono text-xs leading-relaxed text-steel">
                          {t.skills.usedIn}
                          <span className="text-amber-bright">{meta.projects[lang]}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* the split monolith docks here, one slab level with each layer */}
        <div
          aria-hidden="true"
          ref={(el) => {
            stage.anchor = el;
          }}
        />
      </div>
    </section>
  );
}
