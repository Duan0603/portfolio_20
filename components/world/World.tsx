"use client";

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { KernelSize, ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import type { Lang } from "@/lib/data";
import Coast from "./Coast";
import {
  BOUNDS,
  ROVER_R,
  game,
  obstacles,
  stations,
  step,
} from "./game";
import type { Vehicle } from "./vehicles";

const AMBER = "#ffc687";
/* a driftwood tone, so the knockable piles read as quayside clutter, not debris */
const offcut = new THREE.MeshStandardMaterial({ color: "#a9825f", metalness: .05, roughness: .85 });
const glow = new THREE.MeshBasicMaterial({ color: AMBER, toneMapped: false });

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

type Tread = { x: number; z: number; laid: boolean; lx: number; lz: number; rx: number; rz: number };

function Skids({ day }: { day: boolean }) {
  const next = useRef(0);
  // where each rear wheel was, and whether a trail is running from it (then with the two edges of its tread)
  const wheels = useRef<(Tread | null)[]>([null, null]);
  const geometry = useMemo(() => {
    // one quad per segment; each starts on the edge the one before it ended, so a trail is a single unbroken ribbon
    const g = new THREE.BufferGeometry();
    const position = new THREE.BufferAttribute(new Float32Array(MARKS * 4 * 3).fill(-5), 3);
    position.setUsage(THREE.DynamicDrawUsage);
    const index: number[] = [];
    for (let i = 0; i < MARKS; i++) index.push(i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3);
    g.setAttribute("position", position);
    g.setIndex(index);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const g = game;
    const sliding = Math.abs(g.slide) > 2.2 || (g.braking && Math.abs(g.forward) > 4);
    const fx = Math.sin(g.h);
    const fz = Math.cos(g.h);
    const position = geometry.attributes.position as THREE.BufferAttribute;
    [-0.62, 0.62].forEach((side, w) => {
      // under each rear wheel, followed every frame so a slide marks the ground from its very first frame
      const x = g.x + fz * side - fx * 0.58;
      const z = g.z - fx * side - fz * 0.58;
      const last = wheels.current[w];
      if (!sliding || !last) {
        wheels.current[w] = { x, z, laid: false, lx: x, lz: z, rx: x, rz: z };
        return;
      }
      const dx = x - last.x;
      const dz = z - last.z;
      const length = Math.hypot(dx, dz);
      // let a running trail grow in steps rather than a sliver per frame; skip a jump too long to be a tyre's path
      if ((last.laid && length < 0.25) || length < 0.001) return;
      if (length > 4) {
        wheels.current[w] = { x, z, laid: false, lx: x, lz: z, rx: x, rz: z };
        return;
      }
      // the tread runs across the direction the tyre is actually moving
      const nx = (-dz / length) * 0.1;
      const nz = (dx / length) * 0.1;
      const here = { x, z, laid: true, lx: x + nx, lz: z + nz, rx: x - nx, rz: z - nz };
      // a new trail starts square; a running one picks up exactly where its last segment ended
      const from = last.laid ? last : { lx: last.x + nx, lz: last.z + nz, rx: last.x - nx, rz: last.z - nz };
      // above the asphalt (.027), the lawn (.018) and the lane dashes (.036), below the lamp pools
      const q = next.current * 4;
      position.setXYZ(q, from.lx, 0.045, from.lz);
      position.setXYZ(q + 1, from.rx, 0.045, from.rz);
      position.setXYZ(q + 2, here.lx, 0.045, here.lz);
      position.setXYZ(q + 3, here.rx, 0.045, here.rz);
      next.current = (next.current + 1) % MARKS;
      position.needsUpdate = true;
      wheels.current[w] = here;
    });
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <meshBasicMaterial color={day ? "#15171a" : "#05070a"} transparent opacity={day ? 0.55 : 0.75} depthWrite={false} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/* ---- Cars: a side profile pushed through the width of the car, with a dark canopy on top ---- */

type Profile = (s: THREE.Shape) => void;
const profiles: Record<string, { body: Profile; cabin: Profile; wing?: boolean }> = {
  // all edges and one long wedge from nose to roof
  lamborghini: {
    wing: true,
    body: (s) => {
      s.moveTo(-1.15, 0.2);
      s.lineTo(1.12, 0.2);
      s.lineTo(1.2, 0.3);
      s.lineTo(0.38, 0.5);
      s.lineTo(-0.72, 0.6);
      s.lineTo(-1.17, 0.56);
    },
    cabin: (s) => {
      s.moveTo(0.42, 0.48);
      s.lineTo(-0.08, 0.82);
      s.lineTo(-0.52, 0.8);
      s.lineTo(-0.98, 0.56);
    },
  },
  // round nose, one arc of roof falling all the way to the tail
  porsche: {
    body: (s) => {
      s.moveTo(-1.12, 0.22);
      s.lineTo(1.08, 0.22);
      s.quadraticCurveTo(1.22, 0.4, 0.98, 0.52);
      s.lineTo(0.4, 0.6);
      s.lineTo(-0.6, 0.62);
      s.quadraticCurveTo(-1.12, 0.62, -1.16, 0.38);
    },
    cabin: (s) => {
      s.moveTo(0.46, 0.57);
      s.quadraticCurveTo(0.12, 0.98, -0.25, 0.9);
      s.quadraticCurveTo(-0.8, 0.8, -1.04, 0.52);
    },
  },
  // long low nose, cabin set back, haunches rising to a small ducktail
  ferrari: {
    body: (s) => {
      s.moveTo(-1.15, 0.2);
      s.lineTo(1.14, 0.2);
      s.lineTo(1.22, 0.31);
      s.quadraticCurveTo(0.8, 0.5, 0.42, 0.5);
      s.quadraticCurveTo(0, 0.5, -0.3, 0.58);
      s.quadraticCurveTo(-0.7, 0.7, -1.18, 0.64);
    },
    cabin: (s) => {
      s.moveTo(0.3, 0.49);
      s.quadraticCurveTo(0.04, 0.86, -0.3, 0.84);
      s.quadraticCurveTo(-0.6, 0.8, -0.84, 0.62);
    },
  },
};

function extrude(draw: Profile, width: number) {
  const shape = new THREE.Shape();
  draw(shape);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 2,
    curveSegments: 12,
  });
  // the profile is drawn nose-right; turn it so the nose points down the car's +z
  g.translate(0, 0, -width / 2);
  g.rotateY(-Math.PI / 2);
  return g;
}

function CarBody({ vehicle, tail }: { vehicle: Vehicle; tail: React.RefObject<THREE.MeshBasicMaterial> }) {
  const spec = profiles[vehicle.id];
  const body = useMemo(() => extrude(spec.body, 1.02), [spec]);
  const cabin = useMemo(() => extrude(spec.cabin, 0.8), [spec]);
  const paint = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: vehicle.paint, metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.5 }),
    [vehicle.paint]
  );
  useEffect(
    () => () => {
      body.dispose();
      cabin.dispose();
      paint.dispose();
    },
    [body, cabin, paint]
  );

  return (
    <>
      <mesh geometry={body} material={paint} castShadow />
      <mesh geometry={cabin} castShadow>
        <meshPhysicalMaterial color="#0b0e12" metalness={0.6} roughness={0.12} clearcoat={1} envMapIntensity={1.8} />
      </mesh>
      {spec.wing && (
        <mesh position={[0, 0.7, -1.06]} material={paint} castShadow>
          <boxGeometry args={[1.04, 0.04, 0.2]} />
        </mesh>
      )}
      {([[-1, 1], [1, 1], [-1, -1], [1, -1]] as const).map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} position={[sx * vehicle.track, vehicle.wheel, sz * vehicle.axle]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[vehicle.wheel, vehicle.wheel, 0.22, 20]} />
          <meshStandardMaterial color="#0a0c0f" roughness={0.85} />
        </mesh>
      ))}
      {/* headlights and tail lights */}
      {[-0.36, 0.36].map((x) => (
        <mesh key={x} position={[x, 0.36, 1.13]} material={glow}>
          <boxGeometry args={[0.24, 0.05, 0.06]} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, -1.18]}>
        <boxGeometry args={[0.9, 0.05, 0.04]} />
        <meshBasicMaterial ref={tail} color="#7a2a18" toneMapped={false} />
      </mesh>
    </>
  );
}

/**
 * A detailed model in place of the built shape: stood on the floor, scaled to
 * the car's length and turned nose-forward, whatever size and axis it came in.
 */
function ModelBody({ vehicle }: { vehicle: Vehicle }) {
  // meshopt-compressed files decode locally; no Draco, so nothing is fetched from a CDN
  const { scene } = useGLTF(vehicle.model!, false, true);

  const fit = useMemo(() => {
    scene.updateMatrixWorld(true);
    // Sample the surface to find which way the car runs: models arrive along x,
    // along z, or parked at an angle, and a bounding box cannot tell the last from a square.
    const pts: number[] = [];
    const v = new THREE.Vector3();
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const pos = mesh.geometry.getAttribute("position");
      const stride = Math.max(1, Math.floor(pos.count / 1500));
      for (let i = 0; i < pos.count; i += stride) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        pts.push(v.x, v.y, v.z);
      }
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        const mat = m as THREE.MeshPhysicalMaterial;
        if (vehicle.repaint && mat.name === vehicle.repaint.material) mat.color.set(vehicle.repaint.color);
        // real refraction costs a second pass over the whole hall; plain see-through glass reads the same at this size
        if (mat.transmission > 0) {
          mat.transmission = 0;
          mat.transparent = true;
          mat.opacity = Math.min(mat.opacity, 0.45);
        }
      }
    });

    const n = pts.length / 3;
    let mx = 0;
    let mz = 0;
    for (let i = 0; i < n; i++) {
      mx += pts[i * 3];
      mz += pts[i * 3 + 2];
    }
    mx /= n;
    mz /= n;
    let xx = 0;
    let zz = 0;
    let xz = 0;
    for (let i = 0; i < n; i++) {
      const dx = pts[i * 3] - mx;
      const dz = pts[i * 3 + 2] - mz;
      xx += dx * dx;
      zz += dz * dz;
      xz += dx * dz;
    }
    // the long axis of the footprint, as an angle from +z towards +x
    const axis = 0.5 * Math.atan2(2 * xz, zz - xx);
    const sin = Math.sin(axis);
    const cos = Math.cos(axis);

    let minU = Infinity;
    let maxU = -Infinity;
    let minW = Infinity;
    let maxW = -Infinity;
    let minY = Infinity;
    for (let i = 0; i < n; i++) {
      const x = pts[i * 3];
      const z = pts[i * 3 + 2];
      const u = x * sin + z * cos; // along the car
      const w = x * cos - z * sin; // across it
      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minW = Math.min(minW, w);
      maxW = Math.max(maxW, w);
      minY = Math.min(minY, pts[i * 3 + 1]);
    }
    const scale = (vehicle.length ?? 2.6) / (maxU - minU);
    return {
      scale,
      align: -axis,
      offset: [-(minW + maxW) / 2, -minY, -(minU + maxU) / 2] as [number, number, number],
    };
  }, [scene, vehicle]);

  return (
    <group rotation-y={vehicle.turn ?? 0} scale={fit.scale}>
      <group position={fit.offset}>
        <group rotation-y={fit.align}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

/** If a model will not load, the built shape stays. */
class ModelGuard extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ---- The car the visitor drives, carrying the hall's one warm light ---- */

function Car({ vehicle }: { vehicle: Vehicle }) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const tail = useRef<THREE.MeshBasicMaterial>(null);
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
    tail.current?.color.set(g.braking ? "#ff5a36" : "#7a2a18");
  });

  return (
    <group ref={root}>
      <group ref={body}>
        <ModelGuard key={vehicle.id} fallback={<CarBody vehicle={vehicle} tail={tail} />}>
          <Suspense fallback={<CarBody vehicle={vehicle} tail={tail} />}>
            {vehicle.model ? <ModelBody vehicle={vehicle} /> : <CarBody vehicle={vehicle} tail={tail} />}
          </Suspense>
        </ModelGuard>
      </group>

      <spotLight ref={lamp} position={[0, 0.9, 0.8]} color={AMBER} intensity={150} distance={24} angle={0.72} penumbra={0.85} decay={1.7} />
      <object3D ref={aim} position={[0, 1.6, 9]} />
    </group>
  );
}

/* ---- Light and camera ---- */

function Rig({ day }: { day: boolean }) {
  const shadowSize = useThree(({ size }) => size.width >= 900 ? 4096 : 2048);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const aim = useRef<THREE.Object3D>(null!);
  const look = useRef(new THREE.Vector3(game.x, 1.2, game.z - 3));
  const zoom = useRef(1);

  useEffect(() => {
    sun.current.target = aim.current;
    // Reallocate the shadow target when crossing the desktop breakpoint.
    sun.current.shadow.map?.dispose();
    sun.current.shadow.map = null;
  }, [shadowSize]);

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
    const overview = game.active === 0 && !game.target && Math.hypot(game.vx, game.vz) < .3;
    const destination = overview
      ? new THREE.Vector3(12, 53 * back, 61 * back)
      : new THREE.Vector3(look.current.x + 6, 20 * back * zoom.current, look.current.z + 21 * back * zoom.current);
    camera.position.lerp(destination, k);
    camera.lookAt(overview ? new THREE.Vector3(2, 0, -12) : look.current);

    // the shadow frustum travels with the rover
    sun.current.position.set(game.x - 18, 36, game.z + 16);
    aim.current.position.set(game.x, 0, game.z);
  });

  return (
    <>
      {/* low fill and a strong low sun: the contrast between lit faces and shade is what reads as daylight */}
      <ambientLight intensity={day ? .26 : .7} color={day ? "#e8f0f2" : "#5c7a85"} />
      <hemisphereLight args={[day ? "#bfe0ef" : "#6a8fa3", day ? "#7a6a4c" : "#33403c", day ? .7 : .95]} />
      <directionalLight
        ref={sun}
        color={day ? "#ffe8c2" : "#9fb8d4"}
        intensity={day ? 2.7 : 1.8}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <object3D ref={aim} />
    </>
  );
}

export default function World({ lang, day, vehicle, onReady, onFailure }: { lang: Lang; day: boolean; vehicle: Vehicle; onReady: () => void; onFailure: () => void }) {
  const ground = day ? "#a9cad3" : "#16303a";
  const canvas = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => () => { canvas.current?.removeEventListener("webglcontextlost", onFailure); }, [onFailure]);
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.5, far: 450, position: [12, 53, 61] }}
      onCreated={({ gl }) => {
        canvas.current = gl.domElement;
        gl.domElement.addEventListener("webglcontextlost", onFailure);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = day ? 1.05 : 1.2;
        onReady();
      }}
    >
      <color attach="background" args={[ground]} />
      <fog attach="fog" args={[ground, 110, 320]} />
      <Rig day={day} />

      <Coast lang={lang} day={day} />
      <Marker />
      <Skids day={day} />
      <Offcuts />
      <Car vehicle={vehicle} />

      <Environment resolution={512}>
        <Lightformer intensity={1.6} color={AMBER} position={[-6, 5, 6]} scale={[10, 10, 1]} />
        <Lightformer intensity={0.7} color="#8ea3bd" position={[8, 2, -6]} scale={[8, 8, 1]} />
        <Lightformer intensity={0.25} color="#1a202c" position={[0, -5, 2]} scale={[14, 8, 1]} />
      </Environment>

      {/* day lighting already sits near 1.0 pre-tonemap across the open sand, so a luminance-threshold
          bloom there blows out the whole platform; bloom only reads clean against night's dim ambient,
          picking out the headlights, lamps and the amber wayfinding strip as actual small light sources */}
      <EffectComposer multisampling={4} enableNormalPass={false}>
        {/* ambient occlusion seats things on the ground: dark creases under palms, pavilions and the car */}
        <N8AO halfRes aoRadius={2.2} distanceFalloff={1} intensity={day ? 2.4 : 1.6} color="#1d2a2a" quality="medium" />
        <Bloom mipmapBlur kernelSize={KernelSize.SMALL} luminanceThreshold={0.97} luminanceSmoothing={0.05} intensity={day ? 0 : 0.4} radius={0.3} />
        <Vignette eskil={false} offset={0.18} darkness={day ? 0.18 : 0.4} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        {/* Smooth thin lamp posts, lane markings and shadow edges after tone mapping. */}
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
