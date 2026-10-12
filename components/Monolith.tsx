"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { profile, projects } from "@/lib/data";
import {
  getFace,
  getGl,
  goTo,
  measure,
  pointer,
  resetWrites,
  stage,
  subscribe,
  update,
} from "@/lib/stage";
import Hero from "./Hero";
import { ProjectFace, ReposFace } from "./Projects";
import About from "./About";
import Skills from "./Skills";
import Contact from "./Contact";

const featured = projects.filter((p) => p.highlights);

/** Reduced motion, or a viewport too short to hold a face: the faces become a flat page. */
function useFlat() {
  const [flat, setFlat] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce), (max-height: 520px)");
    const on = () => setFlat(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return flat;
}

export const useFace = () => useSyncExternalStore(subscribe, getFace, () => 0);

/**
 * The page is one block. Every section is a face of it, and scrolling turns it
 * a quarter turn to the next. The faces are ordinary DOM, set in 3D with CSS;
 * the stone underneath is drawn by the WebGL atelier from the same pose.
 */
export default function Monolith() {
  const { lang } = usePrefs();
  const t = ui[lang];
  const flat = useFlat();
  const face = useFace();
  const gl = useSyncExternalStore(subscribe, getGl, () => "pending" as const);

  const root = useRef<HTMLDivElement>(null);
  const prism = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const faces = [
    { id: "top", label: profile.name, node: <Hero /> },
    ...featured.map((p, i) => ({
      id: i === 0 ? "work" : `work-${i + 1}`,
      label: p.name,
      node: <ProjectFace project={p} />,
    })),
    { id: "repos", label: t.work.more, node: <ReposFace /> },
    { id: "about", label: t.about.title, node: <About /> },
    { id: "skills", label: t.skills.title, node: <Skills /> },
    { id: "contact", label: t.nav.contact, node: <Contact /> },
  ];
  const count = faces.length;

  useEffect(() => {
    stage.root = root.current;
    stage.prism = prism.current;
    stage.track = track.current;
    stage.count = count;
    stage.flat = flat;
    stage.faces.length = count;
    resetWrites();

    if (flat) {
      // hand the styles the driver wrote back to the stylesheet
      root.current?.style.removeProperty("perspective");
      prism.current?.style.removeProperty("transform");
      stage.faces.forEach((el) => {
        el?.style.removeProperty("opacity");
        el?.style.removeProperty("pointer-events");
        el?.style.removeProperty("transform");
        el?.style.removeProperty("visibility");
      });
      return;
    }

    stage.vw = 0; // force a fresh read
    measure();
    const ro = new ResizeObserver(measure);
    if (root.current) ro.observe(root.current);
    if (prism.current) ro.observe(prism.current);
    window.addEventListener("resize", measure);

    // The WebGL loop drives the pose; this one only steps in while it is absent.
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (now - stage.glAt > 150) update(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Once scrolling stops completely, gently rest square on the nearest face
    let settled = Math.round(window.scrollY / stage.step);
    let touching = false;
    let timer = 0;
    const settle = () => {
      if (touching) return;
      const p = window.scrollY / stage.step;
      const moved = p - settled;
      let to = Math.round(p);
      if (Math.abs(moved) > 0.25 && Math.abs(moved) < 0.5) to = settled + Math.sign(moved);
      to = Math.min(count - 1, Math.max(0, to));
      settled = to;
      // Only gently align if resting off-center between faces
      if (Math.abs(p - to) > 0.04) {
        goTo(to);
      }
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 360);
    };
    const onTouchStart = () => {
      touching = true;
      window.clearTimeout(timer);
    };
    const onTouchEnd = () => {
      touching = false;
      onScroll();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable]")) return;
      const here = Math.round(window.scrollY / stage.step);
      const to =
        e.key === "ArrowDown" || e.key === "PageDown"
          ? here + 1
          : e.key === "ArrowUp" || e.key === "PageUp"
            ? here - 1
            : e.key === "Home"
              ? 0
              : e.key === "End"
                ? count - 1
                : null;
      if (to === null) return;
      e.preventDefault();
      goTo(to);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [flat, count]);

  // The rake follows the pointer, on the stone and on the vault behind it.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      pointer.tx = x * 2 - 1;
      pointer.ty = -(y * 2 - 1);
      document.documentElement.style.setProperty("--rx", `${x * 100}%`);
      document.documentElement.style.setProperty("--ry", `${y * 100}%`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      <div
        ref={root}
        className="monolith-stage"
        data-flat={flat || undefined}
        data-gl={gl}
      >
        <main ref={prism} className="stage-viewport prism">
          {faces.map((f, i) => (
            <section
              key={f.id}
              id={flat ? f.id : undefined}
              ref={(el) => {
                stage.faces[i] = el;
              }}
              className="stage-panel face"
              data-panel={f.id}
              aria-label={f.label}
              style={
                {
                  "--i": i,
                  opacity: flat ? undefined : i === 0 ? 1 : 0,
                  transform: flat ? undefined : i === 0 ? "translate3d(0, 0, 0)" : "translate3d(0, 44px, 0)",
                  visibility: flat ? undefined : i === 0 ? "visible" : "hidden",
                } as React.CSSProperties
              }
              // tabbing into a face that is turned away brings it round
              onFocusCapture={() => {
                if (!flat && stage.face !== i) goTo(i);
              }}
            >
              <div className="stage-card face-in">{f.node}</div>
            </section>
          ))}
        </main>
      </div>

      {!flat && (
        <>
          {/* the scroll the block turns on: one viewport per face */}
          <div ref={track} className="track" aria-hidden="true">
            {faces.map((f) => (
              <div key={f.id} id={f.id} />
            ))}
          </div>

          <nav className="rail" aria-label={t.rail}>
            <ol>
              {faces.map((f, i) => (
                <li key={f.id}>
                  <a href={`#${f.id}`} aria-current={face === i ? "true" : undefined}>
                    <span className="rail-tick" />
                    <span className="rail-label">{f.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </>
      )}
    </>
  );
}
