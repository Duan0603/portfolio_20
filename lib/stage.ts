/**
 * Shared between the DOM monolith and the WebGL atelier, which renders in its
 * own React root. The DOM owns the layout (the prism's box, in pixels); this
 * module turns scroll into one pose per frame and both sides draw from it, so
 * the faces of text and the stone block under them never drift apart.
 *
 * The CSS perspective is PERSP x the stage height, which fixes the WebGL
 * camera's field of view and makes one world unit = persp / CAM_Z pixels on
 * the z = 0 plane.
 */
export const CAM_Z = 6;
export const PERSP = 1.3;

export type Gl = "pending" | "on" | "off";

/* Pointer in -1..1, lerped for cinematic smoothness. */
export const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

export const stage = {
  /** the fixed element that carries the CSS perspective */
  root: null as HTMLElement | null,
  /** the rotating block */
  prism: null as HTMLElement | null,
  /** one in-flow marker per face; their height is the scroll per quarter turn */
  track: null as HTMLElement | null,
  faces: [] as (HTMLElement | null)[],
  count: 0,
  /** reduced motion or a very short viewport: the faces are a flat page */
  flat: false,
  gl: "pending" as Gl,
  /** when the WebGL loop last drove a frame */
  glAt: 0,

  // layout, in pixels
  vw: 0,
  vh: 0,
  w: 0,
  h: 0,
  /** the prism's centre, relative to the centre of the stage */
  ox: 0,
  oy: 0,
  step: 1,
  persp: 0,
  /** bumped whenever the layout changes */
  layout: 0,

  // pose
  /** smoothed scroll, in faces */
  turn: 0,
  yaw: 0,
  tilt: 0,
  z: 0,
  /** the face nearest to square-on */
  face: 0,
};

const listeners = new Set<() => void>();
export const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const emit = () => listeners.forEach((l) => l());

export const getFace = () => stage.face;
export const getGl = () => stage.gl;
export const getLayout = () => stage.layout;

export function setGl(gl: Gl) {
  if (stage.gl === gl) return;
  stage.gl = gl;
  emit();
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const smoother = (n: number) => {
  const t = clamp(n, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/* What was last written to the DOM, so a frame that changes nothing writes nothing. */
const written = {
  prism: "",
  opacity: [] as string[],
  events: [] as string[],
  transform: [] as string[],
  visibility: [] as string[],
};
let started = false;
/* 1 on arrival, easing to 0 */
let intro = 1;

/** Forget what was written, after React or a mode change has touched the same styles. */
export function resetWrites() {
  written.prism = "";
  written.opacity = [];
  written.events = [];
  written.transform = [];
  written.visibility = [];
  started = false;
}

/** Read the stage layout box. Call on mount and whenever the stage resizes. */
export function measure() {
  const { root, prism, track } = stage;
  if (!root || !prism) return;
  const vw = root.clientWidth;
  const vh = root.clientHeight;
  const w = prism.offsetWidth;
  const h = prism.offsetHeight;
  const ox = prism.offsetLeft + w / 2 - vw / 2;
  const oy = prism.offsetTop + h / 2 - vh / 2;
  const marker = track?.firstElementChild as HTMLElement | null;
  stage.step = marker?.offsetHeight || vh || 1;

  if (vw === stage.vw && vh === stage.vh && w === stage.w && h === stage.h && ox === stage.ox && oy === stage.oy) {
    return;
  }
  Object.assign(stage, { vw, vh, w, h, ox, oy, persp: PERSP * vh });
  stage.layout++;
  emit();
}

export function goTo(face: number) {
  const i = clamp(face, 0, stage.count - 1);
  window.scrollTo({ top: i * stage.step, behavior: "smooth" });
}

/** Advance the pose by one frame and write it to the DOM. */
export function update(dt: number, fromGl = false) {
  if (fromGl) stage.glAt = performance.now();
  const s = stage;
  const n = s.count;
  if (s.flat || !s.prism || n < 2) return;

  const ease = (rate: number) => 1 - Math.exp(-dt * rate);
  pointer.x += (pointer.tx - pointer.x) * ease(7);
  pointer.y += (pointer.ty - pointer.y) * ease(7);

  const target = clamp(window.scrollY / s.step, 0, n - 1);
  if (started) {
    s.turn += (target - s.turn) * ease(18);
  } else {
    s.turn = target;
    started = true;
  }
  intro *= Math.exp(-dt * 3.5);
  if (intro < 0.001) intro = 0;

  // The stage frame itself stays fixed without 3D rotation distortion
  if (written.prism !== "clean") {
    s.prism.style.transform = "none";
    written.prism = "clean";
  }

  // Update opacity, subtle translation, and interactivity for each scrollytelling panel
  const near = Math.round(target);
  for (let f = 0; f < n; f++) {
    const el = s.faces[f];
    if (!el) continue;
    const d = f - s.turn;
    const absD = Math.abs(d);

    let opacity = "0";
    let events = "none";
    let vis = "hidden";
    let trans = `translate3d(0, ${d > 0 ? 44 : -44}px, 0)`;

    if (absD < 1.0) {
      const opNum = Math.max(0, 1 - absD * 1.45) * (1 - intro * 0.9);
      opacity = opNum.toFixed(3);
      events = absD < 0.38 ? "auto" : "none";
      vis = opNum > 0.01 ? "visible" : "hidden";
      trans = `translate3d(0, ${(d * 38).toFixed(1)}px, 0)`;
    }

    if (opacity !== written.opacity[f]) {
      el.style.opacity = opacity;
      written.opacity[f] = opacity;
    }
    if (events !== written.events[f]) {
      el.style.pointerEvents = events;
      written.events[f] = events;
    }
    if (trans !== written.transform[f]) {
      el.style.transform = trans;
      written.transform[f] = trans;
    }
    if (vis !== written.visibility[f]) {
      el.style.visibility = vis;
      written.visibility[f] = vis;
    }
  }

  if (near !== s.face) {
    s.face = near;
    emit();
  }
}
