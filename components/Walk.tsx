"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { stage, featured, SIDES, SLABS, FOV } from "@/lib/stage";
import Hero from "./Hero";
import { ProjectFace, RepoIndex } from "./Projects";
import About from "./About";
import Skills from "./Skills";
import Contact from "./Contact";

const TURN = (Math.PI * 2) / SIDES;
const SKILLS_FACE = SIDES - 2;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => {
  const t = clamp01(n);
  return t * t * (3 - 2 * t);
};

/**
 * The whole page as one object. Each chapter is a face of a prism; scrolling
 * turns the prism, holding flat on a face and rotating between them. The
 * faces are real HTML placed with CSS 3D, and the obsidian they sit on is
 * drawn in WebGL (components/Atelier) from the measurements published here.
 *
 * Without WebGL, with reduced motion, or on a viewport too short to hold a
 * face, the same markup is simply a stacked page.
 */
export default function Walk() {
  const { lang } = usePrefs();
  const t = ui[lang];

  const [solid, setSolid] = useState(false);
  const [current, setCurrent] = useState(0);
  const stageEl = useRef<HTMLDivElement>(null);
  const prism = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const goTo = useRef<(i: number) => void>(() => {});

  const chapters = [
    { id: "top", label: t.rail.top, node: <Hero /> },
    ...featured.map((p, i) => ({
      id: i === 0 ? "work" : `work-${i + 1}`,
      label: p.name,
      node: <ProjectFace project={p} index={i} />,
    })),
    { id: "index", label: t.work.more, node: <RepoIndex /> },
    { id: "about", label: t.nav.about, node: <About /> },
    { id: "skills", label: t.nav.skills, node: <Skills /> },
    { id: "contact", label: t.nav.contact, node: <Contact /> },
  ];

  // Decide once the browser is known: the solid walk is an enhancement.
  useEffect(() => {
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () =>
      setSolid(webgl && !mq.matches && window.innerHeight >= 640 && window.innerWidth >= 340);
    decide();
    window.addEventListener("resize", decide);
    mq.addEventListener?.("change", decide);
    return () => {
      window.removeEventListener("resize", decide);
      mq.removeEventListener?.("change", decide);
    };
  }, []);

  useEffect(() => {
    if (!solid || !stageEl.current || !prism.current || !track.current) return;
    const root = stageEl.current;
    const body = prism.current;
    const rail = track.current;
    const faces = Array.from(body.querySelectorAll<HTMLElement>(":scope > .face"));
    const strips = Array.from(body.querySelectorAll<HTMLElement>(".strip"));

    document.documentElement.classList.add("walk-solid");

    let R = 0;
    let stop = 1;
    const measure = () => {
      const vh = root.clientHeight;
      const w = faces[0].offsetWidth;
      R = w / 2 / Math.tan(Math.PI / SIDES);
      stop = rail.offsetHeight / SIDES;
      const P = vh / 2 / Math.tan((FOV * Math.PI) / 360);
      root.style.setProperty("--P", `${P}px`);
      root.style.setProperty("--R", `${R}px`);
      stage.P = P;
      stage.R = R;
      stage.H = faces[0].offsetHeight;
      stage.oy = body.offsetTop - vh / 2;
      stage.gap = w < 480 ? 7 : 10;
    };
    measure();
    window.addEventListener("resize", measure);

    goTo.current = (i) => window.scrollTo({ top: i * stop, behavior: "smooth" });

    let cur = clamp01(window.scrollY / stop / (SIDES - 1)) * (SIDES - 1);
    let shown = -1;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = clamp01(window.scrollY / stop / (SIDES - 1)) * (SIDES - 1);
      cur += (target - cur) * (1 - Math.exp(-dt * 11));
      if (Math.abs(target - cur) < 0.0004) cur = target;

      // hold flat on a face, turn through the middle of each stop
      const f = Math.floor(cur);
      const c = f + smooth((cur - f - 0.2) / 0.6);
      const angle = -c * TURN;
      const split = smooth((0.3 - Math.abs(c - SKILLS_FACE)) / 0.22);

      body.style.transform = `translateZ(${-R}px) rotateY(${angle}rad)`;

      for (let i = 0; i < faces.length; i++) {
        const d = Math.abs(i - c);
        // the face ahead and the face behind stay as ghosts on the angled sides
        let o = d <= 1 ? 1 - 0.72 * d : Math.max(0, 0.28 * (2 - d));
        if (i !== SKILLS_FACE) o *= 1 - split;
        faces[i].style.opacity = o.toFixed(3);
        faces[i].style.pointerEvents = d < 0.5 ? "auto" : "none";
      }
      for (let j = 0; j < strips.length; j++) {
        const y = (j - (SLABS - 1) / 2) * stage.gap * split;
        strips[j].style.transform = `translateY(${y.toFixed(2)}px)`;
      }

      stage.solid = true;
      stage.angle = angle;
      stage.split = split;

      const nearest = Math.round(cur);
      if (nearest !== shown) {
        shown = nearest;
        setCurrent(nearest);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      document.documentElement.classList.remove("walk-solid");
      stage.solid = false;
      stage.split = 0;
      body.style.transform = "";
      faces.forEach((el) => {
        el.style.opacity = "";
        el.style.pointerEvents = "";
      });
      strips.forEach((el) => {
        el.style.transform = "";
      });
    };
  }, [solid]);

  return (
    <div className="walk" data-solid={solid || undefined}>
      <div ref={stageEl} className="walk-stage">
        <div ref={prism} className="prism" style={{ "--sides": SIDES } as React.CSSProperties}>
          {chapters.map((ch, i) => (
            <section
              key={ch.id}
              id={solid ? undefined : ch.id}
              className="face"
              style={{ "--i": i } as React.CSSProperties}
              // tabbing onto a link on another face turns the column to it
              onFocus={() => {
                if (solid && i !== current) goTo.current(i);
              }}
            >
              {ch.node}
            </section>
          ))}
        </div>
      </div>

      {solid && (
        <>
          {/* scroll length: one stop per face, carrying the anchors the nav jumps to */}
          <div ref={track} className="walk-track" aria-hidden="true">
            {chapters.map((ch) => (
              <div key={ch.id} id={ch.id} className="walk-stop" />
            ))}
          </div>

          <nav className="rail" aria-label={t.rail.label}>
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                type="button"
                aria-current={current === i ? "true" : undefined}
                aria-label={ch.label}
                onClick={() => goTo.current(i)}
              >
                <span aria-hidden="true">{ch.label}</span>
                <i aria-hidden="true" />
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
