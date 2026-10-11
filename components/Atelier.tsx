"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { usePrefs } from "@/lib/prefs";
import { stage } from "@/lib/stage";

/* Shared pointer + scroll state, lerped for cinematic smoothness. */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
let scrollY = 0;
/* Where the stack currently is — the rake light follows it down the page. */
const focus = new THREE.Vector3(1.4, 0, 0);

const SLAB_H = 0.34;
const SEAM = 0.05;
/* Footprint [width, depth] of each slab, top of the stack first: a cut
   monolith that widens toward its base. One slab per skill layer. */
const FOOTPRINTS: [number, number][] = [
  [1.34, 1.34],
  [1.5, 1.42],
  [1.4, 1.52],
  [1.52, 1.46],
  [1.44, 1.5],
  [1.56, 1.56],
];
const MID = (FOOTPRINTS.length - 1) / 2;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => {
  const t = clamp01(n);
  return t * t * (3 - 2 * t);
};

/** 1 while the element sits around the middle of the viewport, 0 once it has left. */
function presence(el: HTMLElement | null, vh: number) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  if (!r.width) return 0;
  const d = Math.abs(r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
  return smooth((0.92 - d) / 0.5);
}

const ray = new THREE.Vector3();
/** The point on the z = 0 plane that sits under a viewport pixel. */
function screenToWorld(
  sx: number,
  sy: number,
  camera: THREE.Camera,
  size: { width: number; height: number },
  out: THREE.Vector3
) {
  ray
    .set((sx / size.width) * 2 - 1, -(sy / size.height) * 2 + 1, 0.5)
    .unproject(camera)
    .sub(camera.position)
    .normalize();
  return out.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z);
}

/**
 * The full stack, literally: six machined obsidian slabs with the amber rake
 * leaking through their seams. Assembled and twisting under the cursor in the
 * hero, a fogged ghost while the visitor walks the hall, split apart with one
 * slab beside each skill layer, then whole again at the contact invitation.
 */
function Monolith({ reduced, day }: { reduced: boolean; day: boolean }) {
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const seams = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const lift = useRef<number[]>(FOOTPRINTS.map(() => 0));
  const spin = useRef(0.6);
  const placed = useRef(false);

  const obsidian = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#0b0e13"),
        metalness: 0.86,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.16,
        reflectivity: 0.85,
        envMapIntensity: 1.7,
      }),
    []
  );

  const v = useMemo(
    () => ({
      centre: new THREE.Vector3(),
      to: new THREE.Vector3(),
      slab: new THREE.Vector3(),
      row: new THREE.Vector3(),
    }),
    []
  );

  useFrame(({ camera, size }, dt) => {
    const vh = size.height;
    const narrow = size.width / vh < 0.8;
    // world units per pixel on the z = 0 plane
    const upp =
      (2 * Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360) *
        camera.position.z) /
      vh;
    const halfW = (size.width * upp) / 2;

    const hero = 1 - smooth(scrollY / (vh * 0.85));
    const split = presence(stage.anchor, vh);
    const fin = presence(stage.finale, vh);

    // Between the lit moments the stack waits deep in the fog as a ghost.
    v.centre.set(halfW * 0.9, -0.4, -10);
    v.to.set(narrow ? 0.25 : halfW * 0.46, narrow ? 0.35 : 0.05, narrow ? -1.8 : 0);
    v.centre.lerp(v.to, hero);

    let scale = 1;
    if (fin > 0 && stage.finale) {
      const r = stage.finale.getBoundingClientRect();
      screenToWorld(r.left + r.width / 2, r.top + r.height / 2, camera, size, v.to);
      v.centre.lerp(v.to, fin);
      scale = THREE.MathUtils.lerp(1, THREE.MathUtils.clamp((r.width * upp) / 2.5, 0.3, 1.05), fin);
    }

    let dockX = 0;
    let dockScale = 1;
    if (split > 0 && stage.anchor) {
      const r = stage.anchor.getBoundingClientRect();
      dockX = r.left + r.width / 2;
      dockScale = THREE.MathUtils.clamp((r.width * upp) / 2.25, 0.16, 1);
    }

    const tilt = THREE.MathUtils.lerp(0.2 + pointer.y * 0.14, 0.44, split);
    const twist = THREE.MathUtils.lerp(0.16 + pointer.x * 0.42, 0.52, split);
    // the seams breathe open as the stack leaves the hero
    const gap = SEAM + (1 - hero) * (1 - fin) * 0.16;
    if (!reduced) spin.current += dt * 0.16;

    const ease = reduced || !placed.current ? 1 : 1 - Math.exp(-dt * 12);
    const liftEase = reduced ? 1 : 1 - Math.exp(-dt * 9);

    for (let i = 0; i < FOOTPRINTS.length; i++) {
      const g = slabs.current[i];
      if (!g) continue;

      const dy = (MID - i) * (SLAB_H + gap) * scale;
      v.slab.set(v.centre.x, v.centre.y + dy * Math.cos(tilt), v.centre.z + dy * Math.sin(tilt));

      lift.current[i] += ((stage.active === i ? 1 : 0) - lift.current[i]) * liftEase;
      const a = lift.current[i] * split;

      let sx = scale;
      let sy = scale;
      const row = stage.rows[i];
      if (split > 0 && row) {
        const r = row.getBoundingClientRect();
        screenToWorld(dockX, r.top + r.height / 2, camera, size, v.row);
        v.row.z += a * 0.45;
        v.slab.lerp(v.row, split);
        sx = THREE.MathUtils.lerp(scale, dockScale * (1 + a * 0.08), split);
        sy = THREE.MathUtils.lerp(scale, dockScale * 0.5, split);
      }

      g.position.lerp(v.slab, ease);
      g.scale.set(sx, sy, sx);
      g.rotation.set(tilt, spin.current + (i - MID) * twist, 0);

      const seam = seams.current[i];
      if (seam) {
        seam.opacity = THREE.MathUtils.lerp(THREE.MathUtils.lerp(0.95, 0.3, split), 1, a);
      }
    }

    placed.current = true;
    const mid = slabs.current[Math.floor(MID)];
    if (mid) focus.copy(mid.position);
  });

  return (
    <>
      {FOOTPRINTS.map(([w, d], i) => (
        <group
          key={i}
          ref={(el) => {
            slabs.current[i] = el;
          }}
        >
          <RoundedBox args={[w, SLAB_H, d]} radius={0.03} smoothness={3}>
            <primitive object={obsidian} attach="material" />
          </RoundedBox>
          {/* the light caught under each slab, seen through the seam */}
          <mesh position={[0, -SLAB_H / 2 - SEAM / 2, 0]}>
            <boxGeometry args={[w * 0.9, 0.018, d * 0.9]} />
            <meshBasicMaterial
              ref={(el) => {
                seams.current[i] = el;
              }}
              color={day ? "#d99a4c" : "#f2bb6e"}
              transparent
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/**
 * Dust hanging in the light
 */
function DataParticles({ count = 65, day }: { count?: number; day: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Cylindrical volume around the centre
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 4.2;
      const y = (Math.random() - 0.5) * 5.5;

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radius - 1.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame((_, dt) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += dt * 0.035;
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      pointer.ty * 0.08,
      0.04
    );
  });

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        key={day ? "day" : "night"}
        color={day ? "#8a5412" : "#f2bb6e"}
        size={0.042}
        transparent
        opacity={day ? 0.55 : 0.65}
        blending={day ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Offcuts of obsidian, far enough back that the fog keeps them under the text
 */
function FloatingShards({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const shards = useMemo(() => {
    const rng = (seed: number) => {
      const x = Math.sin(seed * 999.17) * 43758.5453;
      return x - Math.floor(x);
    };
    return new Array(8).fill(0).map((_, i) => ({
      pos: [
        (rng(i + 1) - 0.5) * 14,
        (rng(i + 7) - 0.5) * 8,
        -4.5 - rng(i + 3) * 5,
      ] as [number, number, number],
      scale: 0.2 + rng(i + 5) * 0.4,
      rot: [rng(i) * 6, rng(i + 2) * 6, rng(i + 4) * 6] as [number, number, number],
      speed: 0.03 + rng(i + 6) * 0.06,
    }));
  }, []);

  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#0c1017"),
        metalness: 0.7,
        roughness: 0.22,
        flatShading: true,
        clearcoat: 0.7,
        envMapIntensity: 1.1,
      }),
    []
  );

  useFrame((_, dt) => {
    if (reduced || !ref.current) return;
    ref.current.children.forEach((c, i) => {
      c.rotation.x += dt * shards[i].speed;
      c.rotation.y += dt * shards[i].speed * 0.9;
    });
  });

  return (
    <group ref={ref}>
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/* The warm raking key light: tracks the pointer and follows the stack */
function RakeLight({ reduced }: { reduced: boolean }) {
  const light = useRef<THREE.SpotLight>(null!);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { scene } = useThree();

  useEffect(() => {
    scene.add(target);
    return () => {
      scene.remove(target);
    };
  }, [scene, target]);

  useFrame(() => {
    if (!light.current) return;
    const px = reduced ? -0.3 : pointer.x;
    const py = reduced ? 0.2 : pointer.y;
    light.current.position.set(
      focus.x - 5.4 + px * 3.2,
      focus.y + 3.2 + py * 2.2,
      focus.z + 5.8
    );
    target.position.set(focus.x + px, focus.y + py * 0.7, focus.z);
    light.current.target = target;
  });

  return (
    <spotLight
      ref={light}
      color="#f2bb6e"
      intensity={reduced ? 50 : 75}
      distance={28}
      angle={0.65}
      penumbra={0.9}
      decay={1.35}
    />
  );
}

function CameraRig() {
  const { camera } = useThree();
  useFrame(({ size }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.65, 0.05);
    // the scroll drift belongs to the hero; further down the stack is docked to the page
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      0.15 + pointer.y * 0.35 - Math.min(scrollY, size.height) * 0.0008,
      0.05
    );
    camera.lookAt(0.3, 0, 0);
  });
  return null;
}

function AtelierScene({ reduced, day }: { reduced: boolean; day: boolean }) {
  // the vault ground, matching --vault in each colorway
  const ground = day ? "#e9e6e0" : "#070809";
  return (
    <>
      <color attach="background" args={[ground]} />
      <fog attach="fog" args={[ground, 7, 18]} />
      <ambientLight intensity={day ? 0.7 : 0.16} color={day ? "#f3efe8" : "#1e2633"} />

      {/* Cool steel rim backlight for crisp edges */}
      <directionalLight position={[6, 2.5, -3.5]} intensity={0.75} color="#8ea3bd" />

      {/* Main Raking Key Light */}
      <RakeLight reduced={reduced} />

      <Suspense fallback={null}>
        <Monolith reduced={reduced} day={day} />
        <DataParticles count={70} day={day} />
        <FloatingShards reduced={reduced} />

        {/* Studio reflections */}
        <Environment resolution={256}>
          <Lightformer intensity={1.8} color="#f2bb6e" position={[-5, 3, 4]} scale={[8, 8, 1]} />
          <Lightformer intensity={0.65} color="#8ea3bd" position={[6, -1, -3]} scale={[6, 6, 1]} />
          <Lightformer intensity={0.3} color="#1a202c" position={[0, -4, 2]} scale={[12, 6, 1]} />
        </Environment>
      </Suspense>

      <CameraRig />
    </>
  );
}

export default function Atelier() {
  const [reduced, setReduced] = useState(false);
  const [ok, setOk] = useState(true);
  // R3F renders in its own React root, so the preference is read here and passed down
  const day = usePrefs().colorway === "day";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onMq);

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
      document.documentElement.style.setProperty("--rx", `${(e.clientX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty("--ry", `${(e.clientY / window.innerHeight) * 100}%`);
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    onScroll();

    let raf = 0;
    const loop = () => {
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    try {
      const c = document.createElement("canvas");
      if (!c.getContext("webgl2") && !c.getContext("webgl")) setOk(false);
    } catch {
      setOk(false);
    }

    return () => {
      mq.removeEventListener?.("change", onMq);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="atelier-stage" aria-hidden="true">
      <div className="atelier-vault" />
      {ok && (
        <Canvas
          className="atelier-canvas"
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.2, 5.8], fov: 42 }}
        >
          <AtelierScene reduced={reduced} day={day} />
        </Canvas>
      )}
      <div className="atelier-grain" />
    </div>
  );
}
