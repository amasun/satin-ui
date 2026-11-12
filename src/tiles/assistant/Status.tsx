import { useEffect, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, Code2, FileText, ImageIcon, Pause, Play, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RollingNumber, SlidingThumb, Spinner, Swap, caption, fill, title, useLayoutScope } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import { easeOut, spring } from "@/lib/motion";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/* ── Usage quota ────────────────────────────────────────── */

const PERIODS = [
  { id: "day", label: "Day", limit: 50, resets: "Resets 4 PM" },
  { id: "week", label: "Week", limit: 300, resets: "Resets Mon" },
] as const;

export function UsageQuota() {
  const [period, setPeriod] = useState<"day" | "week">("day");
  const [used, setUsed] = useState(38);
  const thumb = useLayoutScope("quota");
  const p = PERIODS.find((x) => x.id === period) ?? PERIODS[0];
  const shown = period === "day" ? used : used + 212;
  const pct = Math.min(100, (shown / p.limit) * 100);
  const high = pct >= 90;

  useSequence([
    [1300, () => setUsed((u) => u + 3)],
    [1200, () => setUsed((u) => u + 4)],
    [1200, () => setUsed((u) => Math.min(50, u + 5))],
    [1800, () => setPeriod("week")],
    [2000, () => (setPeriod("day"), setUsed(38))],
  ]);

  return (
    <div className="flex h-full w-full min-w-0 flex-col justify-between">
      <div role="group" aria-label="Usage period" className="flex h-7 rounded-pill bg-well p-0.5">
        {PERIODS.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={x.id === period}
            onClick={() => setPeriod(x.id)}
            className={cn(ring, "relative flex-1 rounded-[calc(var(--shape-pill)-2px)] text-[11px] font-semibold", x.id === period ? "text-foreground" : "text-muted-foreground")}
          >
            {x.id === period && <SlidingThumb id={thumb} />}
            <span className="relative">{x.label}</span>
          </button>
        ))}
      </div>
      <div className="px-0.5">
        <p className={caption}>Messages</p>
        <p className="flex items-baseline gap-1">
          <RollingNumber value={shown} className="text-xl font-semibold tracking-tight" />
          <span className={caption}>/ {p.limit}</span>
        </p>
      </div>
      <div className="px-0.5">
        <Progress value={pct} aria-label="Messages used" className={cn("h-1.5", high && "[&>[data-slot=progress-indicator]]:bg-destructive [&>[data-slot=progress-indicator]]:bg-none")} />
        <p className={cn(caption, "mt-1.5 truncate", high && "text-destructive")}>
          <Swap id={high ? "h" : p.id}>{high ? "Almost out" : p.resets}</Swap>
        </p>
      </div>
    </div>
  );
}

/* ── Context length ─────────────────────────────────────── */

const WINDOW_K = 128;
const R = 26;
const CIRC = 2 * Math.PI * R;

export function ContextMeter() {
  const [used, setUsed] = useState(46);
  const [compacting, setCompacting] = useState(false);
  const [speed] = useSetting("speed");
  const pct = used / WINDOW_K;
  const level = pct >= 0.85 ? "full" : pct >= 0.65 ? "warn" : "ok";

  /* Compacting settles by itself (it is the control's behaviour, not the demo's). */
  useEffect(() => {
    if (!compacting) return;
    const t = window.setTimeout(() => (setUsed(30), setCompacting(false)), 900 / speed);
    return () => window.clearTimeout(t);
  }, [compacting, speed]);

  useEvery(1300, () => {
    if (compacting) return;
    if (used >= 112) setCompacting(true);
    else setUsed((u) => u + 14);
  });

  const stroke = level === "full" ? "var(--destructive)" : level === "warn" ? "var(--chart-4)" : "var(--brand)";

  return (
    <div className="flex h-full w-full min-w-0 flex-col items-center justify-between">
      <div className="relative size-16" role="meter" aria-label="Context used" aria-valuemin={0} aria-valuemax={WINDOW_K} aria-valuenow={used} aria-valuetext={`${used}k of ${WINDOW_K}k tokens`}>
        <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden>
          <circle cx="32" cy="32" r={R} fill="none" strokeWidth="6" className="stroke-foreground/10" />
          <motion.circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={false}
            animate={{ strokeDashoffset: CIRC * (1 - pct), stroke }}
            transition={{ duration: 0.7, ease: easeOut }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-xs font-semibold">
          <RollingNumber value={Math.round(pct * 100)} text={`${Math.round(pct * 100)}%`} />
        </span>
      </div>
      <p className={cn(caption, "truncate tabular-nums")}>
        {used}k / {WINDOW_K}k
      </p>
      <Button variant={level === "full" ? "default" : "surface"} size="sm" disabled={compacting || used <= 30} onClick={() => setCompacting(true)} className="w-full max-w-[110px]">
        <Swap id={compacting ? "c" : "n"} className="gap-1">
          {compacting && <Spinner className="size-3" />}
          {compacting ? "Compacting" : "Compact"}
        </Swap>
      </Button>
    </div>
  );
}

/* ── Error with retry ───────────────────────────────────── */

type Conn = "error" | "retrying" | "ok";

export function ErrorRetry() {
  const [state, setState] = useState<Conn>("error");
  const [speed] = useSetting("speed");

  useEffect(() => {
    if (state !== "retrying") return;
    const t = window.setTimeout(() => setState("ok"), 1300 / speed);
    return () => window.clearTimeout(t);
  }, [state, speed]);

  useSequence([
    [2200, () => setState("retrying")],
    [3400, () => setState("error")],
  ]);

  const tone = state === "error" ? "bg-destructive/10 text-destructive" : state === "ok" ? "bg-card text-card-foreground" : "bg-card text-muted-foreground";

  return (
    <div role="status" className={cn(fill, "flex h-11 items-center gap-2 rounded-pill pr-1.5 pl-3.5 transition-colors duration-300", tone)}>
      <Swap id={state} className="min-w-0 flex-1 gap-2">
        {state === "error" ? (
          <CircleAlert className="size-4 shrink-0" strokeWidth={2.4} />
        ) : state === "ok" ? (
          <CircleCheck className="size-4 shrink-0 text-brand" strokeWidth={2.4} />
        ) : (
          <Spinner className="size-3.5" />
        )}
        <span className="truncate font-semibold">{state === "error" ? "Connection lost mid-reply" : state === "ok" ? "Back online, reply resumed" : "Reconnecting…"}</span>
      </Swap>
      <AnimatePresence initial={false}>
        {state === "error" && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={spring}>
            <Button size="sm" variant="default" onClick={() => setState("retrying")} className="bg-destructive text-white hover:bg-destructive/85">
              <RefreshCw strokeWidth={2.6} />
              Retry
            </Button>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Generation queue ───────────────────────────────────── */

type Job = { id: number; name: string; kind: "image" | "doc" | "code"; progress: number };

const JOB_NAMES: Array<Pick<Job, "name" | "kind">> = [
  { name: "4 forest images", kind: "image" },
  { name: "Trip summary", kind: "doc" },
  { name: "Unit tests for water.ts", kind: "code" },
  { name: "Logo sketches", kind: "image" },
  { name: "Meeting notes", kind: "doc" },
];
const KIND_ICON = { image: ImageIcon, doc: FileText, code: Code2 };

let nextJobId = 0;
const makeJob = (i: number): Job => ({ id: nextJobId++, ...JOB_NAMES[i % JOB_NAMES.length], progress: 0 });

export function TaskQueue() {
  const [jobs, setJobs] = useState<Job[]>(() => [0, 1, 2].map(makeJob));
  const [paused, setPaused] = useState(false);
  const [added, setAdded] = useState(3);

  useEvery(450, (tick) => {
    /* Every so often the demo pauses the queue for a beat, then resumes. */
    if (tick % 36 === 30) setPaused(true);
    if (tick % 36 === 35) setPaused(false);
    if (paused) return;
    setJobs((list) => {
      if (list.length === 0) return list;
      const [head, ...rest] = list;
      if (head.progress >= 100) return rest;
      return [{ ...head, progress: Math.min(100, head.progress + 9) }, ...rest];
    });
    if (jobs.length < 3) {
      setJobs((list) => [...list, makeJob(added)]);
      setAdded((n) => n + 1);
    }
  });

  const cancel = (id: number) => setJobs((list) => list.filter((j) => j.id !== id));
  const running = jobs[0];

  return (
    <div className={cn(fill, "flex h-full flex-col gap-1.5")}>
      <div className="flex h-8 items-center gap-2 pl-1">
        <h3 className={title}>Queue</h3>
        <span className={cn(caption, "min-w-0 flex-1 truncate")} aria-live="polite">
          {jobs.length} {jobs.length === 1 ? "task" : "tasks"}
          {paused ? ", paused" : ""}
        </span>
        <Button variant="surface" size="sm" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          {paused ? <Play className="fill-current" strokeWidth={2.4} /> : <Pause className="fill-current" strokeWidth={2.4} />}
          {paused ? "Resume" : "Pause"}
        </Button>
      </div>
      <ul className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {jobs.slice(0, 3).map((job) => {
            const Icon = KIND_ICON[job.kind];
            const active = job === running;
            return (
              <motion.li
                key={job.id}
                layout
                className="flex h-8 items-center gap-2.5 px-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                transition={spring}
              >
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-lg", active ? "bg-card text-foreground" : "text-muted-foreground")}>
                  <Icon className="size-3.5" strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-xs">
                    <span className={cn("truncate font-semibold", !active && "text-foreground/70")}>{job.name}</span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {active ? (job.progress >= 100 ? "Done" : `${job.progress}%`) : "Queued"}
                    </span>
                  </span>
                  <Progress value={active ? job.progress : 0} aria-label={`${job.name} progress`} className="mt-1 h-1" />
                </span>
                <button type="button" aria-label={`Cancel ${job.name}`} onClick={() => cancel(job.id)} className={cn(ring, "relative grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground after:absolute after:-inset-1.5 hover:bg-card hover:text-foreground")}>
                  <X className="size-3.5" strokeWidth={2.6} />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ── Keyboard shortcut hints ────────────────────────────── */

const SHORTCUTS = [
  { id: "send", label: "Send", keys: ["↵"], match: (e: KeyboardEvent) => e.key === "Enter" && !e.shiftKey },
  { id: "line", label: "New line", keys: ["⇧", "↵"], match: (e: KeyboardEvent) => e.key === "Enter" && e.shiftKey },
  { id: "stop", label: "Stop", keys: ["Esc"], match: (e: KeyboardEvent) => e.key === "Escape" },
  { id: "edit", label: "Edit last", keys: ["↑"], match: (e: KeyboardEvent) => e.key === "ArrowUp" },
] as const;

export function ShortcutHints() {
  const [pressed, setPressed] = useState<string | null>(null);
  useEvery(1100, (tick) => setPressed(tick % 2 ? null : SHORTCUTS[(tick / 2) % SHORTCUTS.length].id));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const hit = SHORTCUTS.find((s) => s.match(e));
    if (!hit) return;
    e.preventDefault();
    setPressed(hit.id);
  };

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label="Keyboard shortcuts. Focus here and press a key to try it."
      onKeyDown={onKeyDown}
      onKeyUp={() => setPressed(null)}
      className={cn(ring, "flex h-full w-full min-w-0 flex-col gap-1 rounded-xl")}
    >
      <h3 className={cn(title, "px-0.5 pb-0.5")}>Shortcuts</h3>
      <ul className="flex flex-1 flex-col justify-between">
        {SHORTCUTS.map((s) => {
          const on = pressed === s.id;
          return (
            <li key={s.id} className="flex h-6 items-center gap-1.5 px-0.5">
              <span className={cn("min-w-0 flex-1 truncate text-xs transition-colors", on ? "font-semibold text-foreground" : "text-muted-foreground")}>{s.label}</span>
              {s.keys.map((key) => (
                <motion.kbd
                  key={key}
                  animate={{ y: on ? 1.5 : 0 }}
                  transition={spring}
                  className={cn(
                    "grid h-5 min-w-5 place-items-center rounded-md border-b-2 px-1 font-sans text-[11px] font-semibold transition-colors duration-150",
                    on ? "border-transparent bg-brand-gradient text-brand-foreground" : "border-foreground/10 bg-card text-card-foreground",
                  )}
                >
                  {key}
                </motion.kbd>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
