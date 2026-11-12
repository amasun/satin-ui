import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { RollingNumber, Swap, caption, fill } from "@/components/kit";
import { useLive } from "@/lib/live";
import { spring, springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Announce, clock, focusRing } from "./shared";

/* ── Online sparkline ───────────────────────────────────── */

const W = 300;
const H = 100;

function toPath(points: readonly number[]) {
  const min = Math.min(...points) - 6;
  const max = Math.max(...points) + 6;
  const xy = points.map((p, i) => [(i / Math.max(1, points.length - 1)) * W, H - ((p - min) / (max - min)) * H] as const);
  let d = `M ${xy[0][0]} ${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [px, py] = xy[i - 1];
    const [x, y] = xy[i];
    const mx = (px + x) / 2;
    d += ` C ${mx} ${py}, ${mx} ${y}, ${x} ${y}`;
  }
  return { line: d, area: `${d} L ${W} ${H} L 0 ${H} Z`, xy };
}

export function OnlineTrend() {
  const gradient = useId();
  const samples = useLive((s) => s.samples);
  const online = useLive((s) => s.online);
  /** Index the readout points at; null follows the newest sample. */
  const [picked, setPicked] = useState<number | null>(null);
  const points = samples.length > 1 ? samples : [online, online];
  const path = useMemo(() => toPath(points), [points]);
  const active = picked === null ? points.length - 1 : Math.min(picked, points.length - 1);
  const [ax, ay] = path.xy[active];
  const delta = Math.round(((points[points.length - 1] - points[0]) / points[0]) * 100);
  const up = delta >= 0;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width));
    setPicked(Math.round(ratio * (points.length - 1)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") setPicked(Math.max(0, active - 1));
    else if (e.key === "ArrowRight") setPicked(active + 1 >= points.length - 1 ? null : active + 1);
    else if (e.key === "End" || e.key === "Escape") setPicked(null);
    else return;
    e.preventDefault();
  };

  return (
    <div className={cn(fill, "flex flex-col self-stretch p-1")}>
      <p className={caption}>Online, last few minutes</p>
      <div className="flex items-baseline gap-2">
        <output className="text-[28px] leading-tight font-semibold tracking-tight">
          <RollingNumber value={online} />
        </output>
        <span className={cn("flex items-center gap-0.5 text-xs font-semibold", up ? "text-[color-mix(in_oklab,var(--brand)_70%,var(--foreground))]" : "text-destructive")}>
          <ArrowUpRight className={cn("size-3.5 transition-transform duration-300", !up && "rotate-90")} strokeWidth={2.6} aria-hidden />
          <RollingNumber value={delta} text={`${Math.abs(delta)}%`} />
          <span className="sr-only">{up ? "up" : "down"} over this window</span>
        </span>
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Online count over time"
        aria-valuemin={0}
        aria-valuemax={points.length - 1}
        aria-valuenow={active}
        aria-valuetext={`${points[active]} online${picked === null ? ", now" : ""}`}
        className={cn("relative mt-3 min-h-0 flex-1 cursor-crosshair touch-none rounded-md", focusRing)}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setPicked(null)}
        onKeyDown={onKey}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--brand)" stopOpacity="0.3" />
              <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path initial={false} animate={{ d: path.area }} transition={springSoft} fill={`url(#${gradient})`} />
          <motion.path
            initial={false}
            animate={{ d: path.line }}
            transition={springSoft}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <motion.div aria-hidden className="pointer-events-none absolute" animate={{ left: `${(ax / W) * 100}%`, top: `${(ay / H) * 100}%` }} transition={spring}>
          <span className="absolute -top-[5px] -left-[5px] size-2.5 rounded-full border-2 border-tile bg-foreground" />
          {picked !== null && (
            <span className="absolute bottom-3 left-0 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-background tabular-nums">
              {points[active]}
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Peak and elapsed time ──────────────────────────────── */

const SESSION = 60 * 60;

export function PeakElapsed() {
  const peak = useLive((s) => s.peak);
  const elapsed = useLive((s) => s.elapsed);
  const [remaining, setRemaining] = useState(false);
  const shown = remaining ? Math.max(0, SESSION - elapsed) : elapsed;

  return (
    <div className="flex w-full flex-col gap-2 self-stretch">
      <div className="px-1">
        <p className={caption}>Peak</p>
        <output className="block text-2xl leading-tight font-semibold tracking-tight">
          <RollingNumber value={peak} />
        </output>
        <Announce>{`Peak ${peak} online`}</Announce>
      </div>
      <button
        type="button"
        aria-pressed={remaining}
        aria-label={`${remaining ? "Remaining" : "Elapsed"} ${clock(shown)}. Switch to ${remaining ? "elapsed" : "remaining"} time`}
        className={cn("mt-auto rounded-xl bg-card px-2.5 py-1.5 text-left text-card-foreground transition-colors hover:bg-card/70", focusRing)}
        onClick={() => setRemaining((r) => !r)}
      >
        <span className={cn(caption, "block")}>
          <Swap id={String(remaining)}>{remaining ? "Remaining" : "Elapsed"}</Swap>
        </span>
        <span className="block text-[15px] font-semibold tabular-nums" aria-hidden>
          {clock(shown)}
        </span>
      </button>
    </div>
  );
}

/* ── Engagement ring ────────────────────────────────────── */

const R = 30;
const CIRC = 2 * Math.PI * R;

export function EngagementRing() {
  const reacted = useLive((s) => s.reacted);
  const online = useLive((s) => s.online);
  const [counts, setCounts] = useState(false);
  const share = Math.min(1, reacted / Math.max(1, online));
  const pct = Math.round(share * 100);
  const shownReacted = Math.min(reacted, online);

  return (
    <div className="grid place-items-center">
      <button
        type="button"
        aria-pressed={counts}
        aria-label={`${pct}% of viewers reacted, ${shownReacted} of ${online}. Show ${counts ? "percentage" : "counts"}`}
        className={cn("flex flex-col items-center gap-1.5 rounded-2xl p-1", focusRing)}
        onClick={() => setCounts((c) => !c)}
      >
        <span className="relative size-[84px]" aria-hidden>
          <svg viewBox="0 0 80 80" className="size-full -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" stroke="var(--well)" strokeWidth="9" />
            <motion.circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={false}
              animate={{ strokeDashoffset: CIRC * (1 - share) }}
              transition={springSoft}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[15px] font-semibold tracking-tight">
            <Swap id={String(counts)}>
              {counts ? <span className="text-xs tabular-nums">{shownReacted}/{online}</span> : <RollingNumber value={pct} text={`${pct}%`} />}
            </Swap>
          </span>
        </span>
        <span className={caption}>Reacted</span>
      </button>
      <Announce>{`${pct}% of viewers reacted`}</Announce>
    </div>
  );
}
