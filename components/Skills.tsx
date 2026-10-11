"use client";

import { useEffect, useState } from "react";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { skillGroups } from "@/lib/data";
import { skillMeta } from "@/lib/skillMeta";
import { stage } from "@/lib/stage";

// Top of the stack first: what the visitor touches, down to what it all runs on.
const order = ["Frontend", "Backend", "Database", "AI / IoT", "Ngôn ngữ", "Công cụ & DevOps"];
const rank = (title: string) => {
  const i = order.indexOf(title);
  return i < 0 ? order.length : i;
};
const layers = [...skillGroups].sort((a, b) => rank(a.title) - rank(b.title));

/**
 * The skills face is cut into strips, one per slab of the monolith: a heading
 * strip, then one per layer of the stack. On this face the column splits along
 * the same lines (see Atelier), so each layer reads as its own slab.
 */
export default function Skills() {
  const { lang } = usePrefs();
  const t = ui[lang];

  const [hovered, setHovered] = useState(-1);
  const [picked, setPicked] = useState<string | null>(null);

  const pickedLayer = picked ? layers.findIndex((g) => g.items.includes(picked)) : -1;
  const active = hovered >= 0 ? hovered : pickedLayer;
  const meta = picked ? skillMeta[picked] : null;

  // strip 0 is the heading, so layer i sits on slab i + 1
  useEffect(() => {
    stage.active = active < 0 ? -1 : active + 1;
    return () => {
      stage.active = -1;
    };
  }, [active]);

  return (
    <div className="strips" onPointerLeave={() => setHovered(-1)}>
      <div className="strip">
        <h2 className="f-row-lg font-display font-semibold text-ink">{t.skills.title}</h2>
        <div className="f-note text-steel" aria-live="polite">
          {meta ? (
            <p key={picked} className="skill-note">
              <span className="text-ink">{meta.highlight[lang]}</span>
              <span className="mt-0.5 block font-mono text-[0.92em]">
                {t.skills.usedIn}
                <span className="text-amber-bright">{meta.projects[lang]}</span>
              </span>
            </p>
          ) : (
            <p className="line-clamp-3">{t.skills.intro}</p>
          )}
        </div>
      </div>

      {layers.map((group, i) => (
        <div
          key={group.title}
          className="strip"
          data-active={active === i || undefined}
          onPointerEnter={() => setHovered(i)}
          onFocus={() => setHovered(i)}
        >
          <h3 className="f-row font-display font-semibold">{group.label[lang]}</h3>
          <ul className="flex flex-wrap gap-x-[1.1em] gap-y-0">
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
        </div>
      ))}
    </div>
  );
}
