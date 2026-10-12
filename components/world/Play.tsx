"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePrefs } from "@/lib/prefs";
import { driveTo, game, getActive, resetRover, stations, subscribe } from "./game";
import { copy, stationShort, stationTitle } from "./copy";
import Panel from "./Panel";
import { vehicleById, vehicles } from "./vehicles";
import s from "./world.module.css";

const World = dynamic(() => import("./World"), { ssr: false });

/* Car controls: [throttle, wheel]. Space is the handbrake, Shift the boost. */
const KEYS: Record<string, [number, number]> = {
  ArrowUp: [1, 0],
  ArrowDown: [-1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
  w: [1, 0],
  s: [-1, 0],
  a: [0, -1],
  d: [0, 1],
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The portfolio as a place: a hall of obsidian slabs the visitor drives a small
 * robot around. Every stop is also one click away, and the whole thing reads as
 * an ordinary page for anyone who would rather not drive.
 */
export default function Play() {
  const { lang, setLang, colorway, toggleColorway } = usePrefs();
  const t = copy[lang];
  const day = colorway === "day";

  // null until the browser has been asked what it can do
  const [mode, setMode] = useState<"world" | "page" | null>(null);
  const [canDrive, setCanDrive] = useState(true);
  const [ready, setReady] = useState(false);
  const active = useSyncExternalStore(subscribe, getActive, () => 0);
  const [dismissed, setDismissed] = useState(-1);
  const [vehicle, setVehicle] = useState(vehicles[0]);
  const [garage, setGarage] = useState(false);

  // the visitor's last choice of vehicle comes back with them
  useEffect(() => {
    try {
      setVehicle(vehicleById(window.localStorage.getItem("vehicle")));
    } catch {
      /* storage unavailable: the default car it is */
    }
  }, []);
  useEffect(() => {
    game.pace = vehicle.pace;
  }, [vehicle]);
  const pick = (id: string) => {
    setVehicle(vehicleById(id));
    setGarage(false);
    try {
      window.localStorage.setItem("vehicle", id);
    } catch {
      /* the choice just lasts for this visit */
    }
  };
  const last = useRef(0);
  if (active >= 0) last.current = active;

  useEffect(() => {
    const ok = hasWebGL();
    setCanDrive(ok);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(ok && !calm ? "world" : "page");

    // slab and floor lettering is drawn in the page's own typefaces
    const css = getComputedStyle(document.documentElement);
    const display = css.getPropertyValue("--font-display").trim() || "sans-serif";
    const mono = css.getPropertyValue("--font-mono").trim() || "monospace";
    const body = css.getPropertyValue("--font-body").trim() || "sans-serif";
    game.fonts = { display, body, mono };
    Promise.all([
      document.fonts.load(`800 100px ${display}`, "Hoàng Đức Duẫn"),
      document.fonts.load(`400 30px ${mono}`, "Đà Nẵng"),
      document.fonts.load(`400 40px ${body}`, "Đà Nẵng"),
    ])
      .catch(() => {})
      .then(() => setReady(true));
  }, []);

  const world = mode === "world";
  const open = world && active >= 0 && dismissed !== active;

  // a panel dismissed at one stop comes back at the next
  useEffect(() => {
    if (active < 0) setDismissed(-1);
  }, [active]);

  // keep the rover clear of the panel: beside it on a wide screen, above it on a phone
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    const place = () => {
      game.shiftX = open && wide.matches ? 5 : 0;
      game.shiftZ = open && !wide.matches ? 8 : 0;
    };
    place();
    wide.addEventListener("change", place);
    return () => wide.removeEventListener("change", place);
  }, [open]);

  useEffect(() => {
    if (!world) return;
    const held = new Set<string>();
    const steer = () => {
      let throttle = 0;
      let wheel = 0;
      held.forEach((k) => {
        if (!KEYS[k]) return;
        throttle += KEYS[k][0];
        wheel += KEYS[k][1];
      });
      game.throttle = Math.sign(throttle);
      game.wheel = Math.sign(wheel);
      game.handbrake = held.has(" ");
      game.boost = held.has("Shift");
    };
    const keyOf = (e: KeyboardEvent) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const down = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable]")) return;
      const k = keyOf(e);
      const onControl = !!el?.closest("a, button");
      if (KEYS[k] || k === "Shift" || (k === " " && !onControl)) {
        if (k !== "Shift") e.preventDefault();
        held.add(k);
        steer();
      } else if (k === "Enter" && !onControl) {
        e.preventDefault();
        driveTo(last.current + 1);
      }
    };
    const up = (e: KeyboardEvent) => {
      held.delete(keyOf(e));
      steer();
    };
    const drop = () => {
      held.clear();
      steer();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", drop);
    return () => {
      drop();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", drop);
    };
  }, [world]);

  const at = active >= 0 ? active : last.current;
  const station = stations[at];

  return (
    <div className={s.shell} data-mode={mode ?? "world"}>
      {world && ready && (
        <div className={s.canvas} aria-hidden="true">
          <World lang={lang} day={day} vehicle={vehicle} />
        </div>
      )}

      <header className={s.bar}>
        <button
          type="button"
          className={s.brand}
          onClick={() => {
            if (world) driveTo(0);
          }}
        >
          <span className={s.dot} />
          Hoàng Đức Duẫn
        </button>

        {world && (
          <nav className={s.stops} aria-label={t.stations}>
            <ol>
              {stations.map((st, i) => (
                <li key={st.id}>
                  <button type="button" aria-current={active === i ? "true" : undefined} onClick={() => driveTo(i)}>
                    {stationShort(st, lang)}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={s.prefs}>
          {canDrive && mode && (
            <button
              type="button"
              className={s.modeToggle}
              onClick={() => {
                if (!world) resetRover();
                setMode(world ? "page" : "world");
              }}
            >
              {world ? t.asPage : t.asWorld}
            </button>
          )}
          <div className={s.seg} role="group" aria-label={t.lang}>
            <button type="button" aria-pressed={lang === "vi"} onClick={() => setLang("vi")} lang="vi" title="Tiếng Việt">
              VI
            </button>
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en" title="English">
              EN
            </button>
          </div>
          <button type="button" className={s.icon} onClick={toggleColorway} aria-label={day ? t.toNight : t.toDay} title={day ? t.toNight : t.toDay}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {day ? (
                <path d="M13.4 9.6A5.6 5.6 0 0 1 6.4 2.6a5.6 5.6 0 1 0 7 7Z" />
              ) : (
                <>
                  <circle cx="8" cy="8" r="3" />
                  <path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {world && (
        <>
          <div aria-live="polite">
            {open && (
              <aside key={station.id} className={s.panel} aria-label={stationTitle(station, lang)}>
                <button type="button" className={s.close} onClick={() => setDismissed(active)} aria-label={t.close} title={t.close}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M2 2l10 10M12 2L2 12" />
                  </svg>
                </button>
                <Panel station={station} index={at} lang={lang} heading={at === 0 ? "h1" : "h2"} drivable />
              </aside>
            )}
          </div>

          <div className={s.tour}>
            <button type="button" className={s.step} onClick={() => driveTo(at - 1)} aria-label={t.prev} title={t.prev}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>
            <p className={s.where}>
              <span className={s.count}>
                {String(at + 1).padStart(2, "0")} / {String(stations.length).padStart(2, "0")}
              </span>
              <span className={s.whereName}>{active >= 0 ? stationShort(station, lang) : t.driving}</span>
            </p>
            <button type="button" className={s.plate} onClick={() => driveTo(at + 1)}>
              {t.next}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>

          <div className={s.garage}>
            {garage && (
              <ul className={s.garageMenu} role="menu" aria-label={t.garage}>
                {vehicles.map((v) => (
                  <li key={v.id} role="none">
                    <button type="button" role="menuitemradio" aria-checked={vehicle.id === v.id} onClick={() => pick(v.id)}>
                      <span className={s.swatch} style={{ background: v.paint }} />
                      {v.name[lang]}
                    </button>
                  </li>
                ))}
                <li className={s.credit} role="none">
                  {t.credit}{" "}
                  {vehicles
                    .filter((v) => v.credit)
                    .map((v, i) => (
                      <span key={v.id}>
                        {i > 0 && ", "}
                        <a href={v.credit!.url} target="_blank" rel="noopener noreferrer" title={v.credit!.title}>
                          {v.credit!.author}
                        </a>
                      </span>
                    ))}
                </li>
              </ul>
            )}
            <button type="button" className={s.garageBtn} aria-haspopup="menu" aria-expanded={garage} onClick={() => setGarage((g) => !g)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 12.5v-2l2-1 2.2-3.2h5.6l3 3.2 2.2.8v2.2h-1.6" />
                <path d="M7.4 12.5h5.2" />
                <circle cx="5.6" cy="12.6" r="1.7" />
                <circle cx="14.4" cy="12.6" r="1.7" />
              </svg>
              <span>{t.garage}</span>
            </button>
          </div>

          <p className={s.keys} aria-hidden="true">
            <span className={s.keycaps}>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
            {t.hint}
          </p>
        </>
      )}

      {mode === "page" && (
        <main className={s.page}>
          {stations.map((st, i) => (
            <section key={st.id} className={s.sheet}>
              <Panel station={st} index={i} lang={lang} heading={i === 0 ? "h1" : "h2"} />
            </section>
          ))}
        </main>
      )}
    </div>
  );
}
