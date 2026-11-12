import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Person } from "@/lib/data";
import { useLive, useLiveReactions, type ReactionEvent } from "@/lib/live";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** This visitor, wherever the screen shows "you". */
export const ME: Person = { id: "me", name: "You", color: "var(--brand)" };

export const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/** 1284 -> "1.3k" */
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

/** mm:ss, or h:mm:ss past the hour. */
export const clock = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};

/**
 * Follows `value`, but changes at most once every `ms`. Used for polite
 * screen reader announcements of counts that tick many times a second.
 */
export function useCalm<T>(value: T, ms = 5000) {
  const [calm, setCalm] = useState(value);
  const last = useRef(0);
  useEffect(() => {
    const wait = Math.max(0, last.current + ms - Date.now());
    const timer = window.setTimeout(() => {
      last.current = Date.now();
      setCalm(value);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return calm;
}

/** Visually hidden, politely announced, throttled text. */
export function Announce({ children }: { children: string }) {
  const calm = useCalm(children);
  return (
    <span className="sr-only" aria-live="polite">
      {calm}
    </span>
  );
}

/** Small "Demo" / "Live" marker driven by the data source's status. */
export function SourceMarker({ className }: { className?: string }) {
  const status = useLive((s) => s.status);
  const live = status === "live";
  return (
    <span
      className={cn("inline-flex h-5 items-center gap-1 rounded-pill bg-well px-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase", className)}
      title={live ? "Real visitors" : status === "offline" ? "Live data unavailable, showing a simulation" : "Simulated visitors"}
    >
      <i className={cn("size-1.5 rounded-full", live ? "bg-destructive" : "bg-muted-foreground/60")} />
      {live ? "Live" : "Demo"}
    </span>
  );
}

/* ── Floating reactions ─────────────────────────────────── */

/** Most floating elements a layer shows at once; the oldest are dropped. */
export const MAX_FLOATERS = 24;

export type Floater = ReactionEvent & {
  /** Horizontal start, -1…1 of the layer's half width. */
  x: number;
  /** Sideways drift in px over the flight. */
  drift: number;
  scale: number;
  tint: number;
  duration: number;
};

/**
 * Collects reactions accepted by `accept` as floaters. With reduced motion it
 * collects nothing, so only the numbers change.
 */
export function useFloaters(accept: (e: ReactionEvent) => boolean) {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<Floater[]>([]);
  useLiveReactions((e) => {
    if (reduce || !accept(e)) return;
    const floater: Floater = {
      ...e,
      x: (Math.random() * 2 - 1) * (e.mine ? 0.2 : 0.75),
      drift: (Math.random() * 2 - 1) * 34,
      scale: e.mine ? 1.25 : 0.75 + Math.random() * 0.4,
      tint: Math.floor(Math.random() * 3),
      duration: 1.9 + Math.random() * 0.9,
    };
    setItems((list) => [...list, floater].slice(-MAX_FLOATERS));
  });
  const done = (id: number) => setItems((list) => list.filter((f) => f.id !== id));
  return [items, done] as const;
}

/**
 * Decorative layer: each floater rises from `bottom` to the top of the layer.
 * Only transform and opacity animate; no shadows; hidden from screen readers.
 */
export function FloatLayer({
  items,
  done,
  bottom,
  render,
  className,
}: {
  items: Floater[];
  done: (id: number) => void;
  /** Start height in px from the layer's bottom. */
  bottom: number;
  render: (f: Floater) => ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 300, h: 300 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const travel = Math.max(40, size.h - bottom - 8);

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {items.map((f) => (
        <motion.span
          key={f.id}
          className="absolute left-1/2 block will-change-transform"
          style={{ bottom, marginLeft: -12 }}
          initial={{ x: f.x * (size.w / 2 - 16), y: 0, opacity: 0, scale: 0.4 }}
          animate={{
            x: f.x * (size.w / 2 - 16) + f.drift,
            y: -travel,
            opacity: [0, 1, 1, 0],
            scale: [0.4, f.scale, f.scale, f.scale * 0.85],
          }}
          transition={{ duration: f.duration, ease: easeOut, opacity: { duration: f.duration, times: [0, 0.12, 0.65, 1] }, scale: { duration: f.duration, times: [0, 0.15, 0.7, 1] } }}
          onAnimationComplete={() => done(f.id)}
        >
          {render(f)}
        </motion.span>
      ))}
    </div>
  );
}
