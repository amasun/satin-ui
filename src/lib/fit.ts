import { useSyncExternalStore } from "react";

/**
 * Decides how a screen is laid out for the current window.
 *
 * The 8 x 11 board has one natural size. When the window is large enough the
 * whole composition is scaled to fit, so the page never scrolls; the titles go
 * wherever the window has room to spare: beside the board on wide windows,
 * above and below it on tall ones. Windows too small for that fall back to
 * the reflowing grid, which scrolls.
 *
 * The result is mirrored to `data-layout` on <html>; the `board:` variant in
 * index.css keys off it.
 */

/** Natural size of the board, padding included: 11 rows of 78px, 10 gaps of 14px, 36px padding. */
export const BOARD = { w: 1434, h: 1070 };
/** Room the titles take in each arrangement, at natural size. */
export const SIDE = 104;
export const STACK = { top: 108, bottom: 84 };
/** Kept clear on both sides for the control rail. */
const RAIL = 44;
/** Below this scale 13px text gets too small to read, so the grid reflows instead. */
const MIN_SCALE = 0.62;
const MAX_SCALE = 1.3;

export type Fit = { mode: "flow"; scale: 1 } | { mode: "side" | "stack"; scale: number };

const FLOW: Fit = { mode: "flow", scale: 1 };

function measure(): Fit {
  const width = window.innerWidth - RAIL * 2;
  const height = window.innerHeight;
  const side = Math.min(width / (BOARD.w + SIDE * 2), height / BOARD.h);
  const stack = Math.min(width / BOARD.w, height / (BOARD.h + STACK.top + STACK.bottom));
  const scale = Math.max(side, stack);
  if (scale < MIN_SCALE) return FLOW;
  /* Rounded so sub-pixel resizes don't re-render the page. */
  return { mode: side >= stack ? "side" : "stack", scale: Math.round(Math.min(scale, MAX_SCALE) * 1000) / 1000 };
}

let fit: Fit = FLOW;
const listeners = new Set<() => void>();

function update() {
  const next = measure();
  document.documentElement.dataset.layout = next.mode === "flow" ? "flow" : "board";
  if (next.mode === fit.mode && next.scale === fit.scale) return;
  fit = next;
  listeners.forEach((fn) => fn());
}
update();
window.addEventListener("resize", update);

const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));

export const useFit = () => useSyncExternalStore(subscribe, () => fit);
