import { useSyncExternalStore } from "react";

/**
 * Page-wide settings shared by the control bar and the Appearance tile.
 * One store, so every control showing a setting stays in sync. Lasting
 * choices are saved; `annotate` and `replay` live for the visit only.
 */

export const ACCENTS = ["green", "blue", "orange", "violet"] as const;
export const SPEEDS = [1, 2, 0.5] as const;

export type Settings = {
  theme: "light" | "dark";
  shape: "round" | "soft";
  accent: (typeof ACCENTS)[number];
  /** Multiplier for every demo's pace. */
  speed: (typeof SPEEDS)[number];
  /** Show each tile's name and hold the demos. */
  annotate: boolean;
  /** Bumped to replay the current screen's entrance. */
  replay: number;
};

const SAVED = {
  theme: ["light", "dark"],
  shape: ["round", "soft"],
  accent: ACCENTS,
  speed: SPEEDS,
} as const;

function load<K extends keyof typeof SAVED>(key: K): Settings[K] {
  const allowed = SAVED[key] as readonly (string | number)[];
  try {
    const raw = localStorage.getItem(`bento:${key}`);
    const found = allowed.find((v) => String(v) === raw);
    if (found !== undefined) return found as Settings[K];
  } catch {
    /* Storage can be unavailable (private mode); fall through to the default. */
  }
  return allowed[0] as Settings[K];
}

let state: Settings = {
  theme: load("theme"),
  shape: load("shape"),
  accent: load("accent"),
  speed: load("speed"),
  annotate: false,
  replay: 0,
};

function apply() {
  const root = document.documentElement;
  root.classList.toggle("dark", state.theme === "dark");
  root.style.colorScheme = state.theme;
  root.dataset.shape = state.shape;
  root.dataset.accent = state.accent;
}
apply();

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  if (state[key] === value) return;
  state = { ...state, [key]: value };
  apply();
  if (key in SAVED) {
    try {
      localStorage.setItem(`bento:${key}`, String(value));
    } catch {
      /* The setting still applies for this visit. */
    }
  }
  listeners.forEach((fn) => fn());
}

export function useSetting<K extends keyof Settings>(key: K) {
  const value = useSyncExternalStore(subscribe, () => state[key]);
  return [value, (next: Settings[K]) => setSetting(key, next)] as const;
}

/** The value after `current` in `list`, wrapping around. */
export const nextOf = <T,>(list: readonly T[], current: T) => list[(list.indexOf(current) + 1) % list.length];
