import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CalendarDays, Check, Circle, Minus, Moon, Plus, Square, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RollingNumber, SlidingThumb, Swap, caption, fill, title, useLayoutScope } from "@/components/kit";
import { typeSteps, useEvery, useSequence } from "@/lib/autoplay";
import { money } from "@/lib/data";
import { springBouncy } from "@/lib/motion";
import { useSetting, type Settings } from "@/lib/settings";
import { cn } from "@/lib/utils";

/* ── Calendar with a plan for the selected day ──────────── */

const DAY = 86_400_000;
const shortDay = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => startOfDay(new Date(d.getTime() + n * DAY + DAY / 2));

/** Plans are placed relative to today so the board never looks stale. */
const PLANS = [
  { offset: 3, title: "Ramen night at Ava's", time: "7:30 pm" },
  { offset: 0, title: "Coffee with Kai", time: "8:00 am" },
  { offset: 37, title: "Board games at Noor's", time: "7:00 pm" },
  { offset: 44, title: "Rooftop dinner with Juno", time: "9 pm" },
  { offset: 9, title: "Brunch with Theo", time: "11:00 am" },
];

export function PlanCalendar() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const plans = useMemo(() => PLANS.map((p) => ({ ...p, date: addDays(today, p.offset) })), [today]);
  const [selected, setSelected] = useState(plans[0].date);
  const [month, setMonth] = useState(plans[0].date);

  useEvery(2600, (tick) => {
    const next = plans[(tick + 1) % plans.length].date;
    setSelected(next);
    setMonth(next);
  });

  const plan = plans.find((p) => p.date.getTime() === selected.getTime());

  return (
    <div className="flex w-full flex-col gap-2 self-stretch px-1 pt-1.5">
      <Calendar
        mode="single"
        required
        selected={selected}
        onSelect={setSelected}
        month={month}
        onMonthChange={setMonth}
        modifiers={{ past: { before: today }, planned: plans.map((p) => p.date) }}
        modifiersClassNames={{
          past: "[&>button]:text-muted-foreground",
          /* A dot under days that have a plan, so the footer is discoverable. */
          planned: "after:absolute after:bottom-0.5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-brand",
        }}
        className="flex-1"
      />
      <p className="flex h-8 shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-muted px-3 text-xs" aria-live="polite">
        <CalendarDays className="size-3.5 shrink-0" strokeWidth={2.4} />
        <Swap id={selected.getTime()} className={cn("min-w-0 flex-1 truncate", !plan && "text-muted-foreground")}>
          <span className="truncate">
            {plan ? `${plan.title}, ${shortDay.format(selected)} ${plan.time}` : `Nothing planned on ${shortDay.format(selected)} ${selected.getDate()}`}
          </span>
        </Swap>
      </p>
    </div>
  );
}

/* ── Segmented control ──────────────────────────────────── */

const VIEWS = ["Items", "People", "Activity"];

export function ViewSwitch() {
  const [view, setView] = useState(VIEWS[0]);
  const thumb = useLayoutScope("view");
  useEvery(2200, () => setView((v) => VIEWS[(VIEWS.indexOf(v) + 1) % VIEWS.length]));

  return (
    <ToggleGroup
      type="single"
      variant="segment"
      size="lg"
      spacing={0}
      value={view}
      onValueChange={(v) => v && setView(v)}
      aria-label="Show"
      className="w-full max-w-[280px] rounded-pill bg-well p-1"
    >
      {VIEWS.map((v) => (
        <ToggleGroupItem key={v} value={v} className="flex-1 rounded-[calc(var(--shape-pill)-3px)]! px-0">
          {v === view && <SlidingThumb id={thumb} />}
          <span className="relative">{v}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/* ── Steppers ───────────────────────────────────────────── */

const WAYS = 4;
const SHARE_DEMO = [30, 33, 24, 27];

export function ShareStepper() {
  const [share, setShare] = useState(24);
  useEvery(2400, (tick) => setShare(SHARE_DEMO[tick % SHARE_DEMO.length]));

  return (
    <div className={cn(fill, "px-1 text-center")}>
      <p className={caption}>Your share</p>
      <div className="my-1 flex items-center justify-between">
        <Button variant="secondary" size="icon" aria-label="Decrease share" disabled={share <= 3} onClick={() => setShare((s) => Math.max(3, s - 3))}>
          <Minus strokeWidth={2.6} />
        </Button>
        <output className="text-[46px] leading-[1.15] font-semibold tracking-[-0.035em]">
          <RollingNumber value={share} text={money(share)} />
        </output>
        <Button variant="secondary" size="icon" aria-label="Increase share" onClick={() => setShare((s) => s + 3)}>
          <Plus strokeWidth={2.6} />
        </Button>
      </div>
      <p className={caption}>
        Split {WAYS} ways, ${share * WAYS} total
      </p>
    </div>
  );
}

export function PeopleStepper() {
  const [count, setCount] = useState(4);
  useEvery(2800, () => setCount((c) => (c === 4 ? 5 : 4)));

  return (
    <div className={cn(fill, "text-center")}>
      <p className={title}>People</p>
      <p className={caption}>at the table</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <Button variant="surface" size="icon-sm" aria-label="Fewer people" disabled={count <= 2} onClick={() => setCount((c) => Math.max(2, c - 1))}>
          <Minus strokeWidth={2.8} />
        </Button>
        <output className="min-w-5 text-[28px] leading-none font-semibold">
          <RollingNumber value={count} />
        </output>
        <Button variant="surface" size="icon-sm" aria-label="More people" disabled={count >= 9} onClick={() => setCount((c) => Math.min(9, c + 1))}>
          <Plus strokeWidth={2.8} />
        </Button>
      </div>
    </div>
  );
}

/* ── Appearance: theme and corner style for the whole page ── */

const THEMES: Array<{ id: Settings["theme"]; label: string; Icon: typeof Sun }> = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
];
const SHAPES: Array<{ id: Settings["shape"]; label: string; Icon: typeof Sun }> = [
  { id: "round", label: "Round", Icon: Circle },
  { id: "soft", label: "Soft", Icon: Square },
];

function IconSegments<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: T; label: string; Icon: typeof Sun }>;
  value: T;
  onChange: (value: T) => void;
}) {
  const thumb = useLayoutScope(label);
  return (
    <ToggleGroup
      type="single"
      variant="segment"
      spacing={0}
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      className="mx-auto rounded-pill bg-well p-[3px]"
    >
      {options.map(({ id, label: name, Icon }) => (
        <ToggleGroupItem key={id} value={id} aria-label={name} title={name} className="h-7 w-10 rounded-[calc(var(--shape-pill)-3px)]! px-0">
          {id === value && <SlidingThumb id={thumb} />}
          <Icon className="relative size-3.5!" strokeWidth={2.4} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function Appearance() {
  const [theme, setTheme] = useSetting("theme");
  const [shape, setShape] = useSetting("shape");
  const summary = `${theme === "dark" ? "Dark" : "Light"}, ${shape === "soft" ? "soft" : "round"}`;

  return (
    <div className={cn(fill, "text-center")}>
      <p className={title}>Appearance</p>
      <p className={caption}>
        <Swap id={summary}>{summary}</Swap>
      </p>
      <div className="mt-2.5 grid gap-1.5">
        <IconSegments label="Theme" options={THEMES} value={theme} onChange={setTheme} />
        <IconSegments label="Corners" options={SHAPES} value={shape} onChange={setShape} />
      </div>
    </div>
  );
}

/* ── One-time code ──────────────────────────────────────── */

const OTP_LENGTH = 6;

export function VerifyCode() {
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);

  useSequence([...typeSteps("481729", setCode, 260, 900), [2600, () => {}]]);

  useEffect(() => {
    if (code.length < OTP_LENGTH) return;
    const ok = window.setTimeout(() => setVerified(true), 450);
    const reset = window.setTimeout(() => {
      setVerified(false);
      setCode("");
    }, 2100);
    return () => {
      window.clearTimeout(ok);
      window.clearTimeout(reset);
    };
  }, [code]);

  return (
    <div className="grid h-11 place-items-center">
      <AnimatePresence mode="wait" initial={false}>
        {verified ? (
          <motion.span
            key="ok"
            role="status"
            className="grid size-11 place-items-center rounded-full bg-brand-gradient text-brand-foreground"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={springBouncy}
          >
            <Check className="size-5" strokeWidth={3} />
            <span className="sr-only">Code verified</span>
          </motion.span>
        ) : (
          <motion.div
            key="slots"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
            transition={{ duration: 0.22 }}
          >
            <InputOTP maxLength={OTP_LENGTH} pattern={REGEXP_ONLY_DIGITS} value={code} onChange={setCode} aria-label="Verification code">
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
