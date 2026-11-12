import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent, type WheelEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BOARD_WIDTH, useTitleGutter } from "@/lib/fit";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type Screen = { id: string; label: string; content: ReactNode };

/** Ignore further wheel / swipe input for this long after a switch (trackpads keep sending momentum). */
const COOLDOWN_MS = 900;
/** Wheel distance to travel at a screen's edge before switching, so a stray tick doesn't flip the page. */
const WHEEL_THRESHOLD = 40;
const SWIPE_THRESHOLD = 70;

/** Display type that reads as a tint of the page rather than as text. */
const faint = "font-semibold whitespace-nowrap text-foreground/[0.07] select-none dark:text-foreground/[0.09]";
const note = "text-xs whitespace-nowrap text-muted-foreground/80 tabular-nums";
const tagline = "A component kit on Tailwind CSS and shadcn/ui";

/** Same width and gutters as `Board`, so the titles line up with the tiles. */
const frame = "mx-auto w-full max-w-[1434px] px-4 sm:px-6 board:px-9";

/**
 * A screen with its titles: the kit's name and the screen's theme, large and
 * faint. The board is left exactly as it is; only the text moves.
 */
function Stage({ gutter, label, page, children }: { gutter: number; label: string; page: string; children: ReactNode }) {
  /* Wide window: the titles run vertically in the margins beside the board and add no height. */
  if (gutter > 0) {
    return (
      <div className="grid min-h-full grid-cols-[auto_auto_auto] content-center justify-center">
        <header className="flex flex-col items-end justify-between py-9" style={{ width: gutter }}>
          <p className={cn(note, "[writing-mode:vertical-rl]")}>{tagline}</p>
          <h1
            className={cn(faint, "rotate-180 leading-[0.8] tracking-[-0.055em] [writing-mode:vertical-rl]")}
            style={{ fontSize: gutter * 1.08, marginRight: gutter * -0.2 }}
          >
            Satin UI
          </h1>
        </header>
        <main style={{ width: BOARD_WIDTH }}>{children}</main>
        <footer className="flex flex-col items-start justify-between py-9" style={{ width: gutter }}>
          <p
            className={cn(faint, "leading-[0.85] tracking-[-0.045em] [writing-mode:vertical-rl]")}
            style={{ fontSize: gutter * 0.73, marginLeft: gutter * -0.12 }}
          >
            {label}
          </p>
          <p className={cn(note, "[writing-mode:vertical-rl]")}>{page}</p>
        </footer>
      </div>
    );
  }

  /* Otherwise the name sits above the board and the theme below, aligned to its edges. */
  return (
    <div className="grid min-h-full content-center">
      <header className={cn(frame, "-mb-1 flex items-end justify-between gap-6 pt-7 board:-mb-5 board:pt-9")}>
        <h1 className={cn(faint, "text-[clamp(3rem,10vw,7.5rem)] leading-[0.82] tracking-[-0.055em]")}>Satin UI</h1>
        <p className={cn(note, "hidden pb-1 sm:block")}>{tagline}</p>
      </header>
      <main>{children}</main>
      {/* Extra room at the foot on small screens clears the floating control bar. */}
      <footer className={cn(frame, "-mt-1 flex items-start justify-between gap-6 pb-24 board:-mt-5 board:pb-9")}>
        <p className={cn(note, "pt-1")}>{page}</p>
        <p className={cn(faint, "text-right text-[clamp(1.75rem,5.6vw,4.25rem)] leading-[0.9] tracking-[-0.045em]")}>{label}</p>
      </footer>
    </div>
  );
}

const variants = {
  enter: (dir: number) => ({ opacity: 0, y: dir * 64, scale: 0.985, filter: "blur(10px)" }),
  center: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ opacity: 0, y: dir * -64, scale: 0.985, filter: "blur(10px)" }),
};

/** True if something between `target` and `root` can still scroll in the wheel's direction. */
function innerCanScroll(target: Element, root: Element, dir: number) {
  for (let el: Element | null = target; el && el !== root; el = el.parentElement) {
    if (el.scrollHeight <= el.clientHeight + 1) continue;
    const overflow = getComputedStyle(el).overflowY;
    if (overflow !== "auto" && overflow !== "scroll") continue;
    if (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
  }
  return false;
}

/**
 * Shows one screen at a time. Scrolling past the end of a screen (wheel,
 * swipe, PageDown) hides it and brings in the next; a screen taller than the
 * viewport scrolls normally first. `rail` renders next to the page dots.
 */
export function ScreenPager({ screens, rail }: { screens: Screen[]; rail?: ReactNode }) {
  const [state, setState] = useState({ index: 0, dir: 1 });
  const scroller = useRef<HTMLDivElement>(null);
  const lockedUntil = useRef(0);
  const travelled = useRef(0);
  const touchY = useRef<number | null>(null);

  const current = useRef(0);

  const go = useCallback(
    (to: number) => {
      const index = Math.max(0, Math.min(screens.length - 1, to));
      if (index === current.current) return;
      const dir = index > current.current ? 1 : -1;
      current.current = index;
      lockedUntil.current = performance.now() + COOLDOWN_MS;
      travelled.current = 0;
      setState({ index, dir });
    },
    [screens.length],
  );
  const step = useCallback((dir: number) => go(current.current + dir), [go]);

  /** Whether the current screen has no more room to scroll in `dir`. */
  const atEdge = (dir: number) => {
    const el = scroller.current;
    if (!el) return false;
    return dir > 0 ? el.scrollTop + el.clientHeight >= el.scrollHeight - 2 : el.scrollTop <= 1;
  };

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || !e.deltaY) return;
    const dir = Math.sign(e.deltaY);
    const root = scroller.current;
    /* Portalled overlays bubble here through React; leave their scrolling alone. */
    if (!root || !(e.target instanceof Element) || !root.contains(e.target)) return;
    if (performance.now() < lockedUntil.current || !atEdge(dir) || innerCanScroll(e.target, root, dir)) {
      travelled.current = 0;
      return;
    }
    travelled.current += Math.abs(e.deltaY);
    if (travelled.current >= WHEEL_THRESHOLD) step(dir);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchY.current === null) return;
    const delta = touchY.current - e.changedTouches[0].clientY;
    touchY.current = null;
    const dir = Math.sign(delta);
    if (Math.abs(delta) < SWIPE_THRESHOLD || performance.now() < lockedUntil.current) return;
    if (atEdge(dir)) step(dir);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable], [role=dialog], [role=alertdialog]");
      if (typing) return;
      if (e.key === "PageDown") (e.preventDefault(), step(1));
      if (e.key === "PageUp") (e.preventDefault(), step(-1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const screen = screens[state.index];
  const gutter = useTitleGutter();

  return (
    <div className="relative h-dvh overflow-hidden" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AnimatePresence initial={false} custom={state.dir}>
        <motion.div
          key={screen.id}
          /* The outgoing screen unmounts after the incoming one mounts; ignore its null so it can't clear the ref. */
          ref={(el) => {
            if (el) scroller.current = el;
          }}
          custom={state.dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: easeOut }}
          className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Stage gutter={gutter} label={screen.label} page={`${String(state.index + 1).padStart(2, "0")} / ${String(screens.length).padStart(2, "0")}`}>
            {screen.content}
          </Stage>
        </motion.div>
      </AnimatePresence>

      {/* Floats over the content, so it is one of the few places that carries elevation. */}
      <nav
        aria-label="Screens"
        className={cn(
          "fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-pill bg-card p-1 text-card-foreground shadow-float",
          "board:top-1/2 board:right-1.5 board:bottom-auto board:left-auto board:translate-x-0 board:-translate-y-1/2 board:flex-col board:bg-transparent board:p-0 board:shadow-none",
        )}
      >
        {screens.map((s, i) => {
          const on = i === state.index;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={s.label}
              aria-current={on ? "page" : undefined}
              title={s.label}
              className="group grid size-7 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              onClick={() => go(i)}
            >
              <span
                className={cn(
                  "rounded-full transition-all duration-300 ease-out-expo",
                  on ? "h-2 w-5 bg-foreground board:h-5 board:w-2" : "size-2 bg-foreground/25 group-hover:bg-foreground/50",
                )}
              />
            </button>
          );
        })}
        {rail}
      </nav>
      <span role="status" className="sr-only">
        {screen.label}, screen {state.index + 1} of {screens.length}
      </span>
    </div>
  );
}
