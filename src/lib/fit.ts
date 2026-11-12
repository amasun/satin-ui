import { useSyncExternalStore } from "react";

/**
 * Decides where a screen's titles go. The board itself is never resized or
 * moved by this; only the text around it changes.
 *
 * On a window wide enough to leave a margin on both sides of the board, the
 * titles run vertically in those margins and add no height to the page.
 * Otherwise they sit above and below the board.
 */

/** Width of the 8-column board, padding included (matches `Board` in kit.tsx). */
export const BOARD_WIDTH = 1434;
/** Kept clear on both sides for the control rail. */
const RAIL = 44;
/** Narrowest margin in which vertical titles still read well. */
const MIN_GUTTER = 56;
const MAX_GUTTER = 104;

/** `gutter` is the width of each side margin in px; 0 means the titles stack. */
function measure() {
  const gutter = Math.floor((window.innerWidth - RAIL * 2 - BOARD_WIDTH) / 2);
  return gutter >= MIN_GUTTER ? Math.min(gutter, MAX_GUTTER) : 0;
}

let gutter = measure();
const listeners = new Set<() => void>();

window.addEventListener("resize", () => {
  const next = measure();
  if (next === gutter) return;
  gutter = next;
  listeners.forEach((fn) => fn());
});

const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));

export const useTitleGutter = () => useSyncExternalStore(subscribe, () => gutter);
