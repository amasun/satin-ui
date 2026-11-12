import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { Circle, Ellipsis, Maximize, Minimize, Moon, Pause, Play, RotateCcw, Square, Sun, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAutoplay } from "@/lib/autoplay";
import { ACCENTS, SPEEDS, nextOf, useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

/** One control in the bar. `pressed` marks controls that hold an on/off state. */
function Control({ label, pressed, className, children, ...props }: { label: string; pressed?: boolean } & ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(pressed && "bg-foreground/10 text-foreground", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

const Divider = () => <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-foreground/15 board:mx-0 board:my-0.5 board:h-px board:w-4" />;

/* ── How it looks ───────────────────────────────────────── */

function ThemeControl() {
  const [theme, setTheme] = useSetting("theme");
  const dark = theme === "dark";
  const Icon = dark ? Moon : Sun;
  return (
    <Control label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setTheme(dark ? "light" : "dark")}>
      <Icon strokeWidth={2.4} />
    </Control>
  );
}

function ShapeControl() {
  const [shape, setShape] = useSetting("shape");
  const soft = shape === "soft";
  const Icon = soft ? Square : Circle;
  return (
    <Control label={soft ? "Switch to round corners" : "Switch to soft corners"} onClick={() => setShape(soft ? "round" : "soft")}>
      <Icon className="size-3!" strokeWidth={2.8} />
    </Control>
  );
}

function AccentControl() {
  const [accent, setAccent] = useSetting("accent");
  return (
    <Control label={`Accent: ${accent}. Change accent`} onClick={() => setAccent(nextOf(ACCENTS, accent))}>
      <span className="size-3 rounded-full bg-brand-gradient transition-colors duration-300" />
    </Control>
  );
}

/* ── Demo ───────────────────────────────────────────────── */

function PlayControl() {
  const { on, toggle } = useAutoplay();
  const Icon = on ? Pause : Play;
  return (
    <Control label={on ? "Pause demos" : "Play demos"} onClick={toggle}>
      <Icon className="size-3! fill-current" strokeWidth={0} />
    </Control>
  );
}

function SpeedControl() {
  const [speed, setSpeed] = useSetting("speed");
  return (
    <Control label={`Demo speed ${speed}×. Change speed`} onClick={() => setSpeed(nextOf(SPEEDS, speed))}>
      <span className="text-[10px] leading-none font-bold tabular-nums">{speed}×</span>
    </Control>
  );
}

function ReplayControl() {
  const [replay, setReplay] = useSetting("replay");
  return (
    <Control label="Replay entrance" onClick={() => setReplay(replay + 1)}>
      <RotateCcw strokeWidth={2.6} />
    </Control>
  );
}

function AnnotateControl() {
  const [annotate, setAnnotate] = useSetting("annotate");
  return (
    <Control label="Show component names" pressed={annotate} onClick={() => setAnnotate(!annotate)}>
      <Tag strokeWidth={2.4} />
    </Control>
  );
}

function FullscreenControl() {
  const [full, setFull] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const sync = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  if (!document.fullscreenEnabled) return null;
  const Icon = full ? Minimize : Maximize;
  return (
    <Control
      label={full ? "Exit full screen" : "Full screen"}
      onClick={() => void (full ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})}
    >
      <Icon strokeWidth={2.4} />
    </Control>
  );
}

const demoExtras = (
  <>
    <SpeedControl />
    <ReplayControl />
    <AnnotateControl />
    <FullscreenControl />
  </>
);

/**
 * Controls that sit outside the board, next to the screen dots:
 * how the page looks, then how the demos run. On narrow screens the
 * less-used demo controls fold into a "more" menu so the bar fits.
 */
export function ControlBar() {
  return (
    <>
      <Divider />
      <ThemeControl />
      <ShapeControl />
      <AccentControl />
      <Divider />
      <PlayControl />
      <div className="hidden flex-col items-center gap-1 board:flex">{demoExtras}</div>
      <Popover>
        <PopoverTrigger asChild>
          <Control label="More demo controls" className="board:hidden">
            <Ellipsis strokeWidth={2.6} />
          </Control>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" sideOffset={10} className="flex w-auto flex-row gap-1 rounded-pill p-1 shadow-float">
          {demoExtras}
        </PopoverContent>
      </Popover>
    </>
  );
}

/** Remounts its children when "Replay entrance" is pressed, so tiles animate in again. */
export function Replayable({ children }: { children: ReactNode }) {
  const [replay] = useSetting("replay");
  return <div key={replay} className="contents">{children}</div>;
}
