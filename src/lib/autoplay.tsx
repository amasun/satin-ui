import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSetting } from "@/lib/settings";

/**
 * Autoplay drives the looping demos. It is layered:
 *  - a global switch (user toggle, tab visibility, prefers-reduced-motion)
 *  - a per-cell switch (in view, and not being hovered / focused by the user)
 * Components never own timers for their demo; they declare steps with
 * `useSequence` / `useEvery` and the scheduler pauses and resumes them.
 */

type Global = { on: boolean; enabled: boolean; toggle: () => void };

const GlobalContext = createContext<Global>({ on: true, enabled: true, toggle: () => {} });
const CellActiveContext = createContext(false);

export function AutoplayProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const toggle = useCallback(() => setOn((v) => !v), []);
  const value = useMemo(() => ({ on, enabled: on && visible, toggle }), [on, visible, toggle]);

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export const useAutoplay = () => useContext(GlobalContext);
export const CellActiveProvider = CellActiveContext.Provider;
/** True while the surrounding cell's demo is allowed to run. */
export const useCellActive = () => useContext(CellActiveContext);

export type Step = readonly [delayMs: number, run: () => void];

/** Runs steps in a loop: wait `delayMs`, call `run`, move on. Pauses with the cell. */
export function useSequence(steps: readonly Step[]) {
  const active = useCellActive();
  const [speed] = useSetting("speed");
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const index = useRef(0);

  useEffect(() => {
    if (!active) return;
    let timer = 0;
    const schedule = () => {
      const list = stepsRef.current;
      if (list.length === 0) return;
      const [delay, run] = list[index.current % list.length];
      timer = window.setTimeout(() => {
        run();
        index.current = (index.current + 1) % stepsRef.current.length;
        schedule();
      }, delay / speed);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [active, speed]);
}

/** Calls `run(tick)` every `ms` while the cell's demo is active. */
export function useEvery(ms: number, run: (tick: number) => void) {
  const tick = useRef(0);
  useSequence([[ms, () => run(tick.current++)]]);
}

/** Steps that type `text` one character at a time through `set`. */
export function typeSteps(
  text: string,
  set: (value: string) => void,
  speed = 70,
  lead = 500,
): Step[] {
  return Array.from(text, (_, i) => [i === 0 ? lead : speed, () => set(text.slice(0, i + 1))] as const);
}
