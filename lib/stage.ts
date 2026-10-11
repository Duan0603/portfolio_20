/**
 * Shared between the DOM and the WebGL atelier, which renders in its own
 * React root. The page registers the elements the monolith docks to; the
 * scene reads their rects each frame.
 */
export const stage = {
  /** the column beside the skill layers that the split slabs sit in */
  anchor: null as HTMLElement | null,
  /** one marker per skill layer, top of the stack first */
  rows: [] as (HTMLElement | null)[],
  /** index of the layer under attention, -1 for none */
  active: -1,
  /** where the reassembled monolith comes to rest beside the contact invitation */
  finale: null as HTMLElement | null,
};
