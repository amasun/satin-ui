import { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { Captions as CaptionsIcon, ChevronDown, Maximize2, Minimize2, Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Swap, caption, title } from "@/components/kit";
import { useAutoplay, useCellActive, useEvery, useSequence, type Step } from "@/lib/autoplay";
import { useSetting } from "@/lib/settings";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { clock, focusRing } from "./shared";

/* ── Player: stage and control bar ──────────────────────── */

const DURATION = 45 * 60;

export function Player() {
  const seekId = useId();
  const demo = useCellActive();
  const { enabled } = useAutoplay();
  const [speed] = useSetting("speed");
  const [playing, setPlaying] = useState(true);
  const [position, setPosition] = useState(12 * 60 + 48);
  const [expanded, setExpanded] = useState(false);

  /* Playback itself is the player's behaviour, so it keeps its own clock (stopped by the global pause). */
  useEffect(() => {
    if (!playing || !enabled) return;
    const timer = window.setInterval(() => setPosition((p) => (p + 1) % DURATION), 1000 / speed);
    return () => window.clearInterval(timer);
  }, [playing, enabled, speed]);

  useSequence([
    [5200, () => setPlaying(false)],
    [1400, () => setPosition((p) => Math.min(DURATION - 60, p + 95))],
    [1200, () => setPlaying(true)],
    [4800, () => setExpanded(true)],
    [2000, () => setExpanded(false)],
  ]);

  const moving = playing && demo;

  return (
    <div className="flex w-full flex-col gap-2.5 self-stretch">
      <div
        className={cn("relative min-h-0 flex-1 overflow-hidden rounded-2xl transition-transform duration-500 ease-out-expo", expanded && "scale-[1.015]")}
        style={{ background: "linear-gradient(135deg, var(--chart-1), var(--chart-4))" }}
      >
        <motion.span
          aria-hidden
          className="absolute -top-1/3 -left-[10%] size-[70%] rounded-full opacity-70 blur-3xl"
          style={{ background: "var(--chart-2)" }}
          animate={moving ? { x: ["0%", "30%", "0%"], y: ["0%", "18%", "0%"] } : {}}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.span
          aria-hidden
          className="absolute -right-[10%] -bottom-1/2 size-[75%] rounded-full opacity-70 blur-3xl"
          style={{ background: "var(--chart-5)" }}
          animate={moving ? { x: ["0%", "-26%", "0%"], y: ["0%", "-14%", "0%"] } : {}}
          transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
        />
        <span className="absolute top-3 left-3 inline-flex h-6 items-center gap-1.5 rounded-pill bg-destructive px-2.5 text-[11px] font-bold tracking-wide text-white uppercase">
          <i className="size-1.5 rounded-full bg-white" aria-hidden />
          Live
        </span>
        <div className="absolute bottom-3 left-3 max-w-[70%] rounded-xl bg-background/70 px-3 py-1.5 backdrop-blur-sm">
          <p className="truncate text-[13px] font-semibold">Ava Chen, Head of Design</p>
          <p className={cn(caption, "truncate")}>Keynote: what's new in Satin</p>
        </div>
      </div>
      <div className="flex h-9 shrink-0 items-center gap-2.5 px-0.5">
        <Button variant="secondary" size="icon-sm" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
          <Swap id={String(playing)}>{playing ? <Pause fill="currentColor" strokeWidth={0} /> : <Play fill="currentColor" strokeWidth={0} />}</Swap>
        </Button>
        <span id={seekId} className="sr-only">
          Seek
        </span>
        <span className="w-10 shrink-0 text-xs font-semibold tabular-nums">{clock(position)}</span>
        <Slider
          min={0}
          max={DURATION}
          step={5}
          value={[position]}
          onValueChange={([v]) => setPosition(v)}
          aria-labelledby={seekId}
          className="h-5 min-w-0 flex-1"
        />
        <span className={cn(caption, "w-10 shrink-0 text-right tabular-nums")}>{clock(DURATION)}</span>
        <Button variant="ghost" size="icon-sm" aria-label="Full screen" aria-pressed={expanded} onClick={() => setExpanded((v) => !v)}>
          {expanded ? <Minimize2 strokeWidth={2.4} /> : <Maximize2 strokeWidth={2.4} />}
        </Button>
      </div>
    </div>
  );
}

/* ── Live status badge ──────────────────────────────────── */

const STATUSES = [
  { id: "live", label: "Live", style: "bg-destructive text-white", dot: "bg-white motion-safe:animate-pulse" },
  { id: "soon", label: "Starting soon", style: "bg-card text-card-foreground", dot: "bg-chart-4" },
  { id: "ended", label: "Ended", style: "bg-well text-muted-foreground", dot: "bg-muted-foreground" },
] as const;

export function LiveStatusBadge() {
  const [index, setIndex] = useState(0);
  useEvery(2600, () => setIndex((i) => (i + 1) % STATUSES.length));
  const status = STATUSES[index];

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <p className={caption}>Broadcast</p>
      <button
        type="button"
        aria-label={`Status: ${status.label}. Change status`}
        className={cn("inline-flex h-7 items-center rounded-pill px-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors duration-300", status.style, focusRing)}
        onClick={() => setIndex((i) => (i + 1) % STATUSES.length)}
      >
        <Swap id={status.id} className="gap-1.5">
          <i className={cn("size-1.5 shrink-0 rounded-full", status.dot)} aria-hidden />
          {status.label}
        </Swap>
      </button>
    </div>
  );
}

/* ── Caption strip ──────────────────────────────────────── */

const LINES = [
  ["Ava", "Thanks for joining us, wherever you're watching from."],
  ["Ava", "Today we're shipping three things we've wanted for years."],
  ["Ava", "First up: themes you can switch in a single attribute."],
  ["Kai", "Let me show you how that looks in a real product."],
  ["Kai", "Every component reads the same handful of tokens."],
  ["Ava", "Questions are open, upvote the ones you care about."],
] as const;

export function CaptionStrip() {
  const [line, setLine] = useState(0);
  const [on, setOn] = useState(true);
  useEvery(2600, () => setLine((l) => (l + 1) % LINES.length));
  const [who, text] = LINES[line];

  return (
    <div className="flex w-full min-w-0 items-center gap-2.5">
      <Button variant={on ? "default" : "surface"} size="icon-sm" aria-label="Captions" aria-pressed={on} onClick={() => setOn((v) => !v)}>
        <CaptionsIcon strokeWidth={2.4} />
      </Button>
      <div className="flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-xl bg-card px-3.5 text-card-foreground">
        {on ? (
          <motion.p
            key={line}
            className="min-w-0 truncate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
          >
            <span className="font-semibold">{who}:</span> {text}
          </motion.p>
        ) : (
          <p className={caption}>Captions off</p>
        )}
      </div>
    </div>
  );
}

/* ── Chapters ───────────────────────────────────────────── */

const CHAPTERS = [
  { title: "Welcome", min: 4 },
  { title: "Themes in one attribute", min: 11 },
  { title: "Live demo", min: 14 },
  { title: "Pricing", min: 6 },
  { title: "Q&A", min: 10 },
];

export function Chapters() {
  const [current, setCurrent] = useState(1);
  const [progress, setProgress] = useState(40);
  useEvery(600, () => {
    if (progress >= 100) {
      setCurrent((c) => (c + 1) % CHAPTERS.length);
      setProgress(0);
    } else setProgress((p) => Math.min(100, p + 10));
  });
  const chapter = CHAPTERS[current];

  return (
    <div className="flex w-full flex-col gap-2 px-1">
      <div className="flex items-baseline gap-2">
        <p className={cn(title, "min-w-0 truncate")}>
          <Swap id={current}>
            <span className="mr-1.5 text-muted-foreground tabular-nums">
              {current + 1}/{CHAPTERS.length}
            </span>
            {chapter.title}
          </Swap>
        </p>
        <p className={cn(caption, "ml-auto shrink-0")}>{chapter.min} min</p>
      </div>
      <ol className="flex gap-1">
        {CHAPTERS.map((c, i) => (
          <li key={c.title} style={{ flexGrow: c.min, flexBasis: 0 }} className="min-w-0">
            <button
              type="button"
              aria-label={`Chapter ${i + 1}: ${c.title}`}
              aria-current={i === current ? "step" : undefined}
              className={cn("group flex h-5 w-full items-center rounded-pill", focusRing)}
              onClick={() => (setCurrent(i), setProgress(0))}
            >
              <span className={cn("relative h-1.5 w-full overflow-hidden rounded-pill transition-[height] group-hover:h-2", i < current ? "bg-foreground/45" : "bg-foreground/12", i === current && "h-2")}>
                {i === current && (
                  <span
                    className="absolute inset-y-0 left-0 w-full origin-left rounded-pill bg-brand-gradient transition-transform duration-500 ease-out-expo"
                    style={{ transform: `scaleX(${progress / 100})` }}
                  />
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Volume and quality ─────────────────────────────────── */

const QUALITIES = ["Auto", "1080p", "720p", "480p"];
const DEMO_VOLUMES = [70, 30, 0, 85];

export function PlaybackMenu() {
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [quality, setQuality] = useState("1080p");
  const steps: Step[] = [
    [2000, () => setVolume(DEMO_VOLUMES[1])],
    [1600, () => setQuality("720p")],
    [1800, () => setVolume(DEMO_VOLUMES[2])],
    [1600, () => setVolume(DEMO_VOLUMES[3])],
    [1800, () => (setQuality("1080p"), setVolume(DEMO_VOLUMES[0]))],
  ];
  useSequence(steps);

  const level = muted ? 0 : volume;
  const VolumeIcon = level === 0 ? VolumeX : level < 50 ? Volume1 : Volume2;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className={caption}>Playback</p>
      <div className="flex items-center gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="surface" size="icon-sm" aria-label={`Volume, ${level}%`}>
              <VolumeIcon strokeWidth={2.4} />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" sideOffset={8} className="flex w-52 items-center gap-2.5 p-2.5">
            <Button variant="ghost" size="icon-sm" aria-label="Mute" aria-pressed={muted} onClick={() => setMuted((m) => !m)}>
              <VolumeIcon strokeWidth={2.4} />
            </Button>
            <Slider min={0} max={100} step={5} value={[level]} onValueChange={([v]) => (setMuted(false), setVolume(v))} aria-label="Volume" className="h-5 flex-1" />
            <span className="w-8 text-right text-xs font-semibold tabular-nums">{level}%</span>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="surface" size="sm" className="gap-0.5 pr-2 pl-2.5" aria-label={`Quality, ${quality}`}>
              <Swap id={quality}>{quality}</Swap>
              <ChevronDown className="size-3.5! text-muted-foreground" strokeWidth={2.6} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-32">
            <DropdownMenuLabel>Quality</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={quality} onValueChange={setQuality}>
              {QUALITIES.map((q) => (
                <DropdownMenuRadioItem key={q} value={q}>
                  {q}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
