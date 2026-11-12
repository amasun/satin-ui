import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpDown, Check, ChevronDown, Minus, Plus, ShoppingBag, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { DemoInput, RollingNumber, Swap, caption, fill, title } from "@/components/kit";
import { typeSteps, useCellActive, useEvery, useSequence } from "@/lib/autoplay";
import { easeOut, pop, spring, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Grinder, PRODUCTS, backdrop, usd, type ProductId } from "@/tiles/shop/art";

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/* ── Cart with quantity steppers ────────────────────────── */

const CART_ORDER: ProductId[] = ["grinder", "dripper", "mug"];
type Line = { id: ProductId; qty: number };

export function Cart() {
  const [lines, setLines] = useState<Line[]>([
    { id: "grinder", qty: 1 },
    { id: "dripper", qty: 2 },
    { id: "mug", qty: 1 },
  ]);
  const setQty = (id: ProductId, delta: number) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.min(9, Math.max(1, l.qty + delta)) } : l)));
  const remove = (id: ProductId) => setLines((ls) => ls.filter((l) => l.id !== id));
  const restore = (id: ProductId, qty = 1) =>
    setLines((ls) =>
      ls.some((l) => l.id === id)
        ? ls
        : [...ls, { id, qty }].sort((a, b) => CART_ORDER.indexOf(a.id) - CART_ORDER.indexOf(b.id)),
    );

  useSequence([
    [1600, () => setQty("mug", 1)],
    [1400, () => setQty("dripper", -1)],
    [1700, () => remove("grinder")],
    [1900, () => restore("grinder")],
    [1500, () => setQty("mug", -1)],
    [1500, () => setQty("dripper", 1)],
  ]);

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * PRODUCTS[l.id].price, 0);

  return (
    <div className={cn(fill, "flex flex-col self-stretch")}>
      <div className="flex items-baseline justify-between px-1 pb-1.5">
        <p className="text-[15px] font-semibold tracking-tight">Your cart</p>
        <p className={caption} aria-live="polite">
          <Swap id={count}>{count === 1 ? "1 item" : `${count} items`}</Swap>
        </p>
      </div>
      <ul className="min-h-0 flex-1">
        <AnimatePresence initial={false} mode="popLayout">
          {lines.map((l) => {
            const p = PRODUCTS[l.id];
            return (
              <motion.li
                key={l.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                transition={spring}
                className="flex h-[50px] items-center gap-2.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl text-foreground" style={backdrop(p.tint, 18)}>
                  <p.Art className="size-9" />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className={cn(caption, "tabular-nums")}>{usd(p.price, false)} each</p>
                </div>
                <div className="flex h-7 shrink-0 items-center rounded-pill bg-card text-card-foreground" role="group" aria-label={`${p.name} quantity`}>
                  <button type="button" aria-label={`Fewer ${p.name}`} disabled={l.qty <= 1} onClick={() => setQty(l.id, -1)} className={cn("grid size-7 place-items-center rounded-full disabled:opacity-30", ring)}>
                    <Minus className="size-3" strokeWidth={3} />
                  </button>
                  <output className="w-4 text-center text-xs font-semibold" aria-live="polite">
                    <RollingNumber value={l.qty} />
                  </output>
                  <button type="button" aria-label={`More ${p.name}`} disabled={l.qty >= 9} onClick={() => setQty(l.id, 1)} className={cn("grid size-7 place-items-center rounded-full disabled:opacity-30", ring)}>
                    <Plus className="size-3" strokeWidth={3} />
                  </button>
                </div>
                <Button variant="ghost" size="icon-xs" aria-label={`Remove ${p.name}`} onClick={() => remove(l.id)} className="text-muted-foreground">
                  <X strokeWidth={2.6} />
                </Button>
              </motion.li>
            );
          })}
          {lines.length < CART_ORDER.length && (
            <motion.li key="undo" layout {...pop} className="flex h-8 items-center justify-between px-1">
              <span className={caption}>{CART_ORDER.length - lines.length} removed</span>
              <Button variant="link" size="sm" className="h-7 px-0" onClick={() => CART_ORDER.forEach((id) => restore(id))}>
                Undo
              </Button>
            </motion.li>
          )}
        </AnimatePresence>
      </ul>
      <div className="flex items-center justify-between border-t border-foreground/8 px-1 pt-2.5">
        <span className={caption}>Subtotal</span>
        <span className="text-[15px] font-semibold">
          <RollingNumber value={subtotal} text={usd(subtotal)} />
        </span>
      </div>
    </div>
  );
}

/* ── Promo code with validation ─────────────────────────── */

type PromoState = "idle" | "ok" | "bad";

export function PromoCode() {
  const id = useId();
  const [code, setCode] = useState("");
  const [state, setState] = useState<PromoState>("idle");
  const [tries, setTries] = useState(0);
  const apply = (value = code) => {
    const ok = value.trim().toUpperCase() === "BREW10";
    setState(ok ? "ok" : "bad");
    if (!ok) setTries((t) => t + 1);
  };
  const edit = (v: string) => {
    setCode(v.toUpperCase());
    setState("idle");
  };

  useSequence([
    ...typeSteps("COFFEE5", edit, 90, 900),
    [700, () => apply("COFFEE5")],
    [1500, () => edit("")],
    ...typeSteps("BREW10", edit, 90, 400),
    [700, () => apply("BREW10")],
    [2200, () => edit("")],
  ]);

  const message = state === "ok" ? "BREW10 applied: 10% off your order" : state === "bad" ? "That code isn't valid" : "";

  return (
    <form
      className={cn(fill, "relative")}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <label htmlFor={id} className="sr-only">
        Promo code
      </label>
      <motion.div animate={tries ? { x: tries % 2 ? [0, -6, 6, -4, 4, 0] : [0, 6, -6, 4, -4, 0] } : undefined} transition={{ duration: 0.35 }} className="flex">
        <DemoInput
          id={id}
          value={code}
          onChange={edit}
          placeholder="Promo code, try BREW10"
          aria-invalid={state === "bad" || undefined}
          aria-describedby={`${id}-msg`}
          className={cn("pr-28 uppercase placeholder:normal-case", state === "ok" && "border-chart-2")}
        />
      </motion.div>
      <div className="absolute inset-y-0 right-1.5 flex items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "ok" ? (
            <motion.span key="ok" {...pop} transition={springBouncy} className="flex items-center gap-1">
              <Badge variant="brand" className="h-7 gap-1 px-2.5 text-xs">
                <Check strokeWidth={3} /> −10%
              </Badge>
              <Button type="button" variant="ghost" size="icon-xs" aria-label="Remove code" onClick={() => edit("")}>
                <X strokeWidth={2.6} />
              </Button>
            </motion.span>
          ) : state === "bad" ? (
            <motion.span key="bad" {...pop} className="pr-2.5 text-xs font-semibold text-destructive">
              Not valid
            </motion.span>
          ) : (
            <motion.span key="apply" {...pop}>
              <Button type="submit" size="sm" disabled={!code.trim()}>
                Apply
              </Button>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p id={`${id}-msg`} className="sr-only" aria-live="polite">
        {message}
      </p>
    </form>
  );
}

/* ── Price range slider ─────────────────────────────────── */

const HISTOGRAM = [3, 5, 8, 12, 15, 11, 14, 18, 13, 9, 11, 8, 6, 7, 5, 4, 6, 3, 2, 3, 2, 1, 2, 1];
const PRICE_MAX = 240;
const RANGE_DEMO: Array<[number, number]> = [
  [40, 120],
  [20, 200],
  [80, 160],
  [10, 90],
  [30, 150],
];

export function PriceRange() {
  const id = useId();
  const demo = useCellActive();
  const [[lo, hi], setRange] = useState<[number, number]>([30, 150]);
  useEvery(2300, (tick) => setRange(RANGE_DEMO[tick % RANGE_DEMO.length]));
  const glide = "[&_[data-slot=slider-range]]:transition-[left,right] [&_[data-slot=slider-range]]:duration-500 [&_[data-slot=slider-range]]:ease-out-expo [&>span]:transition-[left] [&>span]:duration-500 [&>span]:ease-out-expo";

  return (
    <div className="flex w-full min-w-0 items-center gap-4 px-1">
      <div className="w-[104px] shrink-0 leading-tight">
        <p id={id} className={caption}>
          Price
        </p>
        <output className={cn(title, "block whitespace-nowrap")}>
          <RollingNumber value={lo} text={`$${lo}`} /> – <RollingNumber value={hi} text={`$${hi}`} />
        </output>
      </div>
      <div className="min-w-0 flex-1">
        <div aria-hidden className="flex h-5 items-end gap-[3px] px-2.5">
          {HISTOGRAM.map((v, i) => {
            const price = ((i + 0.5) / HISTOGRAM.length) * PRICE_MAX;
            const inside = price >= lo && price <= hi;
            return (
              <span
                key={i}
                className={cn("flex-1 rounded-t-[3px] transition-colors duration-300", inside ? "bg-brand-gradient-v" : "bg-foreground/12")}
                style={{ height: `${(v / 18) * 100}%` }}
              />
            );
          })}
        </div>
        <Slider
          min={0}
          max={PRICE_MAX}
          step={5}
          minStepsBetweenThumbs={4}
          value={[lo, hi]}
          onValueChange={([a, b]) => setRange([a, b])}
          aria-labelledby={id}
          className={cn("h-5", demo && glide)}
        />
      </div>
    </div>
  );
}

/* ── Sort and filter bar ────────────────────────────────── */

const FILTERS = ["Beans", "Gear", "Mugs"];
const SORTS = ["Popular", "Price ↑", "Price ↓", "Newest"];

export function SortFilter() {
  const [on, setOn] = useState(() => new Set(["Gear"]));
  const [sort, setSort] = useState(SORTS[0]);
  const toggle = (f: string) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (!next.delete(f)) next.add(f);
      return next;
    });
  useSequence([
    [1500, () => toggle("Beans")],
    [1500, () => setSort(SORTS[1])],
    [1500, () => toggle("Gear")],
    [1500, () => toggle("Mugs")],
    [1500, () => setSort(SORTS[3])],
    [1500, () => (setOn(new Set(["Gear"])), setSort(SORTS[0]))],
  ]);

  return (
    <div className={cn(fill, "flex items-center gap-2")}>
      <div role="group" aria-label="Filter by category" className="flex min-w-0 flex-1 gap-1.5">
        {FILTERS.map((f) => {
          const active = on.has(f);
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(f)}
              className={cn(
                "flex h-8 items-center gap-1 rounded-pill px-3 text-xs font-semibold transition-colors",
                ring,
                active ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground hover:bg-card/70",
              )}
            >
              <AnimatePresence initial={false}>
                {active && (
                  <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2, ease: easeOut }} className="overflow-hidden">
                    <Check className="size-3" strokeWidth={3.2} />
                  </motion.span>
                )}
              </AnimatePresence>
              {f}
            </button>
          );
        })}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="w-[98px] shrink-0 justify-between px-2" aria-label={`Sort by ${sort}`}>
            <ArrowUpDown className="size-3.5! text-muted-foreground" strokeWidth={2.6} />
            <Swap id={sort} className="flex-1 justify-center">
              {sort}
            </Swap>
            <ChevronDown className="size-3.5! text-muted-foreground" strokeWidth={2.6} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-36">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            {SORTS.map((s) => (
              <DropdownMenuRadioItem key={s} value={s}>
                {s}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ── Product card: hover swap, viewers, fly to cart ─────── */

type Flight = { id: number; from: { x: number; y: number }; to: { x: number; y: number } };

export function ProductCard() {
  const [alt, setAlt] = useState(false);
  const [viewers, setViewers] = useState(12);
  const [inCart, setInCart] = useState(1);
  const [bump, setBump] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLButtonElement>(null);
  const cart = useRef<HTMLButtonElement>(null);
  const next = useRef(0);

  const add = () => {
    const box = root.current?.getBoundingClientRect();
    const a = photo.current?.getBoundingClientRect();
    const b = cart.current?.getBoundingClientRect();
    if (!box || !a || !b) return;
    const sx = box.width / (root.current!.offsetWidth || box.width);
    const center = (r: DOMRect) => ({ x: (r.left + r.width / 2 - box.left) / sx, y: (r.top + r.height / 2 - box.top) / sx });
    setFlights((f) => [...f, { id: next.current++, from: center(a), to: center(b) }]);
  };
  const land = (id: number) => {
    setFlights((f) => f.filter((x) => x.id !== id));
    setInCart((n) => (n >= 9 ? 1 : n + 1));
    setBump((n) => n + 1);
  };

  useSequence([
    [1500, () => setAlt(true)],
    [1300, () => setViewers(14)],
    [1300, () => setAlt(false)],
    [1100, add],
    [1700, () => setViewers(11)],
    [1500, () => setViewers(12)],
  ]);

  return (
    <div ref={root} className="relative flex size-full min-w-0 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <span className={cn(caption, "font-semibold")}>Featured</span>
        <button
          ref={cart}
          type="button"
          aria-label={`Cart, ${inCart} items`}
          className={cn("relative grid size-8 place-items-center rounded-full bg-card text-card-foreground", ring)}
        >
          <motion.span key={bump} className="grid place-items-center" initial={bump ? { scale: 1.35, rotate: -10 } : false} animate={{ scale: 1, rotate: 0 }} transition={springBouncy}>
            <ShoppingBag className="size-3.5" strokeWidth={2.4} />
          </motion.span>
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-gradient px-1 text-[10px] font-bold text-brand-foreground">
            <RollingNumber value={inCart} />
          </span>
        </button>
      </div>

      <button
        ref={photo}
        type="button"
        aria-pressed={alt}
        aria-label="Show the grinder in use"
        onPointerEnter={() => setAlt(true)}
        onPointerLeave={() => setAlt(false)}
        onClick={() => setAlt((v) => !v)}
        className={cn("relative h-[150px] w-full shrink-0 overflow-hidden rounded-2xl transition-colors duration-500", ring)}
        style={backdrop(alt ? "var(--chart-4)" : "var(--chart-1)", alt ? 22 : 14)}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={alt ? "alt" : "main"}
            className="absolute inset-0 grid place-items-center text-foreground"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            {alt ? (
              <Grinder className="h-[118%] w-auto translate-y-[6%] -rotate-12" tint="var(--chart-1)" />
            ) : (
              <Grinder className="h-[84%] w-auto" tint="var(--chart-1)" />
            )}
          </motion.span>
        </AnimatePresence>
        <span className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-pill bg-card/85 px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap text-card-foreground" aria-live="polite">
          <span className="relative flex size-1.5 shrink-0">
            <i className="absolute inset-0 animate-ping rounded-full bg-chart-3/60" />
            <i className="relative size-1.5 rounded-full bg-chart-3" />
          </span>
          <RollingNumber value={viewers} /> people viewing
        </span>
      </button>

      <div className="mt-2.5 min-w-0 flex-1 px-0.5 leading-tight">
        <p className="truncate font-semibold">Hand grinder</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[15px] font-semibold tabular-nums">$64</span>
          <span className={cn(caption, "flex items-center gap-0.5")}>
            <Star className="size-3 fill-chart-4 text-chart-4" strokeWidth={2} /> 4.8
          </span>
        </div>
        <p className={cn(caption, "mt-1 truncate")}>Ceramic burrs, 40 settings</p>
      </div>

      <Button variant="brand" className="w-full" onClick={add}>
        <Plus strokeWidth={2.8} /> Add to cart
      </Button>

      {flights.map((f) => (
          <motion.span
            key={f.id}
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-10 grid size-11 place-items-center rounded-xl text-foreground shadow-float"
            style={backdrop("var(--chart-1)", 30)}
            initial={{ x: f.from.x - 22, y: f.from.y - 22, scale: 1, opacity: 1 }}
            animate={{ x: f.to.x - 22, y: f.to.y - 22, scale: 0.3, opacity: 0.7 }}
            transition={{ x: { duration: 0.7, ease: easeOut }, y: { duration: 0.7, ease: [0.6, -0.4, 0.7, 1] }, scale: { duration: 0.7 }, opacity: { duration: 0.7 } }}
            onAnimationComplete={() => land(f.id)}
          >
            <Grinder className="size-10" tint="var(--chart-1)" />
          </motion.span>
      ))}
    </div>
  );
}
