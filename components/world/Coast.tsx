"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Lang } from "@/lib/data";
import { BOUNDS, driveTo, game, obstacles, propSpot, setTarget, stations, type Station } from "./game";
import { stationSign } from "./copy";

const SAND = "#e8dfc9";
const INK = "#183d45";
const accents = ["#cb7753", "#7b987d", "#487b88", "#d17851", "#639081", "#6d8ea0", "#a89775", "#d78b53"];

/* The quay's footprint, so the water knows where it breaks against the wall */
const QUAY = { cx: 0, cz: -10, hx: 43, hz: 29, r: 4 };
const SUN = new THREE.Vector3(-9, 18, 8).normalize();

const seaCommon = `uniform float uTime; uniform float uDay;
float quayDistance(vec2 p){
 vec2 q=abs(p-vec2(${QUAY.cx.toFixed(1)},${QUAY.cz.toFixed(1)}))-vec2(${(QUAY.hx - QUAY.r).toFixed(1)},${(QUAY.hz - QUAY.r).toFixed(1)});
 return length(max(q,0.))+min(max(q.x,q.y),0.)-${QUAY.r.toFixed(1)};
}
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
 vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){ vec2 o=vec2(1.7,9.2); return .5*noise(p)+.25*noise(p*2.03+o)+.125*noise(p*4.12+o*3.)+.0625*noise(p*8.37+o*7.); }
`;

/* Gerstner waves: the surface rolls in circles, so crests sharpen and troughs flatten like real swell */
const seaVertex = `${seaCommon}
varying vec3 vWorld; varying vec3 vNormal; varying float vHeight; varying float vShore;
vec3 wave(vec4 w, vec2 p, float amp, inout vec3 tangent, inout vec3 binormal){
 float k=6.28318/w.w, c=sqrt(9.8/k)*.62, s=w.z*amp; vec2 d=normalize(w.xy);
 float f=k*(dot(d,p)-c*uTime), a=s/k;
 tangent+=vec3(-d.x*d.x*s*sin(f), d.x*s*cos(f), -d.x*d.y*s*sin(f));
 binormal+=vec3(-d.x*d.y*s*sin(f), d.y*s*cos(f), -d.y*d.y*s*sin(f));
 return vec3(d.x*a*cos(f), a*sin(f), d.y*a*cos(f));
}
void main(){
 vec3 world=(modelMatrix*vec4(position,1.)).xyz;
 vec2 p=world.xz;
 float shore=quayDistance(p);
 // swell is calmer in the lee of the quay wall
 float amp=mix(.45,1.,smoothstep(0.,14.,shore));
 vec3 tangent=vec3(1,0,0), binormal=vec3(0,0,1), offset=vec3(0);
 offset+=wave(vec4(1.,.55,.15,15.),p,amp,tangent,binormal);
 offset+=wave(vec4(-.35,1.,.13,9.5),p,amp,tangent,binormal);
 offset+=wave(vec4(.7,-.45,.11,6.),p,amp,tangent,binormal);
 offset+=wave(vec4(-.9,-.25,.08,3.6),p,amp,tangent,binormal);
 world+=offset;
 vWorld=world; vHeight=offset.y; vShore=shore;
 vNormal=normalize(cross(binormal,tangent));
 gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
}`;

const seaFragment = `${seaCommon}
uniform vec3 uSun; uniform vec3 uFog; uniform vec2 uFogRange;
varying vec3 vWorld; varying vec3 vNormal; varying float vHeight; varying float vShore;
vec3 skyColor(vec3 dir){
 float h=clamp(dir.y,0.,1.);
 vec3 horizon=mix(vec3(.09,.15,.2),vec3(.78,.88,.92),uDay);
 vec3 zenith=mix(vec3(.02,.05,.09),vec3(.32,.56,.78),uDay);
 return mix(horizon,zenith,pow(h,.6));
}
void main(){
 vec2 p=vWorld.xz;
 // fine chop riding on the swell, as a scrolling noise height field
 vec2 q=p*.55;
 float e=.06;
 vec2 flowA=vec2(uTime*.32,uTime*.18), flowB=vec2(-uTime*.21,uTime*.27);
 float h0=fbm(q+flowA)+fbm(q*1.9+flowB)*.5;
 float hx=fbm(q+vec2(e,0)+flowA)+fbm((q+vec2(e,0))*1.9+flowB)*.5;
 float hz=fbm(q+vec2(0,e)+flowA)+fbm((q+vec2(0,e))*1.9+flowB)*.5;
 vec3 n=normalize(vNormal+vec3(h0-hx,0.,h0-hz)*1.6);

 vec3 viewDir=normalize(cameraPosition-vWorld);
 float facing=clamp(dot(n,viewDir),0.,1.);
 float fresnel=.02+.98*pow(1.-facing,5.);

 // water body: turquoise over the shallow shelf by the quay, deep blue-green further out
 vec3 deep=mix(vec3(.004,.03,.05),vec3(.01,.16,.24),uDay);
 vec3 shallow=mix(vec3(.008,.045,.06),vec3(.05,.42,.45),uDay);
 vec3 body=mix(shallow,deep,smoothstep(1.,26.,vShore));
 // light scattering up through the thin top of each crest
 float sss=max(vHeight,0.)*pow(max(dot(viewDir,-uSun),0.)*.5+.5,2.);
 body+=mix(vec3(.01,.04,.04),vec3(.06,.3,.26),uDay)*sss*1.6;
 float diffuse=max(dot(n,uSun),0.)*.35+.65;
 vec3 color=body*diffuse;

 vec3 reflected=reflect(-viewDir,n); reflected.y=abs(reflected.y);
 color=mix(color,skyColor(reflected),fresnel*.85);

 // sun (or moon) on the water
 vec3 halfDir=normalize(viewDir+uSun);
 float spec=pow(max(dot(n,halfDir),0.),mix(180.,420.,uDay));
 color+=mix(vec3(.55,.62,.75),vec3(1.,.9,.72),uDay)*spec*mix(1.2,2.4,uDay);

 // foam: a churned line along the wall, swash bands rolling in, and whitecaps on the tallest crests
 float grain=fbm(p*1.4+vec2(uTime*.4,-uTime*.25));
 float edge=1.-smoothstep(.0,.45+grain*1.1,vShore);
 float lace=smoothstep(.45,.75,fbm(p*3.1+vec2(-uTime*.3,uTime*.2)));
 float swash=smoothstep(.82,1.,sin(vShore*2.4-uTime*1.7+grain*3.))*(1.-smoothstep(.3,4.5,vShore))*lace;
 float caps=smoothstep(.5,.66,vHeight+grain*.18)*lace*smoothstep(.6,.8,fbm(p*.7-uTime*.08));
 float foam=clamp(edge+swash*.7+caps*.45,0.,1.);
 color=mix(color,mix(vec3(.32,.4,.44),vec3(.93,.96,.96),uDay)*(diffuse*.6+.4),foam);

 float depth=length(vWorld-cameraPosition);
 color=mix(color,uFog,smoothstep(uFogRange.x,uFogRange.y,depth));
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

/** A plane packed with vertices near the quay and sparse out at sea, laid flat. */
function seaGeometry() {
  const g = new THREE.PlaneGeometry(2, 2, 300, 300);
  const pos = g.attributes.position;
  const spread = (u: number) => 320 * (.3 * u + .7 * u * Math.abs(u));
  for (let i = 0; i < pos.count; i++) pos.setXY(i, spread(pos.getX(i)), spread(pos.getY(i)));
  g.rotateX(-Math.PI / 2);
  g.computeBoundingSphere();
  return g;
}

function Ocean({ day }: { day: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null!);
  const geometry = useMemo(seaGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uDay: { value: day ? 1 : 0 }, uSun: { value: SUN.clone() },
    uFog: { value: new THREE.Color() }, uFogRange: { value: new THREE.Vector2(110, 320) },
  }), []); // uniforms retain identity
  useFrame(({ scene }, dt) => {
    const u = material.current.uniforms;
    u.uTime.value += Math.min(dt, .05);
    u.uDay.value = THREE.MathUtils.damp(u.uDay.value, day ? 1 : 0, 3, dt);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) { u.uFog.value.copy(fog.color); u.uFogRange.value.set(fog.near, fog.far); }
  });
  return <mesh geometry={geometry} position={[0, -.95, 0]} frustumCulled={false}>
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={seaVertex} fragmentShader={seaFragment} />
  </mesh>;
}

/* ---- Surfaces drawn once to canvases: paving, asphalt and lawn ---- */

function seeded(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

function surface(size: number, draw: (ctx: CanvasRenderingContext2D, rand: () => number) => void, repeat = 1) {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, seeded(7));
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  t.repeat.set(repeat, repeat);
  return t;
}

function speckle(ctx: CanvasRenderingContext2D, rand: () => number, size: number, count: number, tones: string[]) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = tones[Math.floor(rand() * tones.length)];
    ctx.globalAlpha = .15 + rand() * .35;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }
  ctx.globalAlpha = 1;
}

/* sandstone slabs in a running bond, each a slightly different stone */
const paving = () => surface(512, (ctx, rand) => {
  ctx.fillStyle = "#a49c8d"; ctx.fillRect(0, 0, 512, 512);
  const rows = 8, h = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const w = 128, shift = r % 2 ? w / 2 : 0;
    for (let c = -1; c < 512 / w + 1; c++) {
      const l = 75 + rand() * 5, hue = 36 + rand() * 7;
      ctx.fillStyle = `hsl(${hue} ${18 + rand() * 10}% ${l}%)`;
      ctx.fillRect(c * w + shift + 1, r * h + 1, w - 2, h - 2);
    }
  }
  speckle(ctx, rand, 512, 9000, ["#b0a693", "#b9ae98", "#a29a8a", "#d0c6b1"]);
}, 1 / 7);

const asphalt = () => surface(512, (ctx, rand) => {
  ctx.fillStyle = "#53585a"; ctx.fillRect(0, 0, 512, 512);
  speckle(ctx, rand, 512, 28000, ["#454a4c", "#65696a", "#4d5254", "#737470"]);
});

const lawn = () => surface(512, (ctx, rand) => {
  // mown in stripes, light and dark, then scattered with blades of every shade
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? "#526b3d" : "#586f41"; ctx.fillRect(i * 128, 0, 128, 512); }
  for (let i = 0; i < 11000; i++) {
    const x = rand() * 512, y = rand() * 512, l = 24 + rand() * 16;
    ctx.strokeStyle = `hsl(${78 + rand() * 28} ${26 + rand() * 16}% ${l}%)`;
    ctx.globalAlpha = .35; ctx.lineWidth = .6 + rand();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 2, y - 2 - rand() * 4); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}, 1 / 5);

/* ---- Palms: a ringed, leaning trunk under a crown of drooping, feathered fronds ---- */

const TRUNK = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0), new THREE.Vector3(.1, 1.4, 0), new THREE.Vector3(.42, 2.9, 0), new THREE.Vector3(.95, 4.2, 0),
]);
const CROWN = TRUNK.getPointAt(1);

function trunkGeometry() {
  const segments = 30, radial = 9;
  const g = new THREE.TubeGeometry(TRUNK, segments, 1, radial, false);
  const pos = g.attributes.position, colors: number[] = [];
  const v = new THREE.Vector3(), c = new THREE.Color(), dark = new THREE.Color("#5e4c38"), light = new THREE.Color("#a28c6a");
  for (let i = 0; i <= segments; i++) {
    const center = TRUNK.getPointAt(i / segments);
    const t = i / segments;
    const radius = (.25 - .1 * t) * (i % 2 ? 1 : .9) * (i === 0 ? 1.25 : 1);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, k).sub(center).multiplyScalar(radius).add(center);
      pos.setXYZ(k, v.x, v.y, v.z);
      c.copy(dark).lerp(light, (i % 2 ? .75 : .2) + t * .15);
      colors.push(c.r, c.g, c.b);
    }
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

/** One frond: a spine that arcs up and falls away, with leaflets swept forward and folded into a V. */
function frondGeometry() {
  const steps = 24, length = 3.3;
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const c = new THREE.Color(), base = new THREE.Color("#36533a"), tip = new THREE.Color("#7c8b55");
  const vertex = (x: number, y: number, z: number, shade: number) => {
    positions.push(x, y, z);
    c.copy(base).lerp(tip, shade); colors.push(c.r, c.g, c.b);
  };
  // A continuous narrow midrib, with separate curved leaflets instead of a zigzag sheet.
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, y = 1.15 * t - 2 * t * t, w = .024 * (1 - t) + .004;
    vertex(-w, y, length * t, t * .45); vertex(w, y, length * t, t * .45);
    if (i < steps) { const q = i * 2; indices.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
  }
  for (let i = 2; i < steps; i++) {
    const t = i / steps, z = length * t, y = 1.15 * t - 2 * t * t;
    const span = .86 * Math.pow(Math.sin(Math.PI * t), .8) * (.94 + .06 * Math.sin(i * 2.7));
    for (const side of [-1, 1]) {
      const start = positions.length / 3;
      for (let j = 0; j <= 3; j++) {
        const u = j / 3;
        const width = .052 * Math.sin(Math.PI * u) + .009 * (1 - u);
        const x = side * span * u, yy = y - span * (.16 * u + .4 * u * u);
        const zz = z + span * .32 * u + side * .012;
        vertex(x, yy + width * .22, zz - width, .15 + t * .45 + u * .18);
        vertex(x, yy - width * .22, zz + width, .08 + t * .45 + u * .18);
        if (j < 3) { const q = start + j * 2; indices.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(indices); g.computeVertexNormals();
  return g;
}

let palmParts: { trunk: THREE.BufferGeometry; frond: THREE.BufferGeometry; bark: THREE.Material; leaf: THREE.Material; dry: THREE.Material } | null = null;
const parts = () => palmParts ??= {
  trunk: trunkGeometry(),
  frond: frondGeometry(),
  bark: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75, side: THREE.DoubleSide, shadowSide: THREE.DoubleSide }),
  dry: new THREE.MeshStandardMaterial({ vertexColors: true, color: "#c49a5a", roughness: .9, side: THREE.DoubleSide, shadowSide: THREE.DoubleSide }),
};

const FRONDS = Array.from({ length: 11 }, (_, i) => ({
  yaw: i * Math.PI * 2 / 11 + Math.sin(i * 7.1) * .2,
  // young fronds stand up through the middle, old ones hang lowest
  pitch: i % 4 === 0 ? -.45 : .05 + (Math.sin(i * 3.7) * .5 + .5) * .45,
  scale: .85 + (Math.sin(i * 5.3) * .5 + .5) * .3,
  dry: i === 3 || i === 8,
}));

function Palm({ x, z, scale = 1, turn = 0 }: { x: number; z: number; scale?: number; turn?: number }) {
  const { trunk, frond, bark, leaf, dry } = parts();
  return <group position={[x, 0, z]} scale={scale} rotation-y={turn}>
    <mesh geometry={trunk} material={bark} castShadow receiveShadow />
    <group position={CROWN}>
      {FRONDS.map((f, i) => <group key={i} rotation-y={f.yaw}>
        <mesh geometry={frond} material={f.dry ? dry : leaf} rotation-x={f.dry ? .95 : f.pitch} scale={f.scale} castShadow receiveShadow />
      </group>)}
      {[0, 1, 2, 3].map(i => <mesh key={i} position={[Math.cos(i * 1.7) * .2, -.22 - (i % 2) * .08, Math.sin(i * 1.7) * .2]} castShadow>
        <sphereGeometry args={[.13, 10, 8]} /><meshStandardMaterial color={i % 2 ? "#5a4526" : "#6f7a34"} roughness={.6} />
      </mesh>)}
    </group>
    {/* a stone planter of shrubs at its foot */}
    <mesh position={[0, .2, 0]} castShadow receiveShadow><cylinderGeometry args={[1.15, 1.25, .4, 20, 1, true]} /><meshStandardMaterial color="#9b9483" roughness={.95} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, .34, 0]} rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[1.12, 20]} /><meshStandardMaterial color="#3f3122" roughness={1} /></mesh>
    {[0, 1, 2, 3, 4].map(i => <mesh key={i} position={[Math.cos(i * 1.26 + .4) * .68, .52 + (i % 2) * .08, Math.sin(i * 1.26 + .4) * .68]} scale={[1, .75, 1]} castShadow receiveShadow>
      <icosahedronGeometry args={[.36 + (i % 3) * .06, 2]} />
      <meshStandardMaterial color={["#3c5738", "#536c43", "#47623c"][i % 3]} roughness={.95} />
    </mesh>)}
  </group>;
}

/* Shared architectural materials: fine surface relief, rather than flat painted boxes. */
function pavilionMaterials() {
  const plaster = surface(256, (ctx, rand) => {
    ctx.fillStyle = "#eeeae0"; ctx.fillRect(0, 0, 256, 256);
    speckle(ctx, rand, 256, 6500, ["#dad5c9", "#fffaf0", "#e8e2d5"]);
  });
  const timber = surface(512, (ctx, rand) => {
    ctx.fillStyle = "#a17b51"; ctx.fillRect(0, 0, 512, 512);
    // Long, low-contrast fibres run down the battens, with a little natural wandering.
    for (let i = 0; i < 620; i++) {
      const x = rand() * 512;
      ctx.strokeStyle = i % 3 ? "#61452d" : "#ddbd8a";
      ctx.globalAlpha = .04 + rand() * .13;
      ctx.lineWidth = .4 + rand() * 1.5;
      ctx.beginPath(); ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 5, 170, x - 7, 340, x + 2, 512); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  const stone = surface(256, (ctx, rand) => {
    ctx.fillStyle = "#c6beae"; ctx.fillRect(0, 0, 256, 256);
    speckle(ctx, rand, 256, 8000, ["#a39b8c", "#eee5d4", "#c1b7a4"]);
  });
  const materials = {
    plaster: new THREE.MeshStandardMaterial({ map: plaster, bumpMap: plaster, bumpScale: .018, roughness: .94 }),
    timber: new THREE.MeshStandardMaterial({ map: timber, bumpMap: timber, bumpScale: .012, roughness: .7 }),
    stone: new THREE.MeshStandardMaterial({ map: stone, bumpMap: stone, bumpScale: .025, roughness: .88 }),
    metal: new THREE.MeshStandardMaterial({ color: "#394647", metalness: .75, roughness: .38 }),
    roof: new THREE.MeshStandardMaterial({ color: "#85908a", metalness: .3, roughness: .68 }),
    brass: new THREE.MeshStandardMaterial({ color: "#a28a64", metalness: .8, roughness: .36 }),
  };
  return { materials, textures: [plaster, timber, stone] };
}

type PavilionMaterials = ReturnType<typeof pavilionMaterials>["materials"];

const BATTENS: [number, number, number][] = [-1, 1].flatMap(side =>
  Array.from({ length: 5 }, (_, i): [number, number, number] => [side * (2.12 + i * .21), 2.12, -1.97])
);
const ROOF_SEAMS: [number, number, number][] = Array.from({ length: 11 }, (_, i) => [-3.35 + i * .67, 4.565, -.4]);

/** Repeated joinery shares one draw call per pavilion instead of one per strip. */
function Joinery({ positions, size, material, castShadow = false }: {
  positions: [number, number, number][];
  size: [number, number, number];
  material: THREE.Material;
  castShadow?: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    positions.forEach((position, index) => mesh.current.setMatrixAt(index, matrix.makeTranslation(...position)));
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [positions]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, positions.length]} material={material} castShadow={castShadow} receiveShadow>
    <boxGeometry args={size} />
  </instancedMesh>;
}

function Sign({ title, day, materials }: { title: string; day: boolean; materials: PavilionMaterials }) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = 2048; canvas.height = 350;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#263b3c"; ctx.fillRect(0, 0, 2048, 350);
    ctx.fillStyle = "#ede4d1";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    let size = 284;
    ctx.font = `600 ${size}px ${game.fonts.body}`;
    let metrics = ctx.measureText(title);
    while ((metrics.width > 1820 || metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent > 270) && size > 140) {
      size -= 4; ctx.font = `600 ${size}px ${game.fonts.body}`;
      metrics = ctx.measureText(title);
    }
    // Centre the actual glyphs, including Vietnamese accents, rather than the font's line box.
    ctx.fillText(title, 1024, (350 + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    return t;
  }, [title]);
  useEffect(() => () => map.dispose(), [map]);
  return <group position={[0, 3.84, 2.12]} rotation-x={-.12}>
    {/* A shallow fascia below the eave; lettering stays below the bloom threshold. */}
    <RoundedBox args={[6.72, 1.25, .13]} radius={.035} material={materials.timber} castShadow />
    <mesh position-z={.078}>
      <planeGeometry args={[6.5, 1.11]} />
      <meshBasicMaterial map={map} color={day ? "#ffffff" : "#d2d5d0"} toneMapped={false} />
    </mesh>
    {[-3.29, 3.29].flatMap(x => [-.55, .55].map(y => <mesh key={`${x}:${y}`} position={[x, y, .085]} rotation-x={Math.PI / 2} material={materials.metal}>
      <cylinderGeometry args={[.018, .018, .012, 8]} />
    </mesh>))}
  </group>;
}

function ProjectObject({ station, color }: { station: Station; color: string }) {
  if (station.project?.name.includes("Cinema")) return <group position={[0, 1.25, 0]}>
    <mesh rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[1.05, 1.05, .2, 36]} /><meshStandardMaterial color="#bbab88" metalness={.65} roughness={.35} /></mesh>
    <mesh position={[0, 0, .12]}><circleGeometry args={[.18, 20]} /><meshStandardMaterial color={INK} /></mesh>
    {Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[Math.cos(i * 1.256) * .61, Math.sin(i * 1.256) * .61, .12]}>
      <circleGeometry args={[.23, 18]} /><meshStandardMaterial color={INK} />
    </mesh>)}
    <mesh position={[0, -1.06, 0]} castShadow><boxGeometry args={[1.7, .18, .7]} /><meshStandardMaterial color={INK} /></mesh>
  </group>;
  if (station.project?.name.includes("Waste")) return <group>
    {["#537b67", "#5a8f9c", "#d39b58"].map((c, i) => <group key={c} position={[(i - 1) * .72, 0, 0]}>
      <RoundedBox args={[.58, .95, .62]} radius={.08} position={[0, .52, 0]} castShadow><meshStandardMaterial color={c} /></RoundedBox>
      <mesh position={[0, 1.04, 0]} castShadow><boxGeometry args={[.65, .12, .69]} /><meshStandardMaterial color={INK} /></mesh>
      <mesh position={[0, .6, .318]}><boxGeometry args={[.23, .05, .02]} /><meshBasicMaterial color={SAND} /></mesh>
    </group>)}
    <mesh position={[-1.2, 1, -.25]} castShadow><boxGeometry args={[.09, 2, .09]} /><meshStandardMaterial color={INK} /></mesh>
    <mesh position={[-.65, 2, -.25]} castShadow><boxGeometry args={[1.2, .09, .09]} /><meshStandardMaterial color={INK} /></mesh>
  </group>;
  if (station.kind === "project") return <group position={[0, 1.05, 0]}>
    <mesh rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[.07, .07, 2.5, 12]} /><meshStandardMaterial color="#a6b7b4" metalness={.8} roughness={.3} /></mesh>
    {[-1, -.8, .8, 1].map(x => <mesh key={x} position={[x, 0, 0]} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[.52, .52, .17, 28]} /><meshStandardMaterial color={INK} /></mesh>)}
    {[-.55, .55].map(x => <mesh key={x} position={[x, -.5, 0]} castShadow><boxGeometry args={[.12, 1, .12]} /><meshStandardMaterial color={color} /></mesh>)}
  </group>;
  return <group position={[0, 1.3, 0]} rotation-y={.35}>
    <mesh castShadow><torusGeometry args={[.78, .23, 12, 32]} /><meshStandardMaterial color={color} roughness={.4} metalness={.3} /></mesh>
    <mesh position={[0, -.9, 0]} castShadow><boxGeometry args={[1.4, .2, .8]} /><meshStandardMaterial color={INK} /></mesh>
  </group>;
}

function Pavilion({ station, index, lang, day, materials }: { station: Station; index: number; lang: Lang; day: boolean; materials: PavilionMaterials }) {
  const color = accents[index];
  const ring = useRef<THREE.MeshBasicMaterial>(null!);
  const light = useRef<THREE.SpotLight>(null!);
  const lightTarget = useRef<THREE.Object3D>(null!);
  useEffect(() => { light.current.target = lightTarget.current; }, []);
  useFrame(() => { ring.current.opacity = game.active === index ? .65 : .12; });
  const prop = propSpot(station);
  return <>
    <group position={[station.x, 0, station.z]} rotation-y={station.rot} onClick={(e) => { e.stopPropagation(); driveTo(index); }}>
      {/* A shallow stone step and a raised floor give the walls a convincing footing. */}
      <RoundedBox args={[7.5, .16, 4.8]} radius={.045} position={[0, .08, -.65]} material={materials.stone} receiveShadow castShadow />
      <RoundedBox args={[7.12, .22, 4.3]} radius={.04} position={[0, .25, -.8]} material={materials.stone} receiveShadow castShadow />
      <mesh position={[0, 2.32, -2.15]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 3.92, .24]} />
        <meshStandardMaterial color={color} map={materials.plaster.map} bumpMap={materials.plaster.bumpMap} bumpScale={.018} roughness={.92} />
      </mesh>
      {[-3.28, 3.28].map(x => <group key={x}>
        <mesh position={[x, 2.32, -.4]} material={materials.plaster} castShadow receiveShadow><boxGeometry args={[.24, 3.92, 3.7]} /></mesh>
        <mesh position={[x, 2.36, 1.48]} material={materials.metal} castShadow><boxGeometry args={[.16, 4, .16]} /></mesh>
        <mesh position={[x, .41, 1.48]} material={materials.metal}><boxGeometry args={[.3, .1, .3]} /></mesh>
        <mesh position={[x, 4.25, 1.9]} material={materials.metal} castShadow><boxGeometry args={[.12, .14, .9]} /></mesh>
      </group>)}
      {/* Cedar battens at either side of the exhibit, with real gaps and depth. */}
      <Joinery positions={BATTENS} size={[.16, 3.5, .12]} material={materials.timber} castShadow />
      <mesh position={[0, .68, -1.97]} material={materials.timber} receiveShadow><boxGeometry args={[6.25, .58, .1]} /></mesh>
      <mesh position={[0, 4.3, -.4]} material={materials.timber} receiveShadow><boxGeometry args={[6.5, .12, 3.85]} /></mesh>
      {/* Thin standing-seam metal canopy, capped edges, and a rear rainwater pipe. */}
      <RoundedBox args={[7.45, .16, 4.5]} radius={.045} position={[0, 4.48, -.4]} material={materials.roof} castShadow receiveShadow />
      <Joinery positions={ROOF_SEAMS} size={[.018, .025, 4.46]} material={materials.roof} />
      {[-3.7, 3.7].map(x => <mesh key={x} position={[x, 4.46, -.4]} material={materials.roof}><boxGeometry args={[.035, .1, 4.5]} /></mesh>)}
      <mesh position={[3.35, 2.24, -2.35]} material={materials.metal} castShadow><cylinderGeometry args={[.065, .065, 4.16, 10]} /></mesh>
      <Sign title={stationSign(station, lang)} day={day} materials={materials} />
      <RoundedBox args={[3.3, .28, 1.75]} radius={.065} position={[0, .5, -.45]} material={materials.stone} receiveShadow castShadow />
      <mesh position={[0, .66, -.45]} material={materials.stone}><boxGeometry args={[3.16, .04, 1.62]} /></mesh>
      <group position={[0, .69, -.5]}><ProjectObject station={station} color={color} /></group>
      {/* A real downlight illuminates the object and the timber, with no extra shadow-map pass. */}
      <mesh position={[0, 3.1, 1.65]} material={materials.metal}><boxGeometry args={[2.8, .1, .22]} /></mesh>
      <mesh position={[0, 3.04, 1.65]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[2.65, .14]} /><meshBasicMaterial color={day ? "#c6c5b8" : "#bba78b"} toneMapped={false} />
      </mesh>
      <spotLight ref={light} position={[0, 3.04, 1.55]} color="#ffe7c2" intensity={day ? 5 : 12} distance={6} angle={.9} penumbra={1} decay={2} />
      <object3D ref={lightTarget} position={[0, .85, -.8]} />
    </group>
    <group position={[prop.x, 0, prop.z]}><Palm x={0} z={0} scale={.72} turn={index} /></group>
    <mesh position={[station.px, .043, station.pz]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[1.96, 2.015, 64]} /><meshBasicMaterial ref={ring} color={day ? "#947d5d" : "#d0bb95"} transparent depthWrite={false} />
    </mesh>
  </>;
}

/* ---- The ring road, worked out once: the scene draws it and the lamps line it ---- */

function crossing(a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2, d: THREE.Vector2) {
  const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y;
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / den, u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? new THREE.Vector2(a.x + rx * t, a.y + ry * t) : null;
}

/** On a bend tighter than the road is wide, the inside edge ties a small loop in itself; pinch each loop shut. */
function untangle(edge: THREE.Vector2[]) {
  for (let i = 0; i < edge.length - 1; i++) {
    for (let j = Math.min(edge.length - 2, i + 40); j > i + 1; j--) {
      const hit = crossing(edge[i], edge[i + 1], edge[j], edge[j + 1]);
      if (!hit) continue;
      for (let k = i + 1; k <= j; k++) edge[k].copy(hit);
      i = j;
      break;
    }
  }
  return edge;
}

const ROAD = (() => {
  const stops = [new THREE.Vector3(-25, 0, 8), ...stations.slice(1).map(s => new THREE.Vector3(s.px, 0, s.pz)), new THREE.Vector3(26, 0, 9), new THREE.Vector3(0, 0, 10)];
  const curve = new THREE.CatmullRomCurve3(stops, true, "catmullrom", .3);
  const count = 240, half = 3.1, left: THREE.Vector2[] = [], right: THREE.Vector2[] = [];
  for (let i = 0; i <= count; i++) {
    const p = curve.getPoint(i / count), d = curve.getTangent(i / count);
    left.push(new THREE.Vector2(p.x - d.z * half, p.z + d.x * half));
    right.push(new THREE.Vector2(p.x + d.z * half, p.z - d.x * half));
  }
  untangle(left); untangle(right);
  const leftInside = Math.abs(THREE.ShapeUtils.area(left)) < Math.abs(THREE.ShapeUtils.area(right));
  return { curve, left, right, half, length: curve.getLength(), inner: leftInside ? left : right, side: leftInside ? -1 : 1 };
})();

/* Put a lamp beside each frontage, rather than letting a post cross its lettering. */
const FRONTAGE_LAMPS = stations.slice(1).map(station => {
  const nx = Math.sin(station.rot), nz = Math.cos(station.rot);
  return {
    x: station.x + nz * 4.05 + nx * 2.4,
    z: station.z - nx * 4.05 + nz * 2.4,
    face: station.rot,
  };
});
/* The rest follow the empty stretches of the loop, away from the pavilion faces. */
const LOOP_LAMPS = Array.from({ length: 14 }, (_, i) => {
  const t = (i + .5) / 14, p = ROAD.curve.getPointAt(t), d = ROAD.curve.getTangentAt(t);
  const nx = -d.z * ROAD.side, nz = d.x * ROAD.side; // from the road out to its verge
  const off = ROAD.half + .7;
  return { x: p.x + nx * off, z: p.z + nz * off, face: Math.atan2(-nx, -nz) };
}).filter(lamp => stations.slice(1).every(station => Math.hypot(lamp.x - station.x, lamp.z - station.z) > 10));
const LAMPS = [...FRONTAGE_LAMPS, ...LOOP_LAMPS];
// the car should go round a lamp post, not through it
obstacles.push(...LAMPS.map(l => ({ x: l.x, z: l.z, r: .3 })));

const poolTexture = () => {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!, g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.35, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
};

const BULB_ON = new THREE.Color(5, 3.6, 2.1);

/** Lamps light the road after dark: a glowing head, a warm pool on the ground, and real light from every other one. */
function StreetLamps({ day }: { day: boolean }) {
  const { pool, bulb, glow, iron } = useMemo(() => {
    const pool = poolTexture();
    return {
      pool,
      bulb: new THREE.MeshBasicMaterial({ toneMapped: false }),
      glow: new THREE.MeshBasicMaterial({ color: "#ffb766", map: pool, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      iron: new THREE.MeshStandardMaterial({ color: "#2d3431", metalness: .6, roughness: .45 }),
    };
  }, []);
  useEffect(() => () => { pool.dispose(); bulb.dispose(); glow.dispose(); iron.dispose(); }, [pool, bulb, glow, iron]);
  const level = useRef(day ? 0 : 1);
  const lights = useRef<(THREE.PointLight | null)[]>([]);
  useFrame((_, dt) => {
    // ease in and out at dusk rather than snapping
    level.current = THREE.MathUtils.damp(level.current, day ? 0 : 1, 3, dt);
    const k = level.current;
    bulb.color.setRGB(.75, .72, .66).lerp(BULB_ON, k);
    glow.opacity = k * .2;
    lights.current.forEach(l => { if (l) l.intensity = k * 18; });
  });
  return <>
    {LAMPS.map((l, i) => <group key={i} position={[l.x, 0, l.z]} rotation-y={l.face}>
      <mesh position={[0, .15, 0]} material={iron} castShadow receiveShadow><cylinderGeometry args={[.2, .26, .3, 10]} /></mesh>
      <mesh position={[0, 2.3, 0]} material={iron} castShadow><cylinderGeometry args={[.06, .1, 4.4, 10]} /></mesh>
      <mesh position={[0, 4.45, .7]} rotation-x={Math.PI / 2} material={iron} castShadow><cylinderGeometry args={[.045, .045, 1.45, 8]} /></mesh>
      <mesh position={[0, 4.42, 1.45]} material={iron} castShadow><boxGeometry args={[.36, .14, .7]} /></mesh>
      <mesh position={[0, 4.34, 1.45]} scale={[.8, .35, 1.4]} material={bulb}><sphereGeometry args={[.22, 14, 8]} /></mesh>
      <mesh position={[0, .06, 1.45]} rotation-x={-Math.PI / 2} material={glow} renderOrder={2}><planeGeometry args={[7, 7]} /></mesh>
      {i % 2 === 0 && <pointLight ref={el => { lights.current[i] = el; }} position={[0, 4.1, 1.45]} color="#ffc48a" intensity={0} distance={15} decay={1.6} />}
    </group>)}
  </>;
}

function Promenade({ day }: { day: boolean }) {
  const platform = useMemo(() => {
    const shape = new THREE.Shape(); const w = 43, n = -19, south = 39, r = 4;
    shape.moveTo(-w + r, n); shape.lineTo(w - r, n); shape.quadraticCurveTo(w, n, w, n + r);
    shape.lineTo(w, south - r); shape.quadraticCurveTo(w, south, w - r, south); shape.lineTo(-w + r, south);
    shape.quadraticCurveTo(-w, south, -w, south - r); shape.lineTo(-w, n + r); shape.quadraticCurveTo(-w, n, -w + r, n);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false, curveSegments: 14 });
    g.rotateX(-Math.PI / 2); g.translate(0, -1.4, 0); return g;
  }, []);
  const road = useMemo(() => {
    const { curve, left, right, inner, length, half } = ROAD;
    const vertices: number[] = [], uvs: number[] = [], indices: number[] = [];
    left.forEach((l, i) => {
      const r = right[i], v = i / (left.length - 1) * length / (half * 2);
      vertices.push(l.x, .027, l.y, r.x, .027, r.y);
      uvs.push(0, v, 1, v);
      if (i < left.length - 1) { const a = i * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    // grass fills the loop, up to its inner edge
    const green = new THREE.ShapeGeometry(new THREE.Shape(inner.slice(0, -1).map(p => new THREE.Vector2(p.x, -p.y))));
    green.rotateX(-Math.PI / 2);
    return { geometry, curve, green };
  }, []);
  const textures = useMemo(() => ({ paving: paving(), asphalt: asphalt(), lawn: lawn() }), []);
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ map: textures.paving, roughness: .92 }),
    // the quay wall: the same stone, darkened where the sea keeps it wet
    new THREE.MeshStandardMaterial({ map: textures.paving, color: "#6f6a5e", roughness: .8 }),
  ], [textures]);
  useEffect(() => { materials[0].color.set(day ? "#e3ddd1" : "#a2a7a3"); materials[1].color.set(day ? "#6f6a5e" : "#4a4f4d"); }, [day, materials]);
  useEffect(() => () => {
    platform.dispose(); road.geometry.dispose(); road.green.dispose();
    Object.values(textures).forEach(t => t.dispose()); materials.forEach(m => m.dispose());
  }, [platform, road, textures, materials]);
  const drive = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); setTarget(THREE.MathUtils.clamp(e.point.x, -BOUNDS.x, BOUNDS.x), THREE.MathUtils.clamp(e.point.z, BOUNDS.north, BOUNDS.south));
  };
  return <>
    <mesh geometry={platform} material={materials} receiveShadow castShadow onPointerDown={drive} />
    <mesh geometry={road.green} position-y={.018} receiveShadow onPointerDown={drive}><meshStandardMaterial map={textures.lawn} bumpMap={textures.lawn} bumpScale={.035} color={day ? "#c8cdbb" : "#b4c1b5"} roughness={1} /></mesh>
    <mesh geometry={road.geometry} receiveShadow onPointerDown={drive}><meshStandardMaterial map={textures.asphalt} bumpMap={textures.asphalt} bumpScale={.012} color={day ? "#e8e8e8" : "#c3cbcf"} roughness={.94} side={THREE.DoubleSide} /></mesh>
    {Array.from({ length: 68 }, (_, i) => {
      const p = road.curve.getPoint(i / 68), d = road.curve.getTangent(i / 68);
      return <mesh key={i} position={[p.x, .036, p.z]} rotation={[-Math.PI / 2, 0, -Math.atan2(d.x, d.z)]} receiveShadow>
        <planeGeometry args={[.14, 1.1]} /><meshStandardMaterial color={day ? "#ece6d6" : "#a9a495"} roughness={.7} />
      </mesh>;
    })}
    {Array.from({ length: 20 }, (_, i) => {
      const x = -38 + i * 4;
      return <group key={i} position={[x, 0, 17]}>
        <mesh position={[0, -.3, 0]} castShadow><cylinderGeometry args={[.12, .16, 2.5, 8]} /><meshStandardMaterial color="#3f4a44" metalness={.5} roughness={.5} /></mesh>
        <mesh position={[0, 1, 0]}><sphereGeometry args={[.17, 10, 8]} /><meshBasicMaterial color={day ? "#f0d2a0" : "#ffd093"} toneMapped={false} /></mesh>
      </group>;
    })}
    <mesh position={[0, .75, 17]} castShadow><boxGeometry args={[78, .07, .07]} /><meshStandardMaterial color="#889386" metalness={.6} roughness={.35} /></mesh>
  </>;
}

/* breakwater boulders along both flanks, half in the surf */
const BOULDERS = Array.from({ length: 34 }, (_, i) => {
  const side = i % 2 ? -1 : 1, k = Math.floor(i / 2);
  return {
    position: [side * (44.2 + Math.sin(i * 3) * 1.4), -1.1 + Math.sin(i * 1.9) * .25, -38 + k * 3.4 + Math.sin(i * 5) * .8] as [number, number, number],
    scale: [1.3 + (i % 3) * .45, .95 + (i % 2) * .7, 1.5 + Math.sin(i) * .4] as [number, number, number],
    rotation: [i, i * .8, .2] as [number, number, number],
    color: ["#6d6b63", "#827f74", "#5b5a54"][i % 3],
  };
});

export default function Coast({ lang, day }: { lang: Lang; day: boolean }) {
  const architecture = useMemo(pavilionMaterials, []);
  useEffect(() => () => {
    Object.values(architecture.materials).forEach(material => material.dispose());
    architecture.textures.forEach(texture => texture.dispose());
  }, [architecture]);
  return <>
    <Ocean day={day} />
    <Promenade day={day} />
    <StreetLamps day={day} />
    {stations.slice(1).map((s, i) => <Pavilion key={s.id} station={s} index={i + 1} lang={lang} day={day} materials={architecture.materials} />)}
    {[[-36, 5], [-34, -7], [-38, -27], [35, 3], [38, -13], [31, -31], [-21, -35], [18, -36]].map(([x, z], i) => <Palm key={i} x={x} z={z} scale={1 + (i % 3) * .12} turn={i * 2} />)}
    {BOULDERS.map(({ color, ...b }, i) => <mesh key={i} {...b} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color={color} roughness={1} flatShading />
    </mesh>)}
  </>;
}
