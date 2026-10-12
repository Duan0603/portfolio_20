"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { usePrefs } from "@/lib/prefs";

/* Pointer tracking for interactive lighting and tilt */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

type EngineMode = "hero" | "cinema" | "waste" | "fitnexus" | "skills" | "about" | "contact";

interface StageState {
  mode: EngineMode;
  modeLabel: string;
  posX: number;
  posY: number;
  posZ: number;
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  cageScale: number;
  laserScan: boolean;
  stackOffset: number;
  beaconPulse: boolean;
  pulseSpeed: number;
}

/**
 * World-class 3D Neural Monolith Engine:
 * A persistent, scrollytelling artifact that accompanies the visitor
 * across the entire portfolio journey, physically morphing its structure to
 * reflect the specific engineering domain of each section:
 *
 * 1. Hero: Autonomous Obsidian Core & Titanium Orbital Ring.
 * 2. Web Microservices (Cinema): Expanded decoupled wireframe mesh & bus interconnects.
 * 3. Edge AI (Smart Waste): Active holographic laser scanner & 30 FPS inference pulse.
 * 4. Hardware IoT (Fitnexus): Precision mechanical orientation & servo bus lines.
 * 5. Skills Matrix: Deconstructed multi-tier silicon wafer architecture stack.
 * 6. Contact: Rhythmic dispatch beacon radiating outward.
 */
function ScrollytellingMonolith({ day, reduced, onModeChange }: { day: boolean; reduced: boolean; onModeChange: (label: string) => void }) {
  const rootGroup = useRef<THREE.Group>(null);
  const outerMesh = useRef<THREE.Mesh>(null);
  const wireMesh = useRef<THREE.Mesh>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const laserPlaneRef = useRef<THREE.Mesh>(null);
  const reticleGroup = useRef<THREE.Group>(null);
  const stackTopRef = useRef<THREE.Mesh>(null);
  const stackBottomRef = useRef<THREE.Mesh>(null);
  const beaconRingsRef = useRef<THREE.Group>(null);

  // Current interpolated state
  const current = useRef<StageState>({
    mode: "hero",
    modeLabel: "SYSTEM_ONLINE // CORE_IDLE",
    posX: 2.0,
    posY: 0.1,
    posZ: -1.0,
    scale: 1.35,
    rotX: 0.1,
    rotY: 0,
    rotZ: 0,
    cageScale: 1.12,
    laserScan: false,
    stackOffset: 0,
    beaconPulse: false,
    pulseSpeed: 1.2,
  });

  // Materials
  const obsidianMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: day ? new THREE.Color("#dcd6cc") : new THREE.Color("#0a0c10"),
        metalness: 0.92,
        roughness: 0.14,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        reflectivity: 0.95,
        envMapIntensity: 1.6,
      }),
    [day]
  );

  const wireMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: day ? "#8a5412" : "#f2bb6e",
        emissive: day ? "#6e3f08" : "#d99a4c",
        emissiveIntensity: day ? 0.7 : 1.35,
        wireframe: true,
        transparent: true,
        opacity: day ? 0.5 : 0.75,
      }),
    [day]
  );

  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: day ? "#b9772a" : "#f2bb6e",
        emissive: day ? "#8a5412" : "#d99a4c",
        emissiveIntensity: day ? 0.9 : 2.2,
        roughness: 0.2,
        toneMapped: false,
      }),
    [day]
  );

  const ringMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: day ? "#6e7782" : "#2a3340",
        metalness: 0.95,
        roughness: 0.2,
      }),
    [day]
  );

  const laserMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: day ? "#9e5c10" : "#f2bb6e",
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: day ? THREE.NormalBlending : THREE.AdditiveBlending,
      }),
    [day]
  );

  const beaconRingMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: day ? "#8a5412" : "#f2bb6e",
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: day ? THREE.NormalBlending : THREE.AdditiveBlending,
      }),
    [day]
  );

  useEffect(() => {
    return () => {
      obsidianMat.dispose();
      wireMat.dispose();
      coreMat.dispose();
      ringMat.dispose();
      laserMat.dispose();
      beaconRingMat.dispose();
    };
  }, [obsidianMat, wireMat, coreMat, ringMat, laserMat, beaconRingMat]);

  useFrame((state, dt) => {
    const time = state.clock.elapsedTime;
    const easeRate = 1 - Math.exp(-dt * 4.2);

    // Pointer lerp
    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 6));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 6));

    // Calculate active section based on scroll position and DOM markers
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    const cinemaEl = document.getElementById("case-cinema");
    const wasteEl = document.getElementById("case-waste");
    const fitnexusEl = document.getElementById("case-fitnexus");
    const skillsEl = document.getElementById("skills");
    const contactEl = document.getElementById("contact");

    const getCenterDist = (el: HTMLElement | null) => {
      if (!el) return 99999;
      const rect = el.getBoundingClientRect();
      return Math.abs(rect.top + rect.height * 0.35 - vh * 0.5);
    };

    const dCinema = getCenterDist(cinemaEl);
    const dWaste = getCenterDist(wasteEl);
    const dFitnexus = getCenterDist(fitnexusEl);
    const dSkills = getCenterDist(skillsEl);
    const dContact = getCenterDist(contactEl);

    // Target parameters depending on viewport section
    let target: StageState = {
      mode: "hero",
      modeLabel: "SYSTEM_ONLINE // CORE_IDLE",
      posX: 2.0,
      posY: 0.1,
      posZ: -1.0,
      scale: 1.35,
      rotX: 0.1,
      rotY: time * 0.22,
      rotZ: 0,
      cageScale: 1.12,
      laserScan: false,
      stackOffset: 0,
      beaconPulse: false,
      pulseSpeed: 1.0,
    };

    if (dContact < vh * 0.65) {
      target = {
        mode: "contact",
        modeLabel: "READY_FOR_DEPLOYMENT // BEACON_PING",
        posX: 0.0,
        posY: -0.3,
        posZ: -1.8,
        scale: 1.15,
        rotX: 0.2,
        rotY: time * 0.15,
        rotZ: 0,
        cageScale: 1.1,
        laserScan: false,
        stackOffset: 0,
        beaconPulse: true,
        pulseSpeed: 1.5,
      };
    } else if (dSkills < vh * 0.65) {
      target = {
        mode: "skills",
        modeLabel: "6_LAYER_STACK // DISTRIBUTED_NODES",
        posX: 0.0,
        posY: 0.2,
        posZ: -2.6,
        scale: 1.25,
        rotX: 0.65,
        rotY: 0.35 + Math.sin(time * 0.2) * 0.1,
        rotZ: -0.1,
        cageScale: 1.2,
        laserScan: false,
        stackOffset: 0.55,
        beaconPulse: false,
        pulseSpeed: 1.2,
      };
    } else if (dFitnexus < vh * 0.55) {
      target = {
        mode: "fitnexus",
        modeLabel: "EMBEDDED_BUS // PCA9685_I2C",
        posX: 2.1,
        posY: 0.0,
        posZ: -1.5,
        scale: 1.2,
        rotX: 0.45,
        rotY: time * 0.2 + 0.8,
        rotZ: 0.25,
        cageScale: 1.15,
        laserScan: false,
        stackOffset: 0,
        beaconPulse: false,
        pulseSpeed: 1.6,
      };
    } else if (dWaste < vh * 0.55) {
      target = {
        mode: "waste",
        modeLabel: "TENSORRT_INFERENCE // 30+FPS_CV",
        posX: 1.85,
        posY: 0.05,
        posZ: -1.1,
        scale: 1.45,
        rotX: 0.08,
        rotY: time * 0.45,
        rotZ: 0.0,
        cageScale: 1.16,
        laserScan: true,
        stackOffset: 0,
        beaconPulse: false,
        pulseSpeed: 4.2, // high-speed AI inference pulse
      };
    } else if (dCinema < vh * 0.55) {
      target = {
        mode: "cinema",
        modeLabel: "MICROSERVICES // GATEWAY_BUS",
        posX: 2.25,
        posY: 0.15,
        posZ: -1.6,
        scale: 1.2,
        rotX: 0.42,
        rotY: time * 0.16 + 1.2,
        rotZ: 0.15,
        cageScale: 1.32, // decoupled outer cage
        laserScan: false,
        stackOffset: 0,
        beaconPulse: false,
        pulseSpeed: 1.8,
      };
    } else if (scrollY > 400) {
      // Transitioning between hero and work
      target = {
        mode: "hero",
        modeLabel: "TRANSIT // ARCHITECTURE_INSPECT",
        posX: 2.1,
        posY: 0.1,
        posZ: -1.4,
        scale: 1.25,
        rotX: 0.2,
        rotY: time * 0.2,
        rotZ: 0,
        cageScale: 1.15,
        laserScan: false,
        stackOffset: 0,
        beaconPulse: false,
        pulseSpeed: 1.2,
      };
    }

    // Smooth state interpolation
    const cur = current.current;
    cur.posX += (target.posX - cur.posX) * easeRate;
    cur.posY += (target.posY - cur.posY) * easeRate;
    cur.posZ += (target.posZ - cur.posZ) * easeRate;
    cur.scale += (target.scale - cur.scale) * easeRate;
    cur.rotX += (target.rotX - cur.rotX) * easeRate;
    cur.rotY += (target.rotY - cur.rotY) * easeRate;
    cur.rotZ += (target.rotZ - cur.rotZ) * easeRate;
    cur.cageScale += (target.cageScale - cur.cageScale) * easeRate;
    cur.stackOffset += (target.stackOffset - cur.stackOffset) * easeRate;
    cur.pulseSpeed += (target.pulseSpeed - cur.pulseSpeed) * easeRate;
    cur.laserScan = target.laserScan;
    cur.beaconPulse = target.beaconPulse;

    if (cur.modeLabel !== target.modeLabel) {
      cur.modeLabel = target.modeLabel;
      onModeChange(target.modeLabel);
    }

    // Apply to Three.js meshes
    const g = rootGroup.current;
    if (g) {
      const floatY = Math.sin(time * 0.8) * 0.05;
      const px = reduced ? 0 : pointer.x;
      const py = reduced ? 0 : pointer.y;

      g.position.set(cur.posX + px * 0.15, cur.posY + floatY - py * 0.1, cur.posZ);
      g.scale.setScalar(cur.scale);
      g.rotation.set(cur.rotX + py * 0.2, cur.rotY + px * 0.3, cur.rotZ);
    }

    if (outerMesh.current) {
      outerMesh.current.rotation.y = time * 0.1;
    }

    if (wireMesh.current) {
      wireMesh.current.scale.setScalar(cur.cageScale);
      wireMesh.current.rotation.y = -time * 0.15;
      wireMesh.current.rotation.z = Math.sin(time * 0.3) * 0.15;
    }

    // Pulsating energy core
    if (coreMesh.current) {
      const pulse = 1 + Math.sin(time * cur.pulseSpeed * 3) * 0.15;
      coreMesh.current.scale.setScalar(0.45 * pulse);
    }

    // Kinetic orbital rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.35;
      ring1Ref.current.rotation.x = Math.sin(time * 0.3) * 0.4;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = time * 0.28;
      ring2Ref.current.rotation.z = -time * 0.22;
    }

    // Laser Scanner (active during Edge AI section)
    if (laserPlaneRef.current) {
      laserPlaneRef.current.visible = cur.laserScan;
      if (cur.laserScan) {
        laserPlaneRef.current.position.y = Math.sin(time * 3.5) * 1.1;
      }
    }

    if (reticleGroup.current) {
      reticleGroup.current.visible = cur.laserScan;
      if (cur.laserScan) {
        reticleGroup.current.rotation.z = time * 0.2;
      }
    }

    // Layered Stack (active during Skills section)
    if (stackTopRef.current && stackBottomRef.current) {
      const active = cur.stackOffset > 0.05;
      stackTopRef.current.visible = active;
      stackBottomRef.current.visible = active;
      if (active) {
        stackTopRef.current.position.y = cur.stackOffset;
        stackBottomRef.current.position.y = -cur.stackOffset;
      }
    }

    // Beacon Waves (active during Contact section)
    if (beaconRingsRef.current) {
      beaconRingsRef.current.visible = cur.beaconPulse;
      if (cur.beaconPulse) {
        beaconRingsRef.current.children.forEach((child, i) => {
          const mesh = child as THREE.Mesh;
          const cycle = (time * 0.8 + i * 0.33) % 1;
          mesh.scale.setScalar(1 + cycle * 2.2);
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, 0.45 * (1 - cycle));
        });
      }
    }
  });

  return (
    <group ref={rootGroup} position={[2.0, 0.1, -1.0]} scale={1.35}>
      {/* 1. Main Obsidian Geometric Core */}
      <mesh ref={outerMesh}>
        <icosahedronGeometry args={[1.0, 0]} />
        <primitive object={obsidianMat} attach="material" />
      </mesh>

      {/* 2. Decoupled Outer Wireframe Cage */}
      <mesh ref={wireMesh} scale={1.12}>
        <dodecahedronGeometry args={[1.0, 0]} />
        <primitive object={wireMat} attach="material" />
      </mesh>

      {/* 3. Internal Pulsating Silicon / NPU Energy Core */}
      <mesh ref={coreMesh} scale={0.45}>
        <octahedronGeometry args={[1.0, 0]} />
        <primitive object={coreMat} attach="material" />
      </mesh>

      {/* 4. Dual Kinetic Titanium Orbital Rings */}
      <mesh ref={ring1Ref} rotation={[0.6, 0.2, 0]}>
        <torusGeometry args={[1.55, 0.012, 16, 64]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-0.4, 0.8, 0.3]}>
        <torusGeometry args={[1.85, 0.009, 16, 64]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      {/* 5. Edge AI Holographic Laser Scanner */}
      <mesh ref={laserPlaneRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0, 1.4, 32]} />
        <primitive object={laserMat} attach="material" />
      </mesh>

      {/* Edge AI Holographic Corner Brackets Reticle */}
      <group ref={reticleGroup} visible={false}>
        {[-1.25, 1.25].map((x) =>
          [-1.25, 1.25].map((y) => (
            <group key={`${x}-${y}`} position={[x, y, 0]}>
              <mesh position={[x > 0 ? -0.1 : 0.1, 0, 0]}>
                <boxGeometry args={[0.2, 0.02, 0.02]} />
                <primitive object={coreMat} attach="material" />
              </mesh>
              <mesh position={[0, y > 0 ? -0.1 : 0.1, 0]}>
                <boxGeometry args={[0.02, 0.2, 0.02]} />
                <primitive object={coreMat} attach="material" />
              </mesh>
            </group>
          ))
        )}
      </group>

      {/* 6. Skills Multi-Tier Layered Stack Plates */}
      <mesh ref={stackTopRef} position={[0, 0, 0]} scale={[1.2, 0.04, 1.2]} visible={false}>
        <cylinderGeometry args={[1.1, 1.1, 0.08, 6]} />
        <primitive object={obsidianMat} attach="material" />
      </mesh>

      <mesh ref={stackBottomRef} position={[0, 0, 0]} scale={[1.2, 0.04, 1.2]} visible={false}>
        <cylinderGeometry args={[1.1, 1.1, 0.08, 6]} />
        <primitive object={obsidianMat} attach="material" />
      </mesh>

      {/* 7. Contact Beacon Ripples */}
      <group ref={beaconRingsRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <ringGeometry args={[0.9, 0.94, 48]} />
            <primitive object={beaconRingMat} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Suspended Data Constellation in depth
 */
function DataConstellation({ count = 95, day }: { count?: number; day: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = -2 - Math.random() * 16;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = clock.elapsedTime * 0.012;
    pointsRef.current.rotation.x = pointer.y * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        color={day ? "#8a5412" : "#f2bb6e"}
        size={0.034}
        transparent
        opacity={day ? 0.35 : 0.5}
        blending={day ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Cursor-tracked Raking Spotlight
 */
function RakeLight({ reduced }: { reduced: boolean }) {
  const light = useRef<THREE.SpotLight>(null!);
  const target = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!light.current) return;
    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;

    light.current.position.set(1.5 + px * 2.2, 1.5 + py * 1.6, 3.8);
    target.position.set(1.8, 0, -1.0);
    light.current.target = target;
  });

  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={light}
        color="#f2bb6e"
        intensity={2.2}
        angle={0.72}
        penumbra={0.85}
        decay={1.2}
      />
    </>
  );
}

function AtelierScene({
  reduced,
  day,
  onModeChange,
}: {
  reduced: boolean;
  day: boolean;
  onModeChange: (label: string) => void;
}) {
  const ground = day ? "#e9e6e0" : "#070809";
  return (
    <>
      <color attach="background" args={[ground]} />
      <fog attach="fog" args={[ground, 6, 26]} />
      <ambientLight intensity={day ? 0.75 : 0.24} color={day ? "#f3efe8" : "#1a2230"} />

      {/* Rim cool backlight */}
      <directionalLight position={[5, 4, -4]} intensity={0.85} color="#8ea3bd" />

      {/* Main Raking Key Spotlight */}
      <RakeLight reduced={reduced} />

      {/* The Persistent Scrollytelling Monolith */}
      <ScrollytellingMonolith day={day} reduced={reduced} onModeChange={onModeChange} />

      <Suspense fallback={null}>
        <DataConstellation count={100} day={day} />

        <Environment resolution={256}>
          <Lightformer intensity={1.6} color="#f2bb6e" position={[-4, 3, 3]} scale={[6, 6, 1]} />
          <Lightformer intensity={0.7} color="#8ea3bd" position={[5, -1, -2]} scale={[6, 6, 1]} />
        </Environment>
      </Suspense>
    </>
  );
}

export default function Atelier() {
  const [reduced, setReduced] = useState(false);
  const [ok, setOk] = useState(true);
  const [telemetry, setTelemetry] = useState("SYSTEM_ONLINE // CORE_IDLE");
  const day = usePrefs().colorway === "day";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onMq);

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    try {
      const c = document.createElement("canvas");
      if (!c.getContext("webgl2") && !c.getContext("webgl")) {
        setOk(false);
      }
    } catch {
      setOk(false);
    }

    return () => {
      mq.removeEventListener?.("change", onMq);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        {ok && (
          <Canvas
            className="w-full h-full"
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 50 }}
          >
            <AtelierScene reduced={reduced} day={day} onModeChange={setTelemetry} />
          </Canvas>
        )}
        <div className="atelier-grain" />
      </div>

      {/* Floating 3D Telemetry HUD - Anchored to the persistent 3D Monolith Engine */}
      <div
        className="fixed bottom-4 right-4 z-40 hidden sm:flex items-center gap-2.5 rounded border border-line/70 bg-vault/80 px-3 py-1.5 backdrop-blur-md font-mono text-[0.68rem] tracking-wider text-steel shadow-lg shadow-black/40"
        aria-live="polite"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-bright" />
        </span>
        <span className="text-amber-bright font-semibold">3D ENGINE</span>
        <span className="text-line-strong">|</span>
        <span className="text-ink">{telemetry}</span>
      </div>
    </>
  );
}
