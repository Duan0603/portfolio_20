"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { usePrefs } from "@/lib/prefs";
import { stage, SIDES, SLABS, FOV } from "@/lib/stage";

/* Shared pointer state, lerped for cinematic smoothness. */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

const CAMERA_Z = 5.8;
const MID = (SLABS - 1) / 2;

/**
 * The page itself: one obsidian column with a face per chapter. The DOM walk
 * (components/Walk) lays the HTML out as a CSS 3D prism and publishes its
 * pixel measurements to `stage`; this builds the glass to the same numbers
 * under the same perspective, so the two turn as one object. On the skills
 * face the column is cut into slabs and the rake leaks through the seams.
 */
function Monolith({ day }: { day: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const slabs = useRef<(THREE.Mesh | null)[]>([]);
  const cuts = useRef<(THREE.LineSegments | null)[]>([]);
  const seams = useRef<(THREE.Mesh | null)[]>([]);
  const outline = useRef<THREE.LineSegments>(null!);
  const lift = useRef<number[]>(new Array(SLABS).fill(0));

  // unit prism; face 0 looks straight down +z, matching the CSS prism
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(1, 1, 1, SIDES, 1, false, -Math.PI / SIDES),
    []
  );
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 20), [geometry]);

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        flatShading: true,
        clearcoat: 0.35,
        clearcoatRoughness: 0.5,
      }),
    []
  );
  const edgeLine = useMemo(() => new THREE.LineBasicMaterial({ transparent: true }), []);
  const cutLine = useMemo(() => new THREE.LineBasicMaterial({ transparent: true }), []);
  const seamMats = useMemo(
    () =>
      new Array(SLABS).fill(0).map(
        () => new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false })
      ),
    []
  );

  // Night: polished black glass. Day: the same block as pale honed stone,
  // so the ink set on its faces keeps its contrast in both colorways.
  useEffect(() => {
    glass.color.set(day ? "#d6d1c8" : "#151a21");
    glass.metalness = day ? 0.05 : 0.38;
    glass.roughness = day ? 0.62 : 0.46;
    glass.envMapIntensity = day ? 0.5 : 1.25;
    glass.needsUpdate = true;
    edgeLine.color.set(day ? "#4a515a" : "#97a3b0");
    cutLine.color.set(day ? "#4a515a" : "#97a3b0");
    seamMats.forEach((m) => m.color.set(day ? "#c9842f" : "#f2bb6e"));
  }, [day, glass, edgeLine, cutLine, seamMats]);

  useFrame(({ camera }, dt) => {
    const g = group.current;
    g.visible = stage.solid && stage.P > 0;
    if (!g.visible) return;

    // world units per CSS pixel on the plane the front face sits in
    const u = camera.position.z / stage.P;
    const R = stage.R * u;
    const Rc = R / Math.cos(Math.PI / SIDES);
    const h = (stage.H * u) / SLABS;
    const gap = stage.gap * u * stage.split;

    g.position.set(0, -stage.oy * u, -R);
    g.rotation.y = stage.angle;

    outline.current.scale.set(Rc, h * SLABS, Rc);
    edgeLine.opacity = 0.34 * (1 - stage.split);
    cutLine.opacity = 0.34 * stage.split;

    const ease = 1 - Math.exp(-dt * 9);
    for (let i = 0; i < SLABS; i++) {
      const y = (MID - i) * (h + gap);
      const slab = slabs.current[i];
      if (slab) {
        slab.position.y = y;
        slab.scale.set(Rc, h, Rc);
      }
      const cut = cuts.current[i];
      if (cut) {
        cut.position.y = y;
        cut.scale.set(Rc, h, Rc);
      }

      lift.current[i] += ((stage.active === i ? 1 : 0) - lift.current[i]) * ease;
      const seam = seams.current[i];
      if (seam) {
        seam.visible = gap > 1e-5 && i < SLABS - 1;
        seam.position.y = y - h / 2 - gap / 2;
        seam.scale.set(Rc * 0.95, Math.max(gap * 0.45, 1e-5), Rc * 0.95);
        seamMats[i].opacity = stage.split * (0.42 + 0.58 * lift.current[i]);
      }
    }
  });

  return (
    <group ref={group} visible={false}>
      <lineSegments ref={outline} geometry={edges} material={edgeLine} />
      {seamMats.map((mat, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              slabs.current[i] = el;
            }}
            geometry={geometry}
            material={glass}
          />
          <lineSegments
            ref={(el) => {
              cuts.current[i] = el;
            }}
            geometry={edges}
            material={cutLine}
          />
          {/* the light caught between two slabs */}
          <mesh
            ref={(el) => {
              seams.current[i] = el;
            }}
            geometry={geometry}
            material={mat}
            visible={false}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Dust hanging in the light, in front of and around the column
 */
function DataParticles({ count = 70, day }: { count?: number; day: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = -5 + Math.random() * 7.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    pointsRef.current.position.x = THREE.MathUtils.lerp(
      pointsRef.current.position.x,
      -pointer.x * 0.35,
      0.04
    );
    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      -pointer.y * 0.2,
      0.04
    );
  });

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        key={day ? "day" : "night"}
        color={day ? "#8a5412" : "#f2bb6e"}
        size={0.036}
        transparent
        opacity={day ? 0.5 : 0.55}
        blending={day ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Offcuts of obsidian drifting either side of the column
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
        (i % 2 ? 1 : -1) * (6.5 + rng(i + 1) * 5),
        (rng(i + 7) - 0.5) * 8,
        -3 - rng(i + 3) * 8,
      ] as [number, number, number],
      scale: 0.25 + rng(i + 5) * 0.45,
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

/* The warm raking key light: it sweeps the front face with the pointer */
function RakeLight({ reduced, day }: { reduced: boolean; day: boolean }) {
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
    light.current.position.set(-3.8 + px * 3.4, 2.8 + py * 2.2, 4.6);
    target.position.set(px * 1.6, py * 1.1, 0);
    light.current.target = target;
  });

  return (
    <spotLight
      ref={light}
      color="#f2bb6e"
      intensity={day ? 12 : 13}
      distance={30}
      angle={0.8}
      penumbra={0.95}
      decay={1.35}
    />
  );
}

function AtelierScene({ reduced, day }: { reduced: boolean; day: boolean }) {
  // the vault ground, matching --vault in each colorway
  const ground = day ? "#e9e6e0" : "#070809";
  return (
    <>
      <color attach="background" args={[ground]} />
      <fog attach="fog" args={[ground, 9, 30]} />
      <ambientLight intensity={day ? 0.9 : 0.3} color={day ? "#f3efe8" : "#232c3a"} />

      {/* Cool steel light down the right-hand faces, the rake's spill down the left */}
      <directionalLight position={[7, 2.5, 1.5]} intensity={1.05} color="#8ea3bd" />
      <directionalLight position={[-7, 3, 1]} intensity={0.3} color="#d99a4c" />

      {/* Main Raking Key Light */}
      <RakeLight reduced={reduced} day={day} />

      <Suspense fallback={null}>
        <Monolith day={day} />
        <DataParticles day={day} />
        <FloatingShards reduced={reduced} />

        {/* Studio reflections */}
        <Environment resolution={256}>
          <Lightformer intensity={0.7} color="#f2bb6e" position={[-7, 4, 0]} scale={[4, 3, 1]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer intensity={1.2} color="#8ea3bd" position={[7, 0, 0]} scale={[5, 9, 1]} rotation={[0, -Math.PI / 2, 0]} />
          <Lightformer intensity={0.25} color="#1a202c" position={[0, -4, 2]} scale={[12, 6, 1]} />
        </Environment>
      </Suspense>
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

    let raf = 0;
    const loop = () => {
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener("pointermove", onMove, { passive: true });

    try {
      const c = document.createElement("canvas");
      if (!c.getContext("webgl2") && !c.getContext("webgl")) setOk(false);
    } catch {
      setOk(false);
    }

    return () => {
      mq.removeEventListener?.("change", onMq);
      window.removeEventListener("pointermove", onMove);
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
          // must stay dead centre and level: the CSS prism shares this exact view
          camera={{ position: [0, 0, CAMERA_Z], fov: FOV }}
        >
          <AtelierScene reduced={reduced} day={day} />
        </Canvas>
      )}
      <div className="atelier-grain" />
    </div>
  );
}
