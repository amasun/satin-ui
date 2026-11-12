import { useEffect, useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PersonAvatar, RollingNumber, caption, fill } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import { person } from "@/lib/data";
import { pop, springBouncy, springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function PlayPause({ playing, className }: { playing: boolean; className?: string }) {
  const Icon = playing ? Pause : Play;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={String(playing)} className="grid place-items-center" {...pop}>
        <Icon className={cn("size-3.5 fill-current", className)} strokeWidth={0} />
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Voice note player ──────────────────────────────────── */

const DURATION = 12;
const BARS = [30, 52, 38, 70, 46, 88, 34, 62, 78, 42, 96, 56, 28, 48, 74, 36, 58, 44, 26, 52, 66, 32, 84, 40, 30, 60, 36, 50, 24, 42];

export function VoiceNote() {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const ava = person("ava");

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setTime((s) => Math.min(DURATION, s + 0.1)), 100);
    return () => window.clearInterval(t);
  }, [playing]);

  useEffect(() => {
    if (time < DURATION) return;
    setPlaying(false);
    setTime(0);
  }, [time]);

  useEvery(1800, () => setPlaying(true));

  const clamp = (s: number) => Math.max(0, Math.min(DURATION - 0.1, s));
  const seek = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    setTime(clamp(((e.clientX - box.left) / box.width) * DURATION));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    setTime((s) => clamp(s + delta));
  };

  const head = (time / DURATION) * BARS.length;

  return (
    <div className={cn(fill, "px-1.5 py-1")}>
      <header className="flex items-center gap-2.5">
        <PersonAvatar who={ava} className="size-7.5 text-sm" />
        <div>
          <p className="font-semibold">{ava.name}</p>
          <p className={caption}>Voice note in Ramen night</p>
        </div>
      </header>
      <div className="mt-4 flex items-center gap-3">
        <Button size="icon-lg" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
          <PlayPause playing={playing} />
        </Button>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={DURATION}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${clock(time)} of ${clock(DURATION)}`}
          className="flex h-[30px] flex-1 cursor-pointer touch-none items-center justify-between rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          onPointerDown={seek}
          onKeyDown={onKeyDown}
        >
          {BARS.map((h, i) => {
            const near = playing && Math.abs(i + 0.5 - head) < 1.5;
            return (
              <motion.i
                key={i}
                className={cn("pointer-events-none w-[3px] rounded-full transition-colors", i < head ? "bg-brand-gradient-v" : "bg-foreground/20")}
                animate={{ height: `${near ? Math.min(100, h * 1.35) : h}%` }}
                transition={springBouncy}
              />
            );
          })}
        </div>
        <span className={cn(caption, "w-7 text-right tabular-nums")}>{clock(time > 0 ? time : DURATION)}</span>
      </div>
    </div>
  );
}

/* ── Upload progress ────────────────────────────────────── */

const SIZE_MB = 2.4;

export function Upload() {
  const [progress, setProgress] = useState(0.2);
  const done = progress >= 1;

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setProgress((p) => Math.min(1, p + 0.05 + Math.random() * 0.09)), 170);
    return () => window.clearTimeout(t);
  }, [progress, done]);

  useEvery(2600, () => setProgress((p) => (p >= 1 ? 0 : p)));

  return (
    <div className={cn(fill, "p-1")}>
      <div className="mb-3 flex items-start justify-between">
        <span className={cn("grid size-9 place-items-center rounded-full transition-colors duration-300", done ? "bg-brand-gradient text-brand-foreground" : "bg-card text-card-foreground")}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={String(done)} className="grid place-items-center" {...pop} transition={springBouncy}>
              {done ? <Check className="size-4" strokeWidth={3} /> : <FileText className="size-4" strokeWidth={2.2} />}
            </motion.span>
          </AnimatePresence>
        </span>
        <Button variant="ghost" size="icon-xs" aria-label="Upload again" onClick={() => setProgress(0)}>
          <RotateCcw strokeWidth={2.6} />
        </Button>
      </div>
      <p className="font-semibold">receipt.jpg</p>
      <p className={caption} aria-live="polite">
        {done ? "Uploaded" : `${(progress * SIZE_MB).toFixed(1)} of ${SIZE_MB} MB`}
      </p>
      <Progress value={progress * 100} aria-label="Upload progress" className="mt-3" />
    </div>
  );
}

/* ── Progress ring (read-only) ──────────────────────────── */

const RING_TOTAL = 4;

export function ProgressRing() {
  const [paid, setPaid] = useState(3);
  const gradient = useId();
  useEvery(2400, () => setPaid((n) => (n % RING_TOTAL) + 1));

  return (
    <div className="flex flex-col items-center">
      <div
        role="progressbar"
        aria-label="Paid back"
        aria-valuemin={0}
        aria-valuemax={RING_TOTAL}
        aria-valuenow={paid}
        aria-valuetext={`${paid} of ${RING_TOTAL} paid back`}
        className="relative size-21"
      >
        <svg viewBox="0 0 80 80" aria-hidden className="size-full -rotate-90">
          <defs>
            <linearGradient id={gradient} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="var(--brand)" />
              <stop offset="1" stopColor="var(--brand-to)" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="34" fill="none" strokeWidth="7" className="stroke-foreground/12" />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            stroke={`url(#${gradient})`}
            initial={false}
            animate={{ pathLength: paid / RING_TOTAL }}
            transition={springSoft}
          />
        </svg>
        <span aria-hidden className="absolute inset-0 flex items-center justify-center text-xl font-semibold tracking-tight">
          <RollingNumber value={paid} />/{RING_TOTAL}
        </span>
      </div>
      <span className={cn(caption, "mt-2.5")}>Paid back</span>
    </div>
  );
}

/* ── Bar chart stat ─────────────────────────────────────── */

const MONTHS = [
  { label: "June", value: 148 },
  { label: "July", value: 186 },
  { label: "August", value: 131 },
  { label: "September", value: 231 },
  { label: "October", value: 174 },
  { label: "November", value: 212 },
];
const PEAK = Math.max(...MONTHS.map((m) => m.value));
const STAT_DEMO = [1, 5, 3, 0, 4, 2];

export function Stat() {
  const [active, setActive] = useState(5);
  useEvery(2300, (tick) => setActive(STAT_DEMO[tick % STAT_DEMO.length]));

  return (
    <div className={cn(fill, "p-1")}>
      {/* The label follows the selected bar, so the number is never ambiguous. */}
      <p className={cn(caption, "truncate")}>Dinners in {MONTHS[active].label}</p>
      <output className="block text-[22px] font-semibold tracking-tight">
        <RollingNumber value={MONTHS[active].value} text={`$${MONTHS[active].value}`} />
      </output>
      <div className="mt-2 flex h-[62px] items-end gap-[5px]" role="group" aria-label="Monthly spend">
        {MONTHS.map((m, i) => (
          <button
            key={m.label}
            type="button"
            aria-label={`${m.label}: $${m.value}`}
            aria-pressed={i === active}
            className="flex h-full flex-1 items-end justify-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            onClick={() => setActive(i)}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <motion.i
              className={cn("w-full max-w-[11px] rounded-full", i === active ? "bg-brand-gradient-v" : "bg-foreground/10")}
              animate={{ height: `${(m.value / PEAK) * (i === active ? 100 : 82)}%` }}
              transition={springBouncy}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Countdown timer ────────────────────────────────────── */

const START = 47 * 60 + 12;

export function Countdown() {
  const [left, setLeft] = useState(START);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : START)), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  useSequence([
    [4200, () => setRunning(false)],
    [1900, () => setRunning(true)],
  ]);

  return (
    <div className={cn(fill, "text-center")}>
      <p className={caption}>Request expires in</p>
      <time
        role="timer"
        aria-label={`${Math.floor(left / 60)} minutes ${left % 60} seconds`}
        className={cn("mt-0.5 mb-2.5 block text-3xl leading-[1.15] font-semibold tracking-tight transition-colors duration-300", !running && "text-muted-foreground")}
      >
        <RollingNumber value={-left} text={clock(left)} />
      </time>
      <div className="flex justify-center gap-2">
        <Button variant={running ? "surface" : "brand"} size="icon-sm" aria-label={running ? "Pause" : "Resume"} onClick={() => setRunning((r) => !r)}>
          <PlayPause playing={running} className="size-2.5!" />
        </Button>
        <Button variant="surface" size="icon-sm" aria-label="Reset" onClick={() => setLeft(START)}>
          <RotateCcw className="size-3!" strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}
