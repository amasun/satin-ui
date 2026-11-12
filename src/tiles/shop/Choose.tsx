import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RollingNumber, SlidingThumb, Swap, caption, fill, title, useLayoutScope } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import { easeOut, pop, spring, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Beans, Kettle, Mug, backdrop } from "@/tiles/shop/art";

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/** Arrow-key roving for a row of options. Returns the next index or null. */
function arrowStep(e: KeyboardEvent, index: number, count: number) {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") return (index + 1) % count;
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") return (index - 1 + count) % count;
  return null;
}

/* ── Product gallery with linked thumbnails ─────────────── */

const VIEWS = [
  { label: "Front", tint: "var(--chart-5)", bg: "var(--chart-4)", art: {} },
  { label: "Side", tint: "var(--chart-5)", bg: "var(--chart-2)", art: { transform: "scaleX(-1)" } },
  { label: "Lid detail", tint: "var(--chart-5)", bg: "var(--chart-1)", art: { transform: "scale(1.9) translateY(14%)" } },
  { label: "Rose finish", tint: "var(--chart-1)", bg: "var(--chart-4)", art: {} },
];

const slide = {
  enter: (dir: number) => ({ x: `${dir * 40}%`, opacity: 0, filter: "blur(6px)" }),
  center: { x: "0%", opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ x: `${dir * -40}%`, opacity: 0, filter: "blur(6px)" }),
};

export function Gallery() {
  const [[index, dir], setView] = useState([0, 1]);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const outline = useLayoutScope("gallery");
  const go = (next: number) => {
    const n = (next + VIEWS.length) % VIEWS.length;
    setView(([cur]) => [n, n >= cur ? 1 : -1]);
  };
  useEvery(2600, () => setView(([cur]) => [(cur + 1) % VIEWS.length, 1]));
  const view = VIEWS[index];

  return (
    <div className="flex size-full min-w-0 flex-col gap-3" role="group" aria-roledescription="carousel" aria-label="Gooseneck kettle photos">
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight">Gooseneck kettle</p>
          <p className={cn(caption, "truncate")}>Pour-over · 0.9 L · stainless</p>
        </div>
        <p className="text-[15px] font-semibold tabular-nums">$89</p>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl transition-colors duration-500" style={backdrop(view.bg, 18)}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: easeOut }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) go(index + 1);
              else if (info.offset.x > 50) go(index - 1);
            }}
            className="absolute inset-0 grid cursor-grab touch-pan-y place-items-center overflow-hidden active:cursor-grabbing"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${VIEWS.length}: ${view.label}`}
          >
            <Kettle tint={view.tint} className="pointer-events-none h-[78%] w-auto text-foreground" style={view.art} />
          </motion.div>
        </AnimatePresence>
        <span className="absolute top-3 left-3 rounded-pill bg-card/80 px-2 py-0.5 text-[11px] font-semibold text-card-foreground" aria-live="polite">
          <Swap id={index}>{view.label}</Swap>
        </span>
        <span className="absolute top-3 right-3 rounded-pill bg-card/80 px-2 py-0.5 text-[11px] font-semibold text-card-foreground tabular-nums">
          {index + 1} / {VIEWS.length}
        </span>
        <Button variant="surface" size="icon-sm" aria-label="Previous photo" className="absolute top-1/2 left-3 -translate-y-1/2" onClick={() => go(index - 1)}>
          <ChevronLeft strokeWidth={2.6} />
        </Button>
        <Button variant="surface" size="icon-sm" aria-label="Next photo" className="absolute top-1/2 right-3 -translate-y-1/2" onClick={() => go(index + 1)}>
          <ChevronRight strokeWidth={2.6} />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Choose photo">
        {VIEWS.map((v, i) => (
          <button
            key={v.label}
            ref={(el) => {
              thumbRefs.current[i] = el;
            }}
            type="button"
            aria-label={v.label}
            aria-current={i === index ? "true" : undefined}
            tabIndex={i === index ? 0 : -1}
            onClick={() => go(i)}
            onKeyDown={(e) => {
              const next = arrowStep(e, i, VIEWS.length);
              if (next === null) return;
              e.preventDefault();
              go(next);
              thumbRefs.current[next]?.focus();
            }}
            className={cn("relative h-14 overflow-hidden rounded-xl transition-opacity", ring, i === index ? "opacity-100" : "opacity-55 hover:opacity-90")}
            style={backdrop(v.bg, 18)}
          >
            <Kettle tint={v.tint} className="mx-auto h-full w-auto py-1.5 text-foreground" style={v.art} />
            {i === index && <motion.span layoutId={outline} aria-hidden className="absolute inset-0 rounded-xl border-2 border-foreground" transition={spring} />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Colour swatches ────────────────────────────────────── */

const COLOURS = [
  { name: "Clay", value: "var(--chart-4)" },
  { name: "Rose", value: "var(--chart-1)" },
  { name: "Sage", value: "var(--chart-2)" },
  { name: "Ember", value: "var(--chart-3)" },
  { name: "Ink", value: "var(--chart-5)" },
];

export function Swatches() {
  const [index, setIndex] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const marker = useLayoutScope("swatch");
  useEvery(1900, () => setIndex((i) => (i + 1) % COLOURS.length));
  const colour = COLOURS[index];

  return (
    <div className={cn(fill, "flex items-center gap-3")}>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl text-foreground transition-[background] duration-500" style={backdrop(colour.value, 18)}>
        <Mug tint={colour.value} className="size-10" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className={cn(caption)}>Colour</p>
        <p className={cn(title, "truncate")} aria-live="polite">
          <Swap id={colour.name}>{colour.name}</Swap>
        </p>
      </div>
      <div role="radiogroup" aria-label="Mug colour" className="flex items-center gap-1.5">
        {COLOURS.map((c, i) => {
          const on = i === index;
          return (
            <button
              key={c.name}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={c.name}
              tabIndex={on ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => {
                const next = arrowStep(e, i, COLOURS.length);
                if (next === null) return;
                e.preventDefault();
                setIndex(next);
                refs.current[next]?.focus();
              }}
              className={cn("relative grid size-7 place-items-center rounded-full", ring)}
            >
              {on && <motion.span layoutId={marker} aria-hidden className="absolute inset-0 rounded-full border-2 border-foreground" transition={spring} />}
              <span className="size-5 rounded-full border border-foreground/10" style={{ background: c.value }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Size picker with a sold-out option ─────────────────── */

const SIZES = [
  { id: "0.6", label: "0.6 L", out: false },
  { id: "0.9", label: "0.9 L", out: false },
  { id: "1.2", label: "1.2 L", out: true },
  { id: "1.5", label: "1.5 L", out: false },
];

export function SizePicker() {
  const [size, setSize] = useState("0.9");
  const [nudge, setNudge] = useState(0);
  const [warned, setWarned] = useState(false);
  const thumb = useLayoutScope("size");
  const pick = (id: string) => {
    if (SIZES.find((s) => s.id === id)?.out) {
      setNudge((n) => n + 1);
      setWarned(true);
    } else {
      setSize(id);
      setWarned(false);
    }
  };
  useSequence([
    [1700, () => pick("1.5")],
    [1500, () => pick("1.2")],
    [1700, () => pick("0.6")],
    [1700, () => pick("0.9")],
  ]);

  return (
    <div className={cn(fill, "flex items-center gap-3")}>
      <div className="w-[64px] shrink-0 leading-tight">
        <p className={caption}>Size</p>
        <p className={cn(title, "truncate")} aria-live="polite">
          <Swap id={warned ? `out-${nudge}` : size}>{warned ? <span className="text-destructive">Sold out</span> : `${size} L`}</Swap>
        </p>
      </div>
      <div role="radiogroup" aria-label="Kettle size" className="grid flex-1 grid-cols-4 gap-1 rounded-pill bg-well p-[3px]">
        {SIZES.map((s) => {
          const on = s.id === size;
          return (
            <motion.button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-disabled={s.out || undefined}
              aria-label={s.out ? `${s.label}, sold out` : s.label}
              onClick={() => pick(s.id)}
              animate={s.out && nudge ? { x: nudge % 2 ? [0, -3, 3, -2, 0] : [0, 3, -3, 2, 0] } : undefined}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative h-8 rounded-[calc(var(--shape-pill)-3px)] text-xs whitespace-nowrap transition-colors",
                ring,
                on ? "font-semibold text-card-foreground" : "text-muted-foreground hover:text-foreground",
                s.out && "cursor-not-allowed text-muted-foreground/60 line-through hover:text-muted-foreground/60",
              )}
            >
              {on && <SlidingThumb id={thumb} />}
              <span className="relative">{s.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Favourite heart with a count ───────────────────────── */

export function Favourite() {
  const [liked, setLiked] = useState(false);
  const [others, setOthers] = useState(2481);
  const [burst, setBurst] = useState(0);
  const toggle = () =>
    setLiked((v) => {
      if (!v) setBurst((b) => b + 1);
      return !v;
    });
  useSequence([
    [1500, () => setOthers((n) => n + 1)],
    [1400, toggle],
    [1800, () => setOthers((n) => n + 2)],
    [1600, toggle],
  ]);
  const count = others + (liked ? 1 : 0);

  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <div className="relative">
        <AnimatePresence>
          {liked && (
            <motion.span key={burst} aria-hidden className="pointer-events-none absolute inset-0" initial="a" animate="b">
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return (
                  <motion.i
                    key={i}
                    className="absolute top-1/2 left-1/2 size-1.5 rounded-full"
                    style={{ background: i % 2 ? "var(--chart-1)" : "var(--chart-4)" }}
                    variants={{ a: { x: "-50%", y: "-50%", opacity: 1, scale: 1 }, b: { x: `calc(-50% + ${Math.cos(a) * 38}px)`, y: `calc(-50% + ${Math.sin(a) * 38}px)`, opacity: 0, scale: 0.4 } }}
                    transition={{ duration: 0.6, ease: easeOut }}
                  />
                );
              })}
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          aria-pressed={liked}
          aria-label="Save to favourites"
          onClick={toggle}
          className={cn("relative grid size-14 place-items-center rounded-full transition-colors", ring, liked ? "bg-chart-1/15" : "bg-card hover:bg-card/70")}
        >
          <motion.span key={liked ? "on" : "off"} className="grid place-items-center" initial={{ scale: liked ? 0.4 : 1 }} animate={{ scale: 1 }} transition={springBouncy}>
            <Heart className={cn("size-6 transition-colors", liked ? "fill-chart-1 text-chart-1" : "text-foreground")} strokeWidth={2.2} />
          </motion.span>
        </button>
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-semibold" aria-live="polite">
          <RollingNumber value={count} text={count.toLocaleString("en-US")} />
        </p>
        <p className={caption}>{liked ? "Saved by you" : "people saved this"}</p>
      </div>
    </div>
  );
}

/* ── Stock and promo badges ─────────────────────────────── */

const STOCK_DEMO = [12, 6, 4, 2, 1, 0];

export function StockBadges() {
  const [stock, setStock] = useState(4);
  useEvery(1500, (tick) => setStock(STOCK_DEMO[tick % STOCK_DEMO.length]));
  const level = stock === 0 ? "out" : stock <= 5 ? "low" : "in";
  const label = level === "out" ? "Sold out" : level === "low" ? `Only ${stock} left` : "In stock";
  const dot = level === "out" ? "bg-muted-foreground" : level === "low" ? "bg-chart-4" : "bg-chart-2";

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="relative w-full">
        <div className={cn("mx-auto grid h-[66px] w-full place-items-center rounded-xl text-foreground transition-opacity", level === "out" && "opacity-50")} style={backdrop("var(--chart-3)", 14)}>
          <Beans className="h-full w-auto py-1" />
        </div>
        <span className="absolute top-1.5 left-1.5 flex gap-1">
          <Badge variant="brand" className="h-[18px] px-1.5 text-[10px] font-bold">−20%</Badge>
          <AnimatePresence>
            {level === "in" && (
              <motion.span {...pop}>
                <Badge className="h-[18px] px-1.5 text-[10px] font-bold">New</Badge>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>
      <Badge variant="outline" className="h-6 gap-1.5 bg-card px-2.5 text-[11px] text-card-foreground" aria-live="polite">
        <i className={cn("size-1.5 shrink-0 rounded-full transition-colors", dot, level === "low" && "animate-pulse")} />
        <Swap id={label}>{label}</Swap>
      </Badge>
      <Button
        size="sm"
        variant={level === "out" ? "surface" : "default"}
        className="w-full"
        onClick={() => setStock((s) => (s === 0 ? 12 : s - 1))}
      >
        <Swap id={level === "out" ? "r" : "b"}>{level === "out" ? "Restock" : "Buy one"}</Swap>
      </Button>
    </div>
  );
}

/* ── Rating distribution ────────────────────────────────── */

const RATINGS = [
  { stars: 5, count: 842 },
  { stars: 4, count: 291 },
  { stars: 3, count: 88 },
  { stars: 2, count: 37 },
  { stars: 1, count: 26 },
];
const TOTAL = RATINGS.reduce((s, r) => s + r.count, 0);
const AVERAGE = RATINGS.reduce((s, r) => s + r.stars * r.count, 0) / TOTAL;

export function Ratings() {
  const [filter, setFilter] = useState<number | null>(null);
  useSequence([
    [1800, () => setFilter(5)],
    [1600, () => setFilter(4)],
    [1600, () => setFilter(1)],
    [1800, () => setFilter(null)],
  ]);
  const shown = filter === null ? TOTAL : RATINGS.find((r) => r.stars === filter)!.count;

  return (
    <div className={cn(fill, "flex items-center gap-4")}>
      <div className="w-[92px] shrink-0">
        <p className="text-[32px] leading-none font-semibold tracking-tight tabular-nums">{AVERAGE.toFixed(1)}</p>
        <div className="mt-1.5 flex gap-0.5" aria-label={`${AVERAGE.toFixed(1)} out of 5 stars`} role="img">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={cn("size-3.5", n <= Math.round(AVERAGE) ? "fill-chart-4 text-chart-4" : "text-foreground/20")} strokeWidth={2} />
          ))}
        </div>
        <p className={cn(caption, "mt-1.5 leading-tight")} aria-live="polite">
          <RollingNumber value={shown} text={shown.toLocaleString("en-US")} /> {filter === null ? "reviews" : `with ${filter}★`}
        </p>
      </div>
      <ul className="min-w-0 flex-1" aria-label="Filter reviews by stars">
        {RATINGS.map((r) => {
          const on = filter === r.stars;
          const dim = filter !== null && !on;
          return (
            <li key={r.stars}>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${r.stars} stars, ${r.count} reviews`}
                onClick={() => setFilter(on ? null : r.stars)}
                className={cn("flex h-[26px] w-full items-center gap-2 rounded-md px-1 text-xs transition-opacity", ring, dim && "opacity-40")}
              >
                <span className="w-3 font-semibold tabular-nums">{r.stars}</span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(r.count / RATINGS[0].count) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: (5 - r.stars) * 0.06, ease: easeOut }}
                  />
                </span>
                <span className="w-8 text-right text-muted-foreground tabular-nums">{Math.round((r.count / TOTAL) * 100)}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
