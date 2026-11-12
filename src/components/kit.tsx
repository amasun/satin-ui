import { useEffect, useId, useRef, useState, type CSSProperties, type ComponentProps, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { CellActiveProvider, useAutoplay, useCellActive } from "@/lib/autoplay";
import type { Person } from "@/lib/data";
import { easeOut, pop, spring } from "@/lib/motion";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

/* Shared text styles */
export const caption = "text-xs text-muted-foreground";
export const title = "text-[13px] font-semibold";
/** Root of a tile's content: fills the tile, capped so wide tiles stay tidy. */
export const fill = "w-full min-w-0 max-w-[400px]";

/* ── Tile ───────────────────────────────────────────────── */

type TileProps = {
  /** Accessible name of the tile. */
  label: string;
  /** Position on the 8-column desktop board (1-based) and size in grid units. */
  col: number;
  row: number;
  w?: 1 | 2 | 3 | 4;
  h?: 1 | 2 | 3 | 4;
  /** `raised` is a white surface with a hairline; `dark` flips the tokens inside. */
  tone?: "plain" | "raised" | "dark";
  className?: string;
  children: ReactNode;
};

/** How long after the pointer / focus leaves before the demo resumes. */
const RESUME_MS = 1600;

export function Tile({ label, col, row, w = 1, h = 1, tone = "plain", className, children }: TileProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const { enabled } = useAutoplay();
  const [annotate] = useSetting("annotate");
  const [held, setHeld] = useState(false);
  const timer = useRef(0);

  const hold = () => {
    window.clearTimeout(timer.current);
    setHeld(true);
  };
  const release = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHeld(false), RESUME_MS);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <CellActiveProvider value={enabled && inView && !held && !annotate}>
      <motion.section
        ref={ref}
        aria-label={label}
        className={cn(
          "relative col-[span_var(--ws)] row-[span_var(--h)] grid min-w-0 place-items-center overflow-hidden rounded-tile p-3.5 text-foreground transition-[background-color,border-color,border-radius] duration-500",
          "sm:col-[span_var(--w)] board:col-[var(--c)/span_var(--w)] board:row-[var(--r)/span_var(--h)]",
          tone === "raised" ? "border border-border bg-card" : "bg-tile",
          tone === "dark" && "dark",
          className,
        )}
        style={{ "--c": col, "--r": row, "--w": w, "--ws": Math.min(w, 2), "--h": h } as CSSProperties}
        initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }}
        whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, delay: 0.05 + (col + row) * 0.035, ease: easeOut }}
        onPointerEnter={hold}
        onPointerLeave={release}
        onFocusCapture={hold}
        onBlurCapture={release}
      >
        {children}
        <AnimatePresence>
          {annotate && (
            <motion.span
              aria-hidden
              className="absolute top-2 left-2 z-10 rounded-pill bg-foreground px-2 py-0.5 text-[10px] leading-4 font-semibold whitespace-nowrap text-background"
              {...pop}
              transition={spring}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.section>
    </CellActiveProvider>
  );
}

/* ── Person avatar ──────────────────────────────────────── */

export function PersonAvatar({ who, className }: { who: Person; className?: string }) {
  return (
    <Avatar className={cn("size-6 text-[11px]", className)} aria-hidden>
      <AvatarFallback className="text-[length:inherit] leading-none text-white" style={{ background: who.color }}>
        {who.name[0]}
      </AvatarFallback>
    </Avatar>
  );
}

/* ── Spinner ────────────────────────────────────────────── */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current/25 border-t-current [animation-duration:0.7s]", className)}
    />
  );
}

/* ── Rolling number ─────────────────────────────────────── */

const rollVariants = {
  enter: (dir: number) => ({ y: `${dir * 70}%`, opacity: 0, filter: "blur(3px)" }),
  center: { y: "0%", opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ y: `${dir * -70}%`, opacity: 0, filter: "blur(3px)" }),
};

/**
 * Renders `text` (defaults to `value`) with each digit sliding in the
 * direction the value moved. Screen readers get the plain text.
 */
export function RollingNumber({ value, text, className }: { value: number; text?: string; className?: string }) {
  const shown = text ?? String(value);
  const state = useRef({ value, dir: 1 });
  if (state.current.value !== value) {
    state.current = { dir: value > state.current.value ? 1 : -1, value };
  }
  const dir = state.current.dir;
  const chars = Array.from(shown);

  return (
    <span className={cn("inline-block tabular-nums", className)}>
      <span className="sr-only">{shown}</span>
      <span aria-hidden className="inline-flex">
        {chars.map((ch, i) => {
          const fromRight = chars.length - i;
          if (!/\d/.test(ch)) return <span key={`s${fromRight}`}>{ch}</span>;
          return (
            <span className="relative inline-block" key={`d${fromRight}`}>
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.span
                  key={ch}
                  className="inline-block will-change-transform"
                  custom={dir}
                  variants={rollVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ ...spring, delay: (fromRight - 1) * 0.025 }}
                >
                  {ch}
                </motion.span>
              </AnimatePresence>
            </span>
          );
        })}
      </span>
    </span>
  );
}

/* ── Swapping text ──────────────────────────────────────── */

/** Cross-fades its content whenever `id` changes. */
export function Swap({ id, children, className }: { id: string | number; children: ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        className={cn("inline-flex items-center", className)}
        initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
        transition={{ duration: 0.22, ease: easeOut }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Demo-aware input ───────────────────────────────────── */

type DemoInputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  /** What the demo layer shows instead of `value` (e.g. bullets for a password). */
  display?: string;
  /** Inline suggestion rendered, muted, right after the typed text. */
  completion?: string;
};

/**
 * A shadcn Input. While the demo types into it (tile active, not focused) a
 * mirrored layer shows the text with a blinking caret, since an unfocused
 * input has none.
 */
export function DemoInput({ value, onChange, className, display, completion, ...rest }: DemoInputProps) {
  const ghost = useCellActive() && value.length > 0;
  const shown = display ?? value;
  return (
    <span className="relative block min-w-0 flex-1">
      <Input
        value={value}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        className={cn(ghost && "text-transparent", className)}
        {...rest}
      />
      {(ghost || completion) && (
        <span aria-hidden className={cn("pointer-events-none absolute inset-0 flex items-center overflow-hidden border border-transparent px-4 text-base whitespace-pre md:text-[13px]", className, "bg-transparent")}>
          {/* When a person is typing, the real input shows the text; this copy only reserves its width. */}
          <span className={cn(!ghost && "invisible")}>{shown}</span>
          {ghost && <i className="ml-px inline-block h-[1.2em] w-[1.5px] shrink-0 animate-caret bg-foreground" />}
          {completion && <span className="text-muted-foreground/70">{completion}</span>}
        </span>
      )}
    </span>
  );
}

/* ── Sliding thumb for segmented controls ───────────────── */

export function useLayoutScope(name: string) {
  return `${name}-${useId()}`;
}

export function SlidingThumb({ id, className }: { id: string; className?: string }) {
  return <motion.span layoutId={id} aria-hidden className={cn("absolute inset-0 rounded-[calc(var(--shape-pill)-3px)] bg-card", className)} transition={spring} />;
}

/* ── Board ──────────────────────────────────────────────── */

/**
 * One screen of tiles: a fixed 8-column composition from the `board`
 * breakpoint up, reflowing to 4 and then 2 columns below it.
 */
export function Board({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      aria-label={label}
      className="mx-auto grid w-full max-w-[1434px] grid-flow-dense auto-rows-[78px] grid-cols-2 gap-3.5 p-4 sm:grid-cols-4 sm:p-6 board:grid-flow-row board:grid-cols-8 board:p-9"
    >
      {children}
    </section>
  );
}
