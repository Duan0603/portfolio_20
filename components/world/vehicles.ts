import type { L } from "@/lib/data";

/**
 * What the visitor can drive, the first being the default. The three cars are
 * other people's models, used under CC BY 4.0 and credited where they
 * are chosen (see public/models/CREDITS.md); each also has a simple built shape
 * that stands in while its model loads.
 */
export type Vehicle = {
  id: "lamborghini" | "porsche" | "ferrari";
  name: L;
  /** top speed and pull, as a multiple of the base figures in game.ts */
  pace: number;
  paint: string;
  /** half the wheelbase, half the track, wheel radius */
  axle: number;
  track: number;
  wheel: number;
  /** a detailed model to show in place of the built shape, and who made it */
  model?: string;
  credit?: { title: string; author: string; url: string };
  /** how long the model should stand, and a turn if its nose points the other way */
  length?: number;
  turn?: number;
  /** one of the model's materials given a different colour, so the car shows on a dark floor */
  repaint?: { material: string; color: string };
};

export const vehicles: Vehicle[] = [
  {
    id: "lamborghini",
    name: { vi: "Lamborghini Huracán GT3", en: "Lamborghini Huracán GT3" },
    pace: 1.22,
    paint: "#2fae3a",
    axle: 0.74,
    track: 0.6,
    wheel: 0.27,
    model: "/models/lamborghini/scene.glb",
    length: 2.7,
    credit: { title: "Lamborghini Huracan GT3 - Squadra Corse SDC", author: "SDC", url: "https://sketchfab.com/3Duae" },
  },
  {
    id: "porsche",
    name: { vi: "Porsche 911 Turbo 1975", en: "Porsche 911 Turbo 1975" },
    pace: 1.12,
    paint: "#cdd3db",
    axle: 0.7,
    track: 0.58,
    wheel: 0.27,
    model: "/models/porsche/scene.gltf",
    length: 2.6,
    repaint: { material: "Material.001", color: "#c3c9d2" },
    credit: {
      title: "Porsche 911 (930) Turbo 1975",
      author: "Lexyc16",
      url: "https://sketchfab.com/3d-models/porsche-911-930-turbo-1975-de1ffd344c41481892511f7fd332c136",
    },
  },
  {
    id: "ferrari",
    name: { vi: "Ferrari F40", en: "Ferrari F40" },
    pace: 1.28,
    paint: "#c8201f",
    axle: 0.76,
    track: 0.6,
    wheel: 0.27,
    model: "/models/ferrari/scene.gltf",
    length: 2.7,
    credit: {
      title: "Ferrari F40 | www.vecarz.com",
      author: "Nic Cheung",
      url: "https://sketchfab.com/3d-models/ferrari-f40-wwwvecarzcom-ee082e412b0a4b2090e8492117841e95",
    },
  },
];

export const vehicleById = (id: string | null) => vehicles.find((v) => v.id === id) ?? vehicles[0];
