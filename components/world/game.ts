import { projects, type Project } from "@/lib/data";

/**
 * The drivable atelier, without the drawing: where the exhibits stand, the
 * rover's state, and the arcade physics that moves it. The WebGL scene and the
 * DOM interface both read and steer this one module, since the scene renders
 * in its own React root.
 */
export const featured = projects.filter((p) => p.highlights);
export const rest = projects.filter((p) => !p.highlights);

export type Kind = "intro" | "project" | "repos" | "about" | "skills" | "contact";
export type Station = {
  id: string;
  kind: Kind;
  project?: Project;
  /** where the slab stands, and which way its face looks */
  x: number;
  z: number;
  rot: number;
  /** where the rover pulls up to read it */
  px: number;
  pz: number;
};

const SPAWN = { x: 0, z: 5 };
/* Slabs stand on an arc to the north and all turn towards one point in the
   south, so every face can be read from the camera's side of the hall. */
const RADIUS = 31;
const FOCUS = { x: 0, z: 22 };
const PARK = 6.2;

/* The order a visitor gets to know someone in: who he is, what he works with,
   what he has built with it, and then how to reach him. */
const ring: Pick<Station, "id" | "kind" | "project">[] = [
  { id: "about", kind: "about" },
  { id: "skills", kind: "skills" },
  ...featured.map((p, i) => ({ id: `project-${i + 1}`, kind: "project" as const, project: p })),
  { id: "repos", kind: "repos" },
  { id: "contact", kind: "contact" },
];

export const stations: Station[] = [
  { id: "intro", kind: "intro", x: SPAWN.x, z: SPAWN.z, rot: 0, px: SPAWN.x, pz: SPAWN.z },
  ...ring.map((s, k) => {
    const t = ((150 - (k * 120) / (ring.length - 1)) * Math.PI) / 180;
    const x = RADIUS * Math.cos(t);
    const z = -RADIUS * Math.sin(t);
    const d = Math.hypot(FOCUS.x - x, FOCUS.z - z);
    const nx = (FOCUS.x - x) / d;
    const nz = (FOCUS.z - z) / d;
    return { ...s, x, z, rot: Math.atan2(nx, nz), px: x + nx * PARK, pz: z + nz * PARK };
  }),
];

/** Where each station's small exhibit object stands, beside its slab. */
export const propSpot = (s: Station) => {
  const nx = Math.sin(s.rot);
  const nz = Math.cos(s.rot);
  return { x: s.x + nz * 5 + nx * 1.6, z: s.z - nx * 5 + nz * 1.6 };
};

type Circle = { x: number; z: number; r: number };
/* Things the rover cannot drive through: each slab as three circles along its
   width, and the exhibit object beside it. */
export const obstacles: Circle[] = stations.slice(1).flatMap((s) => {
  const tx = Math.cos(s.rot);
  const tz = -Math.sin(s.rot);
  const p = propSpot(s);
  return [
    // the board stands on a plinth that runs back from its front edge
    ...[-2.3, 0, 2.3].map((o) => ({
      x: s.x + tx * o - Math.sin(s.rot) * 0.5,
      z: s.z + tz * o - Math.cos(s.rot) * 0.5,
      r: 1.65,
    })),
    { x: p.x, z: p.z, r: 1.1 },
  ];
});

export const BOUNDS = { x: 38, north: -35, south: 15 };
export const ROVER_R = 0.95;

export const game = {
  x: SPAWN.x,
  z: SPAWN.z,
  /** heading; forward is (sin h, cos h), so PI looks north into the hall */
  h: Math.PI,
  /** velocity over the floor; it lags the heading, which is what a slide is */
  vx: 0,
  vz: 0,
  /** speed along the nose (negative in reverse) and across it (the slide) */
  forward: 0,
  slide: 0,
  /** front wheels, -1 hard left to 1 hard right */
  steer: 0,
  braking: false,
  /** the chosen vehicle's top speed and pull, relative to the rover */
  pace: 1,

  // what the driver is asking for
  throttle: 0,
  wheel: 0,
  handbrake: false,
  boost: false,

  /** where the rover is driving itself to, and for how long it has been trying */
  target: null as { x: number; z: number } | null,
  targetAge: 0,
  /** autopilot only: how long it has been held up, and time left backing out of it */
  stuck: 0,
  backing: 0,
  backingWheel: 1,
  /** the station the rover is parked at, -1 between stations */
  active: 0,
  /** where the camera aims relative to the rover, to keep it clear of the panel */
  shiftX: 0,
  shiftZ: 0,
  fonts: { display: "sans-serif", body: "sans-serif", mono: "monospace" },
};

const listeners = new Set<() => void>();
export const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
export const getActive = () => game.active;

export function driveTo(index: number) {
  const s = stations[(index + stations.length) % stations.length];
  setTarget(s.px, s.pz);
}

export function setTarget(x: number, z: number) {
  game.target = { x, z };
  game.targetAge = 0;
  game.stuck = 0;
  game.backing = 0;
}

export function resetRover() {
  Object.assign(game, {
    x: SPAWN.x,
    z: SPAWN.z,
    h: Math.PI,
    vx: 0,
    vz: 0,
    forward: 0,
    slide: 0,
    steer: 0,
    throttle: 0,
    wheel: 0,
    handbrake: false,
    boost: false,
    target: null,
  });
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const TOP = 13;
const TOP_BOOST = 19;
const TOP_REVERSE = 6;

/**
 * One frame of driving: a small car, not a cursor. Power goes through the
 * nose, the front wheels turn it only while it rolls, and the tyres hold the
 * tail in line unless the handbrake lets it go.
 */
export function step(dt: number) {
  const g = game;
  let throttle = g.throttle;
  let wheel = g.wheel;
  let handbrake = g.handbrake;
  let top = (g.boost ? TOP_BOOST : TOP) * g.pace;

  if (throttle || wheel || handbrake) {
    g.target = null; // taking the wheel cancels the autopilot
  } else if (g.target) {
    // the autopilot drives the same car, with the same controls
    const tx = g.target.x - g.x;
    const tz = g.target.z - g.z;
    const d = Math.hypot(tx, tz);
    g.targetAge += dt;
    if (d < 1.1 || g.targetAge > 30) {
      g.target = null;
      handbrake = true;
    } else if (g.backing > 0) {
      // held up against something: back out on the opposite lock, then try again
      g.backing -= dt;
      throttle = -1;
      wheel = g.backingWheel;
    } else {
      const off = wrap(Math.atan2(tx, tz) - g.h);
      // steer round whatever stands between the car and where it is going
      const hx = Math.sin(g.h);
      const hz = Math.cos(g.h);
      let avoid = 0;
      for (const o of obstacles) {
        const ox = o.x - g.x;
        const oz = o.z - g.z;
        const ahead = ox * hx + oz * hz;
        if (ahead < 0 || ahead > Math.min(6, d)) continue;
        const side = ox * hz - oz * hx; // positive: it is to the right
        const clear = o.r + ROVER_R + 0.6;
        if (Math.abs(side) < clear) {
          avoid += (side >= 0 ? -1 : 1) * (1 - Math.abs(side) / clear) * (1 - ahead / 6) * 3;
        }
      }
      wheel = clamp(-off * 2.2 + avoid, -1, 1);
      // slow for the corner and for the stop
      const want = Math.min(top, 2.5 + d * 1.5) * Math.max(0.3, Math.cos(off));
      throttle = clamp((want - g.forward) / 2.5, -1, 1);

      g.stuck = Math.abs(g.forward) < 0.8 && g.targetAge > 0.8 ? g.stuck + dt : 0;
      if (g.stuck > 0.9) {
        g.stuck = 0;
        g.backing = 1.1;
        g.backingWheel = wheel >= 0 ? -1 : 1;
      }
    }
  }

  // steering: the wheels turn quickly, the car only as fast as it is rolling
  g.steer += (wheel - g.steer) * (1 - Math.exp(-dt * 10));
  const bite = clamp(g.forward / 4.5, -1, 1);
  const calm = 1 - Math.min(0.45, Math.abs(g.forward) / 40); // less twitchy at speed
  g.h -= g.steer * 2.9 * bite * calm * (handbrake ? 1.35 : 1) * dt;

  // read the velocity against the new nose: what is not along it is the slide
  const fx = Math.sin(g.h);
  const fz = Math.cos(g.h);
  let forward = g.vx * fx + g.vz * fz;
  let slide = g.vx * fz - g.vz * fx;

  // engine and brakes
  g.braking = handbrake || (throttle < 0 && forward > 0.5);
  if (throttle > 0) {
    forward += (forward < 0 ? 26 : 15 * g.pace) * throttle * dt;
  } else if (throttle < 0) {
    forward += (forward > 0 ? 28 : 9) * throttle * dt;
  }
  forward *= Math.exp(-dt * (throttle ? 0.35 : 1.5));
  if (handbrake) forward *= Math.exp(-dt * 2.2);
  forward = clamp(forward, -TOP_REVERSE, top);

  // tyres pull the tail back in line, unless the handbrake has let it go
  slide *= Math.exp(-dt * (handbrake ? 1.2 : 6.5));

  g.vx = fx * forward + fz * slide;
  g.vz = fz * forward - fx * slide;
  g.forward = forward;
  g.slide = slide;

  g.x += g.vx * dt;
  g.z += g.vz * dt;

  // glance off anything solid instead of stopping dead against it
  for (const o of obstacles) {
    const ox = g.x - o.x;
    const oz = g.z - o.z;
    const d = Math.hypot(ox, oz);
    const min = o.r + ROVER_R;
    if (d < min && d > 0.0001) {
      const nx = ox / d;
      const nz = oz / d;
      g.x = o.x + nx * min;
      g.z = o.z + nz * min;
      const into = g.vx * nx + g.vz * nz;
      if (into < 0) {
        g.vx -= nx * into * 1.3;
        g.vz -= nz * into * 1.3;
      }
    }
  }
  if (Math.abs(g.x) > BOUNDS.x) {
    g.x = clamp(g.x, -BOUNDS.x, BOUNDS.x);
    g.vx *= -0.3;
  }
  if (g.z > BOUNDS.south || g.z < BOUNDS.north) {
    g.z = clamp(g.z, BOUNDS.north, BOUNDS.south);
    g.vz *= -0.3;
  }

  let active = -1;
  let best = 4.6;
  stations.forEach((s, i) => {
    const d = Math.hypot(g.x - s.px, g.z - s.pz);
    if (d < best) {
      best = d;
      active = i;
    }
  });
  if (active !== g.active) {
    g.active = active;
    listeners.forEach((l) => l());
  }
}
