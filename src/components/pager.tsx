import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent, type WheelEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type Screen = { id: string; label: string; content: ReactNode };

/** Ignore further wheel / swipe input for this long after a switch (trackpads keep sending momentum). */
const COOLDOWN_MS = 900;
/** Wheel distance to travel at a screen's edge before switching, so a stray tick doesn't flip the page. */
const WHEEL_THRESHOLD = 40;
const SWIPE_THRESHOLD = 70;

/** Quiet labels: readable, but a step behind the components they frame. */
const mark = "text-[13px] font-semibold tracking-[-0.01em] whitespace-nowrap text-foreground/60 board:text-[15px]";
const note = "text-xs whitespace-nowrap text-muted-foreground/80 tabular-nums";
/** A strip exactly as tall as the board's own padding, so the labels sit in space that is already there. */
const band = "absolute inset-x-0 flex h-7 items-center justify-between gap-4 px-4 sm:h-8 sm:px-6 board:h-9 board:px-9";

/**
 * A screen with its labels: the kit's name above the board and the screen's
 * theme below. They are placed inside the board's existing padding, so the
 * board keeps its size and position and the page gains no height on desktop.
 * Small screens get a few extra pixels of padding, plus room for the floating bar.
 */
function Stage({ label, page, children }: { label: string; page: string; children: ReactNode }) {
  return (
    <div className="grid min-h-full content-center">
      <div className="relative mx-auto w-full max-w-[1434px] pt-3 pb-[76px] sm:pt-2 sm:pb-[72px] board:py-0">
        <header className={cn(band, "top-0")}>
          <h1 className={mark}>Satin UI</h1>
          <p className={cn(note, "hidden sm:block")}>A component kit on Tailwind CSS and shadcn/ui</p>
        </header>
        <main>{children}</main>
        <footer className={cn(band, "bottom-16 board:bottom-0")}>
          <p className={mark}>{label}</p>
          <p className={note}>{page}</p>
        </footer>
      </div>
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
          <Stage label={screen.label} page={`${String(state.index + 1).padStart(2, "0")} / ${String(screens.length).padStart(2, "0")}`}>
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
