import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PersonAvatar, RollingNumber, SlidingThumb, Swap, caption, fill, title, useLayoutScope } from "@/components/kit";
import { useEvery } from "@/lib/autoplay";
import { money, people } from "@/lib/data";
import { spring, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Select with a live breakdown ───────────────────────── */

const TOTAL = 96;
const SPLITS = [
  { id: "even", label: "Evenly", shares: [24, 24, 24, 24] },
  { id: "item", label: "By item", shares: [31, 22, 18, 25] },
  { id: "share", label: "By share", shares: [36, 24, 24, 12] },
  { id: "percent", label: "Percent", shares: [38.4, 28.8, 19.2, 9.6] },
];

/**
 * A real select: the menu opens on demand. The rows underneath show what the
 * choice does, which is more useful than a permanently open list.
 */
export function SplitSelect() {
  const id = useId();
  const [value, setValue] = useState(SPLITS[0].id);
  const split = SPLITS.find((s) => s.id === value) ?? SPLITS[0];
  useEvery(2200, () => setValue((v) => SPLITS[(SPLITS.findIndex((s) => s.id === v) + 1) % SPLITS.length].id));

  return (
    <div className={cn(fill, "self-start pt-2.5")}>
      <Label htmlFor={id} className="mb-2.5 px-1 text-[13px] font-semibold">
        Split by
      </Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SPLITS.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ul className="mt-3 px-1" aria-live="polite">
        {people.slice(0, 4).map((p, i) => (
          <li key={p.id} className="flex h-[38px] items-center gap-2 border-b border-foreground/8">
            <PersonAvatar who={p} className="size-5 text-[10px]" />
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            <RollingNumber value={split.shares[i]} text={money(split.shares[i])} className="text-xs text-muted-foreground" />
          </li>
        ))}
        <li className="flex h-[38px] items-center justify-between font-semibold">
          <span>Total</span>
          <span>{money(TOTAL)}</span>
        </li>
      </ul>
    </div>
  );
}

/* ── Multi-select chips ─────────────────────────────────── */

const DISHES = ["Ramen", "Gyoza", "Drinks", "Mochi"];
const CHIP_DEMO = [1, 0, 3, 2, 0, 1, 3, 2];

export function Chips() {
  const [picked, setPicked] = useState(["Drinks", "Mochi"]);
  useEvery(1300, (tick) => {
    const dish = DISHES[CHIP_DEMO[tick % CHIP_DEMO.length]];
    setPicked((prev) => (prev.includes(dish) ? prev.filter((d) => d !== dish) : [...prev, dish]));
  });

  return (
    <div className={cn(fill, "@container flex justify-center")}>
      <ToggleGroup type="multiple" variant="chip" spacing={1.5} value={picked} onValueChange={setPicked} aria-label="What did you have?">
        {DISHES.map((dish) => {
          const on = picked.includes(dish);
          return (
            <ToggleGroupItem key={dish} value={dish} className="gap-0 overflow-hidden px-[0.9em] text-[clamp(11px,4.1cqw,12.5px)]">
              <AnimatePresence initial={false}>
                {on && (
                  <motion.span
                    key="check"
                    className="grid place-items-center overflow-hidden"
                    initial={{ opacity: 0, width: 0, marginRight: 0 }}
                    animate={{ opacity: 1, width: 12, marginRight: 4 }}
                    exit={{ opacity: 0, width: 0, marginRight: 0 }}
                    transition={spring}
                  >
                    <Check className="size-3!" strokeWidth={3.2} />
                  </motion.span>
                )}
              </AnimatePresence>
              {dish}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}

/* ── Radio cards ────────────────────────────────────────── */

const MODES = [
  { id: "even", label: "Split evenly", hint: "$24.00 each" },
  { id: "item", label: "By item", hint: "Pay what you ate" },
  { id: "custom", label: "Custom", hint: "Set amounts" },
];

export function SplitMode() {
  const id = useId();
  const [value, setValue] = useState(MODES[0].id);
  const highlight = useLayoutScope("mode");
  useEvery(2400, () => setValue((v) => MODES[(MODES.findIndex((m) => m.id === v) + 1) % MODES.length].id));

  return (
    <RadioGroup value={value} onValueChange={setValue} aria-label="How to split" className={cn(fill, "gap-1.5")}>
      {MODES.map((mode) => (
        <label
          key={mode.id}
          htmlFor={`${id}-${mode.id}`}
          className="relative flex h-[42px] cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl bg-card px-3 text-card-foreground"
        >
          {mode.id === value && <SlidingThumb id={highlight} className="rounded-xl bg-brand-soft" />}
          <RadioGroupItem id={`${id}-${mode.id}`} value={mode.id} />
          <span className="relative flex-1 font-semibold">{mode.label}</span>
          <span className={cn(caption, "relative whitespace-nowrap")}>{mode.hint}</span>
        </label>
      ))}
    </RadioGroup>
  );
}

/* ── Star rating ────────────────────────────────────────── */

const VERDICTS = ["Tap to rate", "Not great", "Could be better", "Pretty good", "Really good", "Loved it"];
const RATING_DEMO = [4, 1, 3, 5, 2];

export function Rating() {
  const [value, setValue] = useState(4);
  const [hover, setHover] = useState<number | null>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  useEvery(2100, (tick) => setValue(RATING_DEMO[(tick + 1) % RATING_DEMO.length]));

  const shown = hover ?? value;
  const onKeyDown = (e: KeyboardEvent) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = Math.max(1, Math.min(5, value + delta));
    setValue(next);
    refs.current[next - 1]?.focus();
  };

  return (
    <div className={cn(fill, "text-center")}>
      <p className={title}>How was dinner?</p>
      <p className={caption} aria-live="polite">
        <Swap id={shown}>{VERDICTS[shown]}</Swap>
      </p>
      <div role="radiogroup" aria-label="Rating" className="mt-2.5 flex justify-center" onPointerLeave={() => setHover(null)} onKeyDown={onKeyDown}>
        {Array.from({ length: 5 }, (_, i) => {
          const on = i < shown;
          return (
            <button
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={value === i + 1}
              aria-label={`${i + 1} star${i ? "s" : ""}`}
              tabIndex={value === i + 1 || (value === 0 && i === 0) ? 0 : -1}
              className={cn(
                "grid h-8 w-[23px] place-items-center rounded-md transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                on ? "text-brand" : "text-foreground/15",
              )}
              onClick={() => setValue(i + 1)}
              onPointerEnter={() => setHover(i + 1)}
            >
              <motion.span
                className="grid place-items-center"
                animate={{ scale: on ? 1 : 0.82, rotate: on ? 0 : -8 }}
                transition={{ ...springBouncy, delay: on ? i * 0.04 : 0 }}
              >
                <Star className="size-[17px] fill-current" strokeWidth={0} />
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
