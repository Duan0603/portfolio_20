import { projects } from "./data";

/** Featured projects get a face of the monolith each. */
export const featured = projects.filter((p) => p.highlights);
export const rest = projects.filter((p) => !p.highlights);

/** One face per chapter: name, each featured project, repo index, profile, skills, contact. */
export const SIDES = featured.length + 5;
/** The skills face is cut into strips: a heading strip plus one per skill group. */
export const SLABS = 7;
/** Vertical field of view shared by the WebGL camera and the CSS perspective. */
export const FOV = 42;

/**
 * Shared between the DOM walk and the WebGL atelier, which renders in its own
 * React root. The walk measures the CSS prism (in pixels) and publishes it
 * here every frame; the scene builds the obsidian column to the same numbers,
 * so the HTML on each face sits exactly on the glass.
 */
export const stage = {
  /** false while the page is the flat, stacked fallback */
  solid: false,
  /** CSS perspective distance, px */
  P: 0,
  /** apothem of the prism (centre to face), px */
  R: 0,
  /** face height, px */
  H: 0,
  /** prism centre below the viewport centre, px */
  oy: 0,
  /** current turn about the vertical axis, radians */
  angle: 0,
  /** 0 → one solid column, 1 → cut into slabs on the skills face */
  split: 0,
  /** seam between slabs when fully split, px */
  gap: 0,
  /** strip under attention on the skills face, -1 for none */
  active: -1,
};
