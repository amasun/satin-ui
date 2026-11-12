import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RollingNumber, caption, fill, title } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import { EMOJIS, EMOJI_NAMES, sendReaction, useLive, type Emoji } from "@/lib/live";
import { pop, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Announce, FloatLayer, compact, focusRing, useFloaters } from "./shared";

/** One colour per reaction, shared by the bar, the mix and the hearts. */
export const EMOJI_COLOR: Record<Emoji, string> = {
  "❤️": "var(--chart-1)",
  "🔥": "var(--chart-2)",
  "👏": "var(--chart-3)",
  "😂": "var(--chart-4)",
  "🎉": "var(--chart-5)",
};

const HEART_TINTS = ["var(--destructive)", "var(--chart-1)", "var(--chart-4)"];

/* ── Like button with floating hearts ───────────────────── */

export function LikeButton() {
  const hearts = useLive((s) => s.counts["❤️"]);
  const [sent, setSent] = useState(0);
  const [items, done] = useFloaters((e) => e.emoji === "❤️");

  const like = () => {
    setSent((n) => n + 1);
    sendReaction("❤️");
  };

  return (
    <div className="relative flex w-full flex-col items-center self-stretch">
      <FloatLayer
        items={items}
        done={done}
        bottom={44}
        render={(f) => (
          <Heart className="size-6" fill="currentColor" strokeWidth={0} style={{ color: f.mine ? "var(--brand)" : HEART_TINTS[f.tint] }} />
        )}
      />
      <div className="relative w-full p-1 text-center">
        <p className={caption}>Likes this session</p>
        <output className="block text-[34px] leading-tight font-semibold tracking-tight">
          <RollingNumber value={hearts} text={hearts.toLocaleString("en-US")} />
        </output>
        <Announce>{`${hearts.toLocaleString("en-US")} likes`}</Announce>
      </div>
      <div className="relative mt-auto flex flex-col items-center gap-2 pb-1">
        <motion.button
          type="button"
          aria-label="Send a like"
          className={cn("grid size-16 place-items-center rounded-pill bg-brand-gradient text-brand-foreground transition-[filter] hover:brightness-95", focusRing)}
          whileTap={{ scale: 0.88 }}
          transition={springBouncy}
          onClick={like}
        >
          <motion.span key={sent} className="grid place-items-center" initial={sent ? { scale: 0.7 } : false} animate={{ scale: 1 }} transition={springBouncy}>
            <Heart className="size-7" fill="currentColor" strokeWidth={0} />
          </motion.span>
        </motion.button>
        <p className={caption} aria-live="polite">
          {sent ? `You sent ${sent}` : "Tap to send a like"}
        </p>
      </div>
    </div>
  );
}

/* ── Emoji reaction bar with counts ─────────────────────── */

export function EmojiBar() {
  const counts = useLive((s) => s.counts);
  const [items, done] = useFloaters((e) => e.emoji !== "❤️");
  const [last, setLast] = useState<Emoji | null>(null);

  const send = (e: Emoji) => {
    setLast(e);
    sendReaction(e);
  };

  return (
    <div className="relative flex w-full flex-col self-stretch">
      <FloatLayer items={items} done={done} bottom={64} render={(f) => <span className="text-xl leading-none">{f.emoji}</span>} />
      <div className="relative flex items-center justify-between px-1 pt-0.5">
        <p className={title}>React</p>
        <p className={caption}>{last ? `You sent ${last}` : "Pick one"}</p>
      </div>
      <ul className="relative mt-auto flex flex-wrap justify-center gap-1.5">
        {EMOJIS.map((e) => (
          <li key={e}>
            <button
              type="button"
              aria-label={`${EMOJI_NAMES[e]}, ${counts[e]}`}
              className={cn("flex h-9 items-center gap-1.5 rounded-pill bg-card pr-3 pl-2.5 text-card-foreground transition-[background-color,scale] hover:bg-card/70 active:scale-95", focusRing)}
              onClick={() => send(e)}
            >
              <span className="text-base leading-none" aria-hidden>
                {e}
              </span>
              <span className="text-xs font-semibold" aria-hidden>
                <RollingNumber value={counts[e]} text={compact(counts[e])} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Combo counter ──────────────────────────────────────── */

const COMBO_WINDOW = 700;

export function ComboCounter() {
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(6);
  const lastTap = useRef(0);
  const reset = useRef(0);

  const tap = (real: boolean) => {
    const now = Date.now();
    const next = now - lastTap.current < COMBO_WINDOW ? combo + 1 : 1;
    lastTap.current = now;
    setCombo(next);
    setBest((b) => Math.max(b, next));
    window.clearTimeout(reset.current);
    reset.current = window.setTimeout(() => setCombo(0), COMBO_WINDOW + 500);
    /* Demo taps stay local; only a person's taps count as reactions. */
    if (real) sendReaction("🔥");
  };

  useSequence([
    [1800, () => tap(false)],
    [260, () => tap(false)],
    [240, () => tap(false)],
    [220, () => tap(false)],
    [260, () => tap(false)],
    [240, () => tap(false)],
    [2000, () => tap(false)],
    [300, () => tap(false)],
  ]);

  return (
    <div className={cn(fill, "flex h-12 items-center gap-3")}>
      <Button variant="brand" className="shrink-0 px-3.5" onClick={() => tap(true)}>
        <span aria-hidden>🔥</span> Tap fast
      </Button>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {combo >= 2 ? (
            <motion.output
              key={combo}
              className="text-[26px] leading-none font-bold tracking-tight tabular-nums"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: Math.min(1 + combo * 0.05, 1.35) }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springBouncy}
            >
              ×{combo}
              <span className="sr-only"> combo</span>
            </motion.output>
          ) : (
            <motion.p key="best" className={cn(caption, "truncate")} {...pop}>
              Best ×{best}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Reaction mix ───────────────────────────────────────── */

export function ReactionSummary() {
  const counts = useLive((s) => s.counts);
  const total = EMOJIS.reduce((sum, e) => sum + counts[e], 0);
  const [focus, setFocus] = useState<Emoji | null>(null);
  useEvery(2200, (tick) => setFocus(tick % 6 === 5 ? null : EMOJIS[tick % 6]));
  const share = (e: Emoji) => (total ? (counts[e] / total) * 100 : 0);

  return (
    <div className={cn(fill, "flex flex-col gap-2.5 self-stretch p-1")}>
      <div className="flex items-baseline justify-between">
        <p className={title}>Reaction mix</p>
        <p className={caption}>
          <RollingNumber value={total} text={total.toLocaleString("en-US")} /> total
        </p>
      </div>
      <div className="flex h-7 w-full items-center gap-[3px] overflow-hidden rounded-pill bg-card p-[3px]" role="img" aria-label={EMOJIS.map((e) => `${EMOJI_NAMES[e]} ${Math.round(share(e))}%`).join(", ")}>
        {EMOJIS.map((e) => (
          <span
            key={e}
            className={cn("h-full min-w-1 rounded-[calc(var(--shape-pill)-3px)] transition-[flex-grow,opacity] duration-500 ease-out-expo", focus && focus !== e && "opacity-30")}
            style={{ flexGrow: counts[e], flexBasis: 0, background: EMOJI_COLOR[e] }}
          />
        ))}
      </div>
      <ul className="mt-auto grid grid-cols-3 gap-x-1 gap-y-0.5">
        {EMOJIS.map((e) => (
          <li key={e}>
            <button
              type="button"
              aria-pressed={focus === e}
              aria-label={`${EMOJI_NAMES[e]}, ${Math.round(share(e))} percent`}
              className={cn("flex h-7 w-full items-center gap-1.5 rounded-lg px-1.5 text-xs font-semibold transition-colors hover:bg-card/60", focusRing, focus === e && "bg-card")}
              onClick={() => setFocus((f) => (f === e ? null : e))}
            >
              <span aria-hidden>{e}</span>
              <span aria-hidden className="tabular-nums">{Math.round(share(e))}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
