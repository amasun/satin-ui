import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonAvatar, RollingNumber, Swap, caption, fill, title } from "@/components/kit";
import { useSequence } from "@/lib/autoplay";
import { useLive, useLivePresence, type Viewer } from "@/lib/live";
import { easeOut, pop, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Announce, SourceMarker, focusRing } from "./shared";

/* ── Online count with avatar stack ─────────────────────── */

export function OnlineCount() {
  const online = useLive((s) => s.online);
  const viewers = useLive((s) => s.viewers);
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = viewers.find((v) => v.id === picked);

  return (
    <div className={cn(fill, "flex flex-col gap-2 self-stretch p-1")}>
      <div className="flex items-center justify-between">
        <p className={caption}>Online now</p>
        <SourceMarker />
      </div>
      <output className="block text-[34px] leading-none font-semibold tracking-tight">
        <RollingNumber value={online} />
      </output>
      <Announce>{`${online} people online`}</Announce>
      <div className="mt-auto flex min-w-0 items-center gap-2.5">
        <ul className="flex shrink-0 -space-x-2" aria-label="Recently joined">
          <AnimatePresence initial={false} mode="popLayout">
            {viewers.map((v) => (
              <motion.li key={v.id} layout {...pop} transition={springBouncy}>
                <button
                  type="button"
                  aria-label={v.name}
                  aria-pressed={v.id === picked}
                  className={cn("relative block rounded-full ring-2 ring-card transition-transform hover:-translate-y-0.5", focusRing, v.id === picked && "-translate-y-0.5")}
                  onClick={() => setPicked((p) => (p === v.id ? null : v.id))}
                >
                  <PersonAvatar who={v} className="size-8 text-xs" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <p className={cn(caption, "min-w-0 truncate")}>
          <Swap id={chosen ? chosen.id : "others"}>{chosen ? `${chosen.name} is watching` : `+${Math.max(0, online - viewers.length)} more`}</Swap>
        </p>
      </div>
    </div>
  );
}

/* ── "Watching now" pill ────────────────────────────────── */

export function WatchingNow() {
  const online = useLive((s) => s.online);
  const [exact, setExact] = useState(true);
  const rounded = Math.floor(online / 10) * 10;

  return (
    <button
      type="button"
      aria-pressed={!exact}
      aria-label={`Watching now: ${online}. ${exact ? "Show rounded count" : "Show exact count"}`}
      className={cn(fill, "flex h-10 items-center gap-2.5 rounded-pill bg-card pr-1.5 pl-3.5 text-card-foreground transition-colors hover:bg-card/70", focusRing)}
      onClick={() => setExact((v) => !v)}
    >
      <span className="relative grid size-2.5 shrink-0 place-items-center" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-destructive/60 motion-safe:animate-ping" />
        <span className="relative size-2.5 rounded-full bg-destructive" />
      </span>
      <span className="min-w-0 flex-1 truncate text-left font-semibold">Watching now</span>
      <span className="rounded-pill bg-well px-2.5 py-1 text-xs font-semibold" aria-hidden>
        <RollingNumber value={exact ? online : rounded} text={exact ? String(online) : `${rounded}+`} />
      </span>
    </button>
  );
}

/* ── Join notice ────────────────────────────────────────── */

export function JoinNotice() {
  const [notice, setNotice] = useState<{ id: number; who: Viewer } | null>(null);
  const [waved, setWaved] = useState<Set<string>>(() => new Set());
  /** While a person is pointing at or focused in the tile, the notice holds still. */
  const holding = useRef(false);
  const timer = useRef(0);

  const hideLater = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => !holding.current && setNotice(null), 3200);
  };

  useLivePresence((e) => {
    if (e.kind !== "join" || holding.current) return;
    setNotice({ id: e.id, who: e.who });
    hideLater();
  });

  const hold = () => {
    holding.current = true;
    window.clearTimeout(timer.current);
  };
  const release = () => {
    holding.current = false;
    hideLater();
  };

  const wave = (id: string) => setWaved((prev) => new Set(prev).add(id));

  return (
    <div className={cn(fill, "flex h-10 items-center")} onPointerEnter={hold} onPointerLeave={release} onFocusCapture={hold} onBlurCapture={release}>
      <AnimatePresence mode="popLayout" initial={false}>
        {notice ? (
          <motion.div
            key={notice.id}
            className="flex w-full min-w-0 items-center gap-2.5"
            initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            <PersonAvatar who={notice.who} className="size-7 text-xs" />
            <p className="min-w-0 flex-1 truncate">
              <span className="font-semibold">{notice.who.name}</span> <span className="text-muted-foreground">joined</span>
            </p>
            <Button
              variant={waved.has(notice.who.id) ? "secondary" : "surface"}
              size="sm"
              aria-pressed={waved.has(notice.who.id)}
              onClick={() => wave(notice.who.id)}
            >
              <motion.span key={String(waved.has(notice.who.id))} className="grid place-items-center" animate={waved.has(notice.who.id) ? { rotate: [0, 18, -10, 14, 0] } : {}} transition={{ duration: 0.6 }}>
                <Hand className="size-3.5" strokeWidth={2.4} />
              </motion.span>
              {waved.has(notice.who.id) ? "Waved" : "Wave"}
            </Button>
          </motion.div>
        ) : (
          <motion.p key="idle" className={cn(caption, "w-full truncate text-center")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            New arrivals show up here
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Typing indicator ───────────────────────────────────── */

const TYPERS: string[][] = [["Kai"], ["Noor", "Juno"], [], ["Mila"], ["Sana", "Leo", "Omar"], []];

function typingText(names: string[]) {
  if (names.length === 0) return "No one is typing";
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return `${names.length} people are typing`;
}

export function TypingIndicator() {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);
  const next = () => setIndex((i) => (i + 1) % TYPERS.length);
  useSequence([
    [2200, next],
    [2400, next],
    [1600, next],
    [2200, next],
    [2600, next],
    [1600, next],
  ]);

  const names = TYPERS[index];
  const active = shown && names.length > 0;

  return (
    <div className={cn(fill, "flex h-10 items-center gap-2.5")}>
      <span className={cn("flex h-7 w-11 shrink-0 items-center justify-center gap-[3px] rounded-pill bg-card transition-opacity", !active && "opacity-40")} aria-hidden>
        {[0, 1, 2].map((i) => (
          <i key={i} className={cn("size-[5px] rounded-full bg-muted-foreground", active && "animate-typing")} style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <p className={cn(title, "min-w-0 flex-1 truncate font-medium", !active && "text-muted-foreground")}>
        <Swap id={shown ? index : "hidden"}>{shown ? typingText(names) : "Typing hidden"}</Swap>
      </p>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Hide typing indicators"
        aria-pressed={!shown}
        onClick={() => setShown((v) => !v)}
      >
        {shown ? <Eye strokeWidth={2.4} /> : <EyeOff strokeWidth={2.4} />}
      </Button>
    </div>
  );
}
