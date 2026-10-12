"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Lang } from "@/lib/data";
import { profile } from "@/lib/data";
import {
  BOUNDS,
  ROVER_R,
  game,
  setTarget,
  obstacles,
  propSpot,
  stations,
  step,
  type Station,
} from "./game";
import { stationChips, stationNote, stationTitle } from "./copy";

const AMBER = "#f2bb6e";
/* An exhibit board: landscape, leaning back so it meets the camera square-on. */
const BOARD = { w: 6.8, h: 4.2, d: 0.3, tilt: 0.74 };

const obsidian = new THREE.MeshPhysicalMaterial({
  // honed, not mirror-polished: the headlight should wash a face, not burn a spot into it
  color: "#1a2029",
  metalness: 0.35,
  roughness: 0.58,
  clearcoat: 0.35,
  clearcoatRoughness: 0.5,
  envMapIntensity: 1.3,
});
const steel = new THREE.MeshStandardMaterial({ color: "#8d98a8", metalness: 0.75, roughness: 0.38 });
const offcut = new THREE.MeshStandardMaterial({ color: "#59636f", metalness: 0.6, roughness: 0.45 });
const glow = new THREE.MeshBasicMaterial({ color: AMBER, toneMapped: false });

/* ---- Text drawn to textures, in the page's own typefaces ---- */

function wrapLines(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function texture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * A board's face, drawn as a lit display: where it sits in the tour, its title
 * as large as the board allows, a line of detail, and its technologies as tags.
 */
function boardFace(title: string, note: string, chips: string[], index: number) {
  const W = 1360;
  const H = 840;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.textBaseline = "top";

  const ground = ctx.createLinearGradient(0, 0, W, H);
  ground.addColorStop(0, "#232a35");
  ground.addColorStop(0.55, "#181d25");
  ground.addColorStop(1, "#11151b");
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, W, H);
  // the lit top edge
  const edge = ctx.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, AMBER);
  edge.addColorStop(0.6, "rgba(242,187,110,0.35)");
  edge.addColorStop(1, "rgba(242,187,110,0)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, W, 8);

  const pad = 84;
  ctx.fillStyle = AMBER;
  ctx.font = `500 38px ${game.fonts.mono}`;
  ctx.fillText(`${String(index + 1).padStart(2, "0")} / ${String(stations.length).padStart(2, "0")}`, pad, 78);

  // the title takes the largest size that keeps it to two lines
  let size = 168;
  let lines: string[] = [];
  for (; size >= 96; size -= 12) {
    ctx.font = `800 ${size}px ${game.fonts.display}`;
    lines = wrapLines(ctx, title, W - pad * 2);
    if (lines.length <= 2) break;
  }
  ctx.fillStyle = "#eef1f5";
  let y = 168;
  for (const line of lines.slice(0, 2)) {
    ctx.fillText(line, pad - 4, y);
    y += size * 1.02;
  }

  if (note) {
    ctx.fillStyle = "#aab4c0";
    ctx.font = `400 40px ${game.fonts.body}`;
    y += 22;
    for (const line of wrapLines(ctx, note, W - pad * 2).slice(0, 2)) {
      ctx.fillText(line, pad, y);
      y += 54;
    }
  }

  // tags along the foot of the board
  ctx.font = `400 32px ${game.fonts.mono}`;
  ctx.textBaseline = "middle";
  let x = pad;
  const row = H - 118;
  for (const chip of chips) {
    const w = ctx.measureText(chip).width + 44;
    if (x + w > W - pad) break;
    ctx.fillStyle = "rgba(151,163,176,0.1)";
    ctx.strokeStyle = "rgba(151,163,176,0.34)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x, row - 30, w, 60);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c3ccd6";
    ctx.fillText(chip, x + 22, row + 2);
    x += w + 14;
  }
  return texture(c);
}

/** The bay number, painted on the floor where the rover pulls up. */
function bayNumber(index: number, day: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = day ? "#8a5412" : AMBER;
  ctx.font = `800 150px ${game.fonts.display}`;
  ctx.fillText(String(index + 1).padStart(2, "0"), 128, 136);
  return texture(c);
}

function floorLabel(lines: [string, string], day: boolean) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 640;
  const ctx = c.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = day ? "#16181c" : "#eef1f5";
  ctx.font = `800 250px ${game.fonts.display}`;
  ctx.fillText(lines[0], 1024, 250);
  ctx.fillStyle = day ? "#8a5412" : AMBER;
  ctx.font = `400 64px ${game.fonts.mono}`;
  ctx.fillText(lines[1], 1024, 500);
  return texture(c);
}

/* ---- The hall ---- */

function Floor({ day }: { day: boolean }) {
  const grid = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = day ? "#e3dfd8" : "#1c2129";
    ctx.fillRect(0, 0, 256, 256);
    // milled joints between the floor plates
    ctx.strokeStyle = day ? "rgba(74,81,90,0.28)" : "rgba(151,163,176,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 254, 254);
    const t = texture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(60, 60);
    return t;
  }, [day]);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setTarget(
      Math.min(BOUNDS.x, Math.max(-BOUNDS.x, e.point.x)),
      Math.min(BOUNDS.south, Math.max(BOUNDS.north, e.point.z))
    );
  };

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow onPointerDown={onDown}>
      <planeGeometry args={[240, 240]} />
      <meshStandardMaterial map={grid} metalness={day ? 0.1 : 0.3} roughness={day ? 0.8 : 0.62} />
    </mesh>
  );
}

/** The name, set into the floor where the visitor arrives. */
function Threshold({ lang, day }: { lang: Lang; day: boolean }) {
  const map = useMemo(
    () => floorLabel([profile.name, `${profile.title} / ${profile.location[lang]}`], day),
    [lang, day]
  );
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -3.2]}>
      <planeGeometry args={[14, 4.375]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Where the self-driving rover is headed. */
function Marker() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = game.target;
    ref.current.visible = !!t;
    if (!t) return;
    ref.current.position.set(t.x, 0.03, t.z);
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.12);
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} visible={false}>
      <ringGeometry args={[0.42, 0.52, 40]} />
      <primitive object={glow} attach="material" />
    </mesh>
  );
}

/* ---- Exhibits ---- */

/** A small object beside each slab that says what the exhibit is about. */
function Prop({ station }: { station: Station }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.35;
  });
  const name = station.project?.name ?? "";

  if (station.kind === "project" && name.includes("Cinema")) {
    // the seat map, with one lit SweetBox pair
    return (
      <group>
        {[0, 1, 2].flatMap((r) =>
          [0, 1, 2, 3].map((c) => {
            const lit = r === 2 && (c === 1 || c === 2);
            return (
              <mesh key={`${r}-${c}`} position={[(c - 1.5) * 0.5, 0.2 + r * 0.16, (r - 1) * 0.55]} castShadow material={lit ? glow : obsidian}>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
              </mesh>
            );
          })
        )}
      </group>
    );
  }
  if (station.kind === "project" && name.includes("Waste")) {
    // three sorting bins under a camera arm
    return (
      <group>
        {[-0.75, 0, 0.75].map((x, i) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow material={obsidian}>
              <cylinderGeometry args={[0.32, 0.26, 0.9, 20, 1, true]} />
            </mesh>
            {i === 1 && (
              <mesh position={[0, 0.9, 0]} rotation-x={Math.PI / 2} material={glow}>
                <torusGeometry args={[0.32, 0.025, 8, 32]} />
              </mesh>
            )}
          </group>
        ))}
        <mesh position={[-1.25, 0.9, 0]} castShadow material={steel}>
          <boxGeometry args={[0.08, 1.8, 0.08]} />
        </mesh>
        <mesh position={[-0.6, 1.8, 0]} castShadow material={steel}>
          <boxGeometry args={[1.4, 0.08, 0.08]} />
        </mesh>
      </group>
    );
  }
  if (station.kind === "project") {
    // a barbell on its rack
    return (
      <group>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.5, 0]} castShadow material={steel}>
            <boxGeometry args={[0.1, 1, 0.1]} />
          </mesh>
        ))}
        <mesh position={[0, 1.05, 0]} rotation-z={Math.PI / 2} castShadow material={steel}>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 12]} />
        </mesh>
        {[-1, -0.86, 0.86, 1].map((x) => (
          <mesh key={x} position={[x, 1.05, 0]} rotation-z={Math.PI / 2} castShadow material={obsidian}>
            <cylinderGeometry args={[0.42, 0.42, 0.1, 28]} />
          </mesh>
        ))}
      </group>
    );
  }
  if (station.kind === "repos") {
    // one small slab per repo
    return (
      <group>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[(i - 2.5) * 0.42, 0.55 + (i % 2) * 0.12, Math.sin(i * 1.7) * 0.25]} rotation-y={(i - 2.5) * 0.12} castShadow material={obsidian}>
            <boxGeometry args={[0.3, 1.1 + (i % 2) * 0.24, 0.8]} />
          </mesh>
        ))}
      </group>
    );
  }
  if (station.kind === "skills") {
    // the full stack, literally: six slabs with light in the seams
    return (
      <group ref={spin}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} position={[0, 0.2 + i * 0.36, 0]} rotation-y={i * 0.22}>
            <mesh castShadow material={obsidian}>
              <boxGeometry args={[1.3 - i * 0.04, 0.28, 1.3 - i * 0.04]} />
            </mesh>
            <mesh position={[0, 0.18, 0]} material={glow}>
              <boxGeometry args={[1.05, 0.03, 1.05]} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }
  if (station.kind === "contact") {
    // a beacon: the one lit plate in the hall
    return (
      <group>
        <mesh position={[0, 1.3, 0]} castShadow material={obsidian}>
          <boxGeometry args={[0.5, 2.6, 0.5]} />
        </mesh>
        <mesh position={[0, 2.75, 0]} material={glow}>
          <boxGeometry args={[0.62, 0.3, 0.62]} />
        </mesh>
        <pointLight position={[0, 2.9, 0]} color={AMBER} intensity={14} distance={9} />
      </group>
    );
  }
  // profile: a single cut shard, turning
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow material={steel}>
        <boxGeometry args={[0.9, 0.6, 0.9]} />
      </mesh>
      <group ref={spin} position={[0, 1.35, 0]}>
        <mesh castShadow material={obsidian} scale={[0.55, 0.8, 0.55]}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
      </group>
    </group>
  );
}

function Exhibit({ station, index, lang, day }: { station: Station; index: number; lang: Lang; day: boolean }) {
  const face = useMemo(
    () => boardFace(stationTitle(station, lang), stationNote(station, lang), stationChips(station, lang), index),
    [station, index, lang]
  );
  const bay = useMemo(() => bayNumber(index, day), [index, day]);
  useEffect(() => () => face.dispose(), [face]);
  useEffect(() => () => bay.dispose(), [bay]);

  const screen = useRef<THREE.MeshBasicMaterial>(null!);
  const ring = useRef<THREE.MeshBasicMaterial>(null!);
  const number = useRef<THREE.MeshBasicMaterial>(null!);
  const level = useRef(0);
  useFrame((_, dt) => {
    // the board and the bay in front of it wake as the rover pulls up
    level.current += ((game.active === index ? 1 : 0) - level.current) * (1 - Math.exp(-dt * 5));
    const on = level.current;
    screen.current.color.setScalar(0.62 + on * 0.38);
    ring.current.opacity = 0.2 + on * 0.8;
    number.current.opacity = 0.22 + on * 0.5;
  });

  const { w, h, d, tilt } = BOARD;
  const rise = Math.cos(tilt) * h;
  const run = Math.sin(tilt) * h;
  const front = 1.1; // how far the board's foot stands in front of the station's centre
  const prop = propSpot(station);
  return (
    <>
      <group position={[station.x, 0, station.z]} rotation-y={station.rot}>
        {/* plinth, with the light caught under it */}
        <mesh position={[0, 0.06, front - (run + 0.5) / 2]} material={glow}>
          <boxGeometry args={[w * 0.96, 0.12, (run + 0.5) * 0.9]} />
        </mesh>
        <RoundedBox args={[w, 0.5, run + 0.5]} radius={0.04} smoothness={2} position={[0, 0.37, front - (run + 0.5) / 2]} castShadow receiveShadow material={obsidian} />
        {/* the wall the board leans back on */}
        <RoundedBox args={[w, rise + 0.3, 0.3]} radius={0.04} smoothness={2} position={[0, 0.62 + (rise + 0.3) / 2, front - run - 0.2]} castShadow material={obsidian} />
        <group position={[0, 0.62 + rise / 2, front - run / 2]} rotation-x={-tilt}>
          <RoundedBox args={[w, h, d]} radius={0.03} smoothness={2} castShadow material={obsidian} />
          <mesh position={[0, 0, d / 2 + 0.01]}>
            <planeGeometry args={[w - 0.16, h - 0.16]} />
            <meshBasicMaterial ref={screen} map={face} toneMapped={false} />
          </mesh>
        </group>
      </group>

      <group position={[station.px, 0, station.pz]} rotation-y={station.rot}>
        <mesh position={[0, 0.025, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.9, 2, 64]} />
          <meshBasicMaterial ref={ring} color={AMBER} transparent opacity={0.2} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.02, 3.1]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial ref={number} map={bay} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      <group position={[prop.x, 0, prop.z]} rotation-y={station.rot}>
        <Prop station={station} />
      </group>
    </>
  );
}

/* ---- Loose offcuts: nothing depends on them, they are just there to be driven into ---- */

const CUBE = 0.56;
const piles = [
  { x: -11, z: 1.5, cols: 5, rows: 4 },
  { x: 10.5, z: -7.5, cols: 4, rows: 4 },
  { x: -1.5, z: -11, cols: 6, rows: 3 },
  { x: 14, z: 3, cols: 3, rows: 3 },
];

function Offcuts() {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const bodies = useMemo(
    () =>
      piles.flatMap((p) =>
        Array.from({ length: p.cols * p.rows }, (_, i) => ({
          x: p.x + ((i % p.cols) - (p.cols - 1) / 2) * 0.72,
          z: p.z + (Math.floor(i / p.cols) - (p.rows - 1) / 2) * 0.72,
          y: 0,
          vx: 0,
          vy: 0,
          vz: 0,
          rot: 0,
          spin: 0,
        }))
      ),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const r = CUBE * 0.6;
    const drag = Math.exp(-dt * 2.2);

    for (const b of bodies) {
      // knocked by the rover: take its speed and a little hop
      const dx = b.x - game.x;
      const dz = b.z - game.z;
      const d = Math.hypot(dx, dz);
      const min = ROVER_R + r;
      if (d < min && d > 0.0001) {
        const nx = dx / d;
        const nz = dz / d;
        b.x = game.x + nx * min;
        b.z = game.z + nz * min;
        const hit = Math.max(0, game.vx * nx + game.vz * nz);
        b.vx += nx * (hit * 1.25 + 0.6);
        b.vz += nz * (hit * 1.25 + 0.6);
        if (b.y < 0.02) b.vy = Math.min(4.5, hit * 0.45);
        b.spin += (Math.random() - 0.5) * hit * 1.6;
      }
      b.x += b.vx * dt;
      b.z += b.vz * dt;
      b.vx *= drag;
      b.vz *= drag;
      b.vy -= 18 * dt;
      b.y += b.vy * dt;
      if (b.y < 0) {
        b.y = 0;
        b.vy = b.vy < -1.5 ? -b.vy * 0.3 : 0;
      }
      b.rot += b.spin * dt;
      b.spin *= drag;

      for (const o of obstacles) {
        const ox = b.x - o.x;
        const oz = b.z - o.z;
        const od = Math.hypot(ox, oz);
        if (od < o.r + r && od > 0.0001) {
          b.x = o.x + (ox / od) * (o.r + r);
          b.z = o.z + (oz / od) * (o.r + r);
          b.vx *= -0.35;
          b.vz *= -0.35;
        }
      }
      b.x = Math.min(BOUNDS.x + 2, Math.max(-BOUNDS.x - 2, b.x));
      b.z = Math.min(BOUNDS.south + 2, Math.max(BOUNDS.north - 2, b.z));
    }

    // offcuts shove each other apart
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dz);
        if (d < r * 2 && d > 0.0001) {
          const push = (r * 2 - d) / 2;
          const nx = dx / d;
          const nz = dz / d;
          a.x -= nx * push;
          a.z -= nz * push;
          b.x += nx * push;
          b.z += nz * push;
          const rel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
          if (rel > 0) {
            a.vx -= nx * rel * 0.5;
            a.vz -= nz * rel * 0.5;
            b.vx += nx * rel * 0.5;
            b.vz += nz * rel * 0.5;
          }
        }
      }
    }

    bodies.forEach((b, i) => {
      dummy.position.set(b.x, CUBE / 2 + b.y, b.z);
      dummy.rotation.set(0, b.rot, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, bodies.length]} castShadow receiveShadow material={offcut}>
      <boxGeometry args={[CUBE, CUBE, CUBE]} />
    </instancedMesh>
  );
}

/* ---- Tyre marks: left wherever the tail steps out ---- */

const MARKS = 260;

function Skids({ day }: { day: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const next = useRef(0);
  const lastAt = useRef({ x: game.x, z: game.z });
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    // park every mark under the floor until it is laid
    dummy.position.set(0, -5, 0);
    dummy.updateMatrix();
    for (let i = 0; i < MARKS; i++) mesh.current.setMatrixAt(i, dummy.matrix);
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame(() => {
    const g = game;
    const sliding = Math.abs(g.slide) > 2.2 || (g.braking && Math.abs(g.forward) > 4);
    const moved = Math.hypot(g.x - lastAt.current.x, g.z - lastAt.current.z);
    if (!sliding) {
      lastAt.current = { x: g.x, z: g.z };
      return;
    }
    if (moved < 0.32) return;
    lastAt.current = { x: g.x, z: g.z };

    const fx = Math.sin(g.h);
    const fz = Math.cos(g.h);
    const along = Math.atan2(g.vx, g.vz);
    for (const side of [-0.62, 0.62]) {
      // under each rear wheel, pointing the way the car is actually travelling
      dummy.position.set(g.x + fz * side - fx * 0.58, 0.012, g.z - fx * side - fz * 0.58);
      dummy.rotation.set(-Math.PI / 2, 0, -along);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(next.current, dummy.matrix);
      next.current = (next.current + 1) % MARKS;
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MARKS]} frustumCulled={false}>
      <planeGeometry args={[0.2, 0.42]} />
      <meshBasicMaterial color={day ? "#3a3d42" : "#05070a"} transparent opacity={day ? 0.35 : 0.7} depthWrite={false} />
    </instancedMesh>
  );
}

/* ---- The rover: a small vision robot carrying the hall's one warm light ---- */

function Rover() {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const fronts = useRef<(THREE.Group | null)[]>([]);
  const tail = useRef<THREE.MeshBasicMaterial>(null!);
  const was = useRef(0);
  const lamp = useRef<THREE.SpotLight>(null!);
  const aim = useRef<THREE.Object3D>(null!);

  useEffect(() => {
    lamp.current.target = aim.current;
  }, []);

  useFrame((_, delta) => {
    // fixed physics steps, so a slow frame costs smoothness and never speed
    let left = Math.min(delta, 0.25);
    while (left > 0.0001) {
      step(Math.min(left, 1 / 30));
      left -= 1 / 30;
    }
    const dt = Math.min(delta, 0.05);
    const g = game;
    root.current.position.set(g.x, 0, g.z);
    root.current.rotation.y = g.h;

    // the body rolls out of a corner and pitches under power and braking
    const k = 1 - Math.exp(-dt * 8);
    const accel = (g.forward - was.current) / Math.max(dt, 0.001);
    was.current = g.forward;
    const roll = g.steer * Math.min(1, Math.abs(g.forward) / 7) * 0.16 + g.slide * 0.018;
    body.current.rotation.z += (roll - body.current.rotation.z) * k;
    body.current.rotation.x += (Math.max(-0.09, Math.min(0.09, -accel * 0.006)) - body.current.rotation.x) * k;
    wheels.current.forEach((w) => {
      if (w) w.rotation.x += (g.forward * dt) / 0.3;
    });
    fronts.current.forEach((f) => {
      if (f) f.rotation.y = -g.steer * 0.5;
    });
    tail.current.color.set(g.braking ? "#ff5a36" : "#7a2a18");

    // the camera head keeps looking at the nearest exhibit
    let look = 0;
    let best = Infinity;
    for (const s of stations.slice(1)) {
      const d = Math.hypot(s.x - g.x, s.z - g.z);
      if (d < best) {
        best = d;
        look = Math.atan2(s.x - g.x, s.z - g.z) - g.h;
      }
    }
    const diff = Math.atan2(Math.sin(look - head.current.rotation.y), Math.cos(look - head.current.rotation.y));
    head.current.rotation.y += diff * (1 - Math.exp(-dt * 4));
  });

  return (
    <group ref={root}>
      <group ref={body}>
        <RoundedBox args={[1.1, 0.4, 1.75]} radius={0.08} smoothness={3} position={[0, 0.52, 0]} castShadow material={steel} />
        <RoundedBox args={[0.82, 0.16, 0.95]} radius={0.05} smoothness={2} position={[0, 0.8, -0.18]} castShadow material={obsidian} />
        {/* light bar */}
        <mesh position={[0, 0.52, 0.885]} material={glow}>
          <boxGeometry args={[0.86, 0.07, 0.03]} />
        </mesh>
        <mesh position={[0, 0.52, -0.885]}>
          <boxGeometry args={[0.86, 0.05, 0.03]} />
          <meshBasicMaterial ref={tail} color="#7a2a18" toneMapped={false} />
        </mesh>
        {/* camera mast */}
        <mesh position={[0, 1.08, -0.3]} castShadow material={steel}>
          <cylinderGeometry args={[0.035, 0.035, 0.44, 10]} />
        </mesh>
        <group ref={head} position={[0, 1.36, -0.3]}>
          <RoundedBox args={[0.4, 0.24, 0.3]} radius={0.04} smoothness={2} castShadow material={obsidian} />
          <mesh position={[0, 0, 0.16]} material={glow}>
            <sphereGeometry args={[0.075, 16, 12]} />
          </mesh>
        </group>
      </group>

      {([[-0.62, 0.58], [0.62, 0.58], [-0.62, -0.58], [0.62, -0.58]] as const).map(([x, z], i) => (
        <group
          key={i}
          position={[x, 0.3, z]}
          ref={(el) => {
            // the front pair turns with the wheel
            if (z > 0) fronts.current[i] = el;
          }}
        >
          <group rotation-z={Math.PI / 2}>
            <mesh
              ref={(el) => {
                wheels.current[i] = el;
              }}
              castShadow
            >
              <cylinderGeometry args={[0.3, 0.3, 0.22, 20]} />
              <meshStandardMaterial color="#0a0c0f" roughness={0.85} />
            </mesh>
            <mesh material={steel}>
              <cylinderGeometry args={[0.13, 0.13, 0.24, 6]} />
            </mesh>
          </group>
        </group>
      ))}

      <spotLight ref={lamp} position={[0, 0.9, 0.8]} color={AMBER} intensity={150} distance={24} angle={0.72} penumbra={0.85} decay={1.7} />
      <object3D ref={aim} position={[0, 1.6, 9]} />
    </group>
  );
}

/* ---- Light and camera ---- */

function Rig({ day }: { day: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null!);
  const aim = useRef<THREE.Object3D>(null!);
  const look = useRef(new THREE.Vector3(game.x, 1.2, game.z - 3));
  const zoom = useRef(1);

  useEffect(() => {
    sun.current.target = aim.current;
  }, []);

  useFrame(({ camera, size }, delta) => {
    const dt = Math.min(delta, 0.05);
    // a portrait screen sees less of the hall, so the camera stands further back
    const back = Math.min(1.9, Math.max(1, 1.15 / (size.width / size.height)));
    const k = 1 - Math.exp(-dt * 4);
    // parked at an exhibit, frame the rover and the slab it came to read together
    const slab = game.active > 0 ? stations[game.active] : null;
    const fx = slab ? game.x + (slab.x - game.x) * 0.55 : game.x;
    const fz = slab ? game.z + (slab.z - game.z) * 0.55 : game.z - 3;
    // look a little ahead of where the car is going, and stand back as it speeds up
    look.current.x += (fx + game.vx * 0.35 + game.shiftX - look.current.x) * k;
    look.current.z += (fz + game.vz * 0.35 + game.shiftZ - look.current.z) * k;
    const pace = Math.min(1, Math.hypot(game.vx, game.vz) / 19);
    zoom.current += (1 + pace * 0.16 - zoom.current) * (1 - Math.exp(-dt * 2));
    camera.position.set(look.current.x, 19 * back * zoom.current, look.current.z + 17 * back * zoom.current);
    camera.lookAt(look.current);

    // the shadow frustum travels with the rover
    sun.current.position.set(game.x - 9, 18, game.z + 8);
    aim.current.position.set(game.x, 0, game.z);
  });

  return (
    <>
      <ambientLight intensity={day ? 1.1 : 0.7} color={day ? "#f3efe8" : "#5b6a82"} />
      <hemisphereLight args={[day ? "#ffffff" : "#93a7c8", day ? "#cfc8bb" : "#1c1610", day ? 0.6 : 1.1]} />
      <directionalLight
        ref={sun}
        color={day ? "#fff4e2" : "#dfe6f5"}
        intensity={day ? 2.2 : 2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0006}
      />
      <object3D ref={aim} />
    </>
  );
}

export default function World({ lang, day }: { lang: Lang; day: boolean }) {
  const ground = day ? "#e9e6e0" : "#0b0e12";
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.5, far: 200, position: [0, 19, 19] }}
    >
      <color attach="background" args={[ground]} />
      <fog attach="fog" args={[ground, 42, 110]} />
      <Rig day={day} />

      <Floor day={day} />
      <Threshold lang={lang} day={day} />
      <Marker />
      {stations.map((s, i) => (i === 0 ? null : <Exhibit key={s.id} station={s} index={i} lang={lang} day={day} />))}
      <Skids day={day} />
      <Offcuts />
      <Rover />

      <Environment resolution={256}>
        <Lightformer intensity={1.6} color={AMBER} position={[-6, 5, 6]} scale={[10, 10, 1]} />
        <Lightformer intensity={0.7} color="#8ea3bd" position={[8, 2, -6]} scale={[8, 8, 1]} />
        <Lightformer intensity={0.25} color="#1a202c" position={[0, -5, 2]} scale={[14, 8, 1]} />
      </Environment>
    </Canvas>
  );
}
