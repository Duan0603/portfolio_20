"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePrefs } from "@/lib/prefs";
import { profile } from "@/lib/data";
import { driveTo, game, getActive, resetRover, stations, subscribe, type Kind } from "./game";
import { copy, stationShort, stationTitle } from "./copy";
import Panel from "./Panel";
import QuickProjects from "./QuickProjects";
import Icon from "./Icons";
import { vehicleById, vehicles } from "./vehicles";
import s from "./world.module.css";

const World = dynamic(() => import("./World"), { ssr: false });
const KEYS: Record<string, [number, number]> = {
  ArrowUp: [1, 0], ArrowDown: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
  w: [1, 0], s: [-1, 0], a: [0, -1], d: [0, 1],
};

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch { return false; }
}

class WorldGuard extends Component<{ onFailure: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function Play() {
  const { lang, setLang, colorway, toggleColorway } = usePrefs();
  const t = copy[lang];
  const day = colorway === "day";
  const [mode, setMode] = useState<"world" | "page" | null>(null);
  const [canDrive, setCanDrive] = useState(true);
  const [ready, setReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const active = useSyncExternalStore(subscribe, getActive, () => 0);
  const [dismissed, setDismissed] = useState(-1);
  const [vehicle, setVehicle] = useState(vehicles[0]);
  const [garage, setGarage] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const garageBox = useRef<HTMLDivElement>(null);
  const last = useRef(0);
  if (active >= 0) last.current = active;

  useEffect(() => {
    try { setVehicle(vehicleById(localStorage.getItem("vehicle"))); } catch { /* session-only preference */ }
  }, []);
  useEffect(() => { game.pace = vehicle.pace; }, [vehicle]);
  const pick = (id: string) => {
    setVehicle(vehicleById(id)); setGarage(false);
    try { localStorage.setItem("vehicle", id); } catch { /* session-only preference */ }
  };

  useEffect(() => {
    const ok = hasWebGL(); setCanDrive(ok);
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(ok && !calm ? "world" : "page");
    const css = getComputedStyle(document.documentElement);
    const display = css.getPropertyValue("--font-display").trim() || "sans-serif";
    const mono = css.getPropertyValue("--font-mono").trim() || "monospace";
    const body = css.getPropertyValue("--font-body").trim() || "sans-serif";
    game.fonts = { display, body, mono };
    let current = true;
    Promise.all([
      document.fonts.load(`700 100px ${display}`, "Hoàng Đức Duẫn"),
      document.fonts.load(`400 30px ${mono}`, "Đà Nẵng"),
      document.fonts.load(`400 40px ${body}`, "Đà Nẵng"),
      document.fonts.load(`600 40px ${body}`, "Hồ sơ Kỹ năng Cinema Smart Waste Fitnexus GitHub Liên hệ"),
    ]).catch(() => {}).then(() => { if (current) setReady(true); });
    return () => { current = false; };
  }, []);

  const world = mode === "world";
  const open = world && active > 0 && dismissed !== active;
  const welcome = mode !== "page" && active === 0;
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setCanDrive(false); setMode("page"); }, []);

  useEffect(() => { if (active < 0) setDismissed(-1); }, [active]);
  useEffect(() => {
    const wide = matchMedia("(min-width: 900px)");
    const place = () => { game.shiftX = open && wide.matches ? 5 : 0; game.shiftZ = open && !wide.matches ? 8 : 0; };
    place(); wide.addEventListener("change", place);
    return () => wide.removeEventListener("change", place);
  }, [open]);

  useEffect(() => {
    if (!world || quickOpen) return;
    const held = new Set<string>();
    const steer = () => {
      let throttle = 0, wheel = 0;
      held.forEach(k => { if (KEYS[k]) { throttle += KEYS[k][0]; wheel += KEYS[k][1]; } });
      game.throttle = Math.sign(throttle); game.wheel = Math.sign(wheel);
      game.handbrake = held.has(" "); game.boost = held.has("Shift");
    };
    const keyOf = (e: KeyboardEvent) => e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const down = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable], dialog")) return;
      const k = keyOf(e), onControl = !!el?.closest("a, button, summary");
      if (onControl) return;
      if (KEYS[k] || k === "Shift" || k === " ") {
        if (k !== "Shift") e.preventDefault();
        held.add(k); steer();
      } else if (k === "Enter") { e.preventDefault(); driveTo(last.current + 1); }
    };
    const up = (e: KeyboardEvent) => { held.delete(keyOf(e)); steer(); };
    const drop = () => { held.clear(); steer(); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", drop);
    return () => { drop(); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", drop); };
  }, [world, quickOpen]);

  useEffect(() => {
    if (!quickOpen) return;
    game.target = null; game.throttle = 0; game.wheel = 0; game.handbrake = true;
    return () => { game.handbrake = false; };
  }, [quickOpen]);

  useEffect(() => {
    if (!garage) return;
    const outside = (e: PointerEvent) => { if (!garageBox.current?.contains(e.target as Node)) setGarage(false); };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setGarage(false); garageBox.current?.querySelector<HTMLButtonElement>("[aria-expanded]")?.focus(); }
    };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [garage]);

  const at = active >= 0 ? active : last.current;
  const station = stations[at];
  const go = (i: number) => { setDismissed(-1); driveTo(i); };
  const visit = (kind: Kind) => {
    const index = stations.findIndex(st => st.kind === kind);
    if (world) go(index);
    else document.getElementById(`section-${stations[index].id}`)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  const toggleMode = () => {
    if (!world) { resetRover(); setSceneReady(false); }
    setGarage(false); setMode(world ? "page" : "world");
  };

  return <div className={s.shell} data-mode={mode ?? "world"} data-appearance={day ? "day" : "night"}>
    {world && ready && <div className={s.canvas} aria-hidden="true"><WorldGuard onFailure={onFailure}><World lang={lang} day={day} vehicle={vehicle} onReady={onSceneReady} onFailure={onFailure} /></WorldGuard></div>}
    {mode !== "page" && <div className={s.sceneShade} aria-hidden="true" />}

    <header className={s.bar}>
      <button type="button" className={s.brand} onClick={() => world ? go(0) : window.scrollTo({ top: 0 })} aria-label={`${profile.name} · ${t.returnHome}`}>
        <span className={s.monogram} aria-hidden="true">hd<span>.</span></span>
        <span className={s.brandText}>{profile.name}<small>{profile.title}</small></span>
      </button>
      <nav className={s.mainNav} aria-label={t.stations}>
        <button type="button" onClick={() => setQuickOpen(true)}>{t.projects}</button>
        <button type="button" onClick={() => visit("about")}>{t.about}</button>
        <button type="button" onClick={() => visit("contact")}>{t.contact}</button>
      </nav>
      <div className={s.prefs}>
        <div className={s.seg} role="group" aria-label={t.lang}>
          <button type="button" aria-pressed={lang === "vi"} onClick={() => setLang("vi")} lang="vi" title="Tiếng Việt">VI</button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en" title="English">EN</button>
        </div>
        <button type="button" className={s.icon} onClick={toggleColorway} aria-label={day ? t.toNight : t.toDay} title={day ? t.toNight : t.toDay}><Icon name={day ? "moon" : "sun"} /></button>
      </div>
    </header>

    {welcome && <main className={s.welcome}>
      <h1>Hoàng Đức <span>Duẫn</span></h1>
      <p className={s.welcomeRole}>{profile.title}</p>
      <p className={s.welcomeLine}>{t.heroLine}</p>
      <div className={s.heroActions}>
        <button type="button" className={s.plate} onClick={() => visit("project")} disabled={!sceneReady}>{t.explore}<Icon name="arrow" /></button>
        <button type="button" className={s.plateSteel} onClick={() => setQuickOpen(true)}><Icon name="grid" />{t.quickProjects}</button>
      </div>
      <p className={s.location}><Icon name="pin" width="15" height="15" />{profile.location[lang]}</p>
    </main>}

    {world && <>
      {!sceneReady && <p className={s.loading} role="status">{t.loading}</p>}
      <div aria-live="polite">
        {open && <aside key={station.id} className={s.panel} aria-label={stationTitle(station, lang)}>
          <button type="button" className={s.close} onClick={() => setDismissed(active)} aria-label={t.close}><Icon name="close" /></button>
          <Panel station={station} index={at} lang={lang} heading="h2" drivable />
        </aside>}
      </div>
      {!welcome && <button type="button" className={s.quickDock} onClick={() => setQuickOpen(true)}><Icon name="grid" />{t.quickProjects}</button>}

      <div className={s.bottomLeft}>
        <details className={s.routeMenu}>
          <summary><Icon name="route" />{t.itinerary}</summary>
          <nav aria-label={t.itinerary}>{stations.map((st, i) => <button key={st.id} type="button" aria-current={active === i ? "true" : undefined} onClick={e => { go(i); e.currentTarget.closest("details")?.removeAttribute("open"); }}><span>{String(i + 1).padStart(2, "0")}</span>{stationShort(st, lang)}<Icon name="arrow" width="16" height="16" /></button>)}</nav>
        </details>
        <details className={s.help}>
          <summary aria-label={t.how} title={t.how}><Icon name="help" /></summary>
          <div><h2>{t.how}</h2><dl><div><dt>W / S</dt><dd>{t.gas}</dd></div><div><dt>A / D</dt><dd>{t.steer}</dd></div><div><dt>Space</dt><dd>{t.hand}</dd></div><div><dt>Shift</dt><dd>{t.boost}</dd></div><div><dt>Enter</dt><dd>{t.auto}</dd></div></dl><p>{t.tap}.</p></div>
        </details>
        <span className={s.driveHint}>{t.tap}</span>
      </div>

      <div className={s.travelDock}>
        <div className={s.garage} ref={garageBox}>
          {garage && <div className={s.garageMenu} id="vehicle-options">
            <p className={s.label}>{t.garage}</p>
            <ul>{vehicles.map(v => <li key={v.id}><button type="button" aria-pressed={vehicle.id === v.id} onClick={() => pick(v.id)}><span className={s.swatch} style={{ background: v.paint }} /><span>{v.name[lang]}</span>{vehicle.id === v.id && <span className={s.selectedMark} aria-hidden="true" />}</button></li>)}</ul>
            <p className={s.credit}>{t.credit} {vehicles.filter(v => v.credit).map((v, i) => <span key={v.id}>{i > 0 && ", "}<a href={v.credit!.url} target="_blank" rel="noopener noreferrer">{v.credit!.author}</a></span>)}</p>
          </div>}
          <button type="button" className={s.garageBtn} aria-expanded={garage} aria-controls="vehicle-options" onClick={() => setGarage(g => !g)}><Icon name="car" width="29" height="29" /><span>{t.garage}</span></button>
        </div>
        <div className={s.tour}>
          <button type="button" className={s.step} onClick={() => go(at - 1)} aria-label={t.prev} title={t.prev}><Icon name="back" /></button>
          <p className={s.where}><span className={s.count}>{String(at + 1).padStart(2, "0")} / {String(stations.length).padStart(2, "0")}</span><span className={s.whereName}>{active >= 0 ? stationShort(station, lang) : t.driving}</span></p>
          <button type="button" className={s.nextStop} onClick={() => go(at + 1)} aria-label={t.next} title={t.next}><Icon name="arrow" /></button>
        </div>
      </div>
    </>}

    {canDrive && mode && <button type="button" className={s.modeToggle} onClick={toggleMode}>{world ? t.asPage : t.asWorld}<Icon name={world ? "grid" : "car"} width="16" height="16" /></button>}
    {mode === "page" && <main className={s.page}>
      {failed && <p className={s.failure} role="status">{t.loadFailed}</p>}
      <div className={s.pageIntroduction}><p>{t.heroLine}</p><button className={s.plate} type="button" onClick={() => setQuickOpen(true)}>{t.quickProjects}<Icon name="arrow" /></button></div>
      {stations.map((st, i) => <section key={st.id} id={`section-${st.id}`} className={s.sheet}><Panel station={st} index={i} lang={lang} heading={i === 0 ? "h1" : "h2"} /></section>)}
    </main>}
    {quickOpen && <QuickProjects lang={lang} onClose={() => setQuickOpen(false)} onVisit={world ? i => { setQuickOpen(false); go(i); } : undefined} />}
  </div>;
}
