import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Copy, MessageSquare, Pencil, Pin, PinOff, RefreshCw, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DemoInput, RollingNumber, SlidingThumb, Swap, caption, fill, title, useLayoutScope } from "@/components/kit";
import { useCellActive, useSequence, typeSteps } from "@/lib/autoplay";
import { easeOut, pop, spring, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/* ── Reply action bar ───────────────────────────────────── */

type Vote = "up" | "down" | null;

export function ReplyActions() {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<Vote>(null);
  const [spins, setSpins] = useState(0);
  const [note, setNote] = useState("");

  const doCopy = () => (setCopied(true), setNote("Copied to clipboard"));
  const doVote = (v: Exclude<Vote, null>) => {
    const next = vote === v ? null : v;
    setVote(next);
    setNote(next === "up" ? "Thanks for the thumbs up" : next === "down" ? "Noted, we'll do better" : "");
  };
  const retry = () => (setSpins((n) => n + 1), setNote("Writing a new version"));

  useSequence([
    [1600, doCopy],
    [1500, () => (setCopied(false), setVote("up"), setNote("Thanks for the thumbs up"))],
    [1600, retry],
    [1500, () => (setVote("down"), setNote("Noted, we'll do better"))],
    [1700, () => (setVote(null), setNote(""))],
  ]);

  const icon = "text-muted-foreground hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground";

  return (
    <div className={cn(fill, "flex items-center gap-0.5")} role="toolbar" aria-label="Reply actions">
      <Button variant="ghost" size="icon-sm" aria-label={copied ? "Copied" : "Copy reply"} onClick={doCopy} className={icon}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={copied ? "y" : "n"} className="grid place-items-center" {...pop}>
            {copied ? <Check className="text-brand" strokeWidth={3} /> : <Copy strokeWidth={2.4} />}
          </motion.span>
        </AnimatePresence>
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Retry" onClick={retry} className={icon}>
        <motion.span className="grid place-items-center" animate={{ rotate: spins * 360 }} transition={{ duration: 0.7, ease: easeOut }}>
          <RefreshCw strokeWidth={2.4} />
        </motion.span>
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Good reply" aria-pressed={vote === "up"} onClick={() => doVote("up")} className={icon}>
        <motion.span className="grid place-items-center" animate={vote === "up" ? { rotate: [0, -18, 0], scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.45 }}>
          <ThumbsUp strokeWidth={2.4} className={cn(vote === "up" && "fill-current/20")} />
        </motion.span>
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Bad reply" aria-pressed={vote === "down"} onClick={() => doVote("down")} className={icon}>
        <motion.span className="grid place-items-center" animate={vote === "down" ? { rotate: [0, 18, 0], scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.45 }}>
          <ThumbsDown strokeWidth={2.4} className={cn(vote === "down" && "fill-current/20")} />
        </motion.span>
      </Button>
      <span className={cn(caption, "ml-2 min-w-0 flex-1 truncate")} aria-live="polite">
        <Swap id={note || "none"}>{note}</Swap>
      </span>
    </div>
  );
}

/* ── Branch switcher ────────────────────────────────────── */

const BRANCHES = ["Basil wants light, warmth and a steady drink.", "Short version: sun, damp soil, weekly pinch.", "Think of basil as a sunbather that hates wet feet."];

export function BranchSwitcher() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    setDir(d);
    setIndex((i) => Math.min(BRANCHES.length - 1, Math.max(0, i + d)));
  };

  useSequence([
    [1800, () => go(1)],
    [1800, () => go(1)],
    [1800, () => (setDir(-1), setIndex(0))],
  ]);

  return (
    <div className={cn(fill, "flex items-center gap-2")}>
      <div className="relative h-5 min-w-0 flex-1 overflow-hidden pl-1">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.p
            key={index}
            className="truncate"
            custom={dir}
            initial={{ opacity: 0, x: dir * 24, filter: "blur(3px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: dir * -24, filter: "blur(3px)" }}
            transition={{ duration: 0.3, ease: easeOut }}
          >
            {BRANCHES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      <nav aria-label="Reply versions" className="flex shrink-0 items-center rounded-pill bg-card text-card-foreground">
        <Button variant="ghost" size="icon-sm" aria-label="Previous version" disabled={index === 0} onClick={() => go(-1)}>
          <ChevronLeft strokeWidth={2.6} />
        </Button>
        <span className="w-9 text-center text-xs font-semibold tabular-nums" aria-live="polite">
          <span className="sr-only">Version </span>
          <RollingNumber value={index + 1} />
          <span aria-hidden>/</span>
          <span className="sr-only"> of </span>
          {BRANCHES.length}
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Next version" disabled={index === BRANCHES.length - 1} onClick={() => go(1)}>
          <ChevronRight strokeWidth={2.6} />
        </Button>
      </nav>
    </div>
  );
}

/* ── Feedback form ──────────────────────────────────────── */

const REASONS = ["Not accurate", "Too long", "Missed the point", "Wrong tone"];
const DEMO_NOTE = "The watering tip didn't match my pot.";

export function FeedbackForm() {
  const id = useId();
  const [reasons, setReasons] = useState<Set<string>>(() => new Set());
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const ghost = useCellActive() && text.length > 0 && !sent;

  const toggle = (r: string) =>
    setReasons((prev) => {
      const next = new Set(prev);
      if (!next.delete(r)) next.add(r);
      return next;
    });
  const reset = () => (setSent(false), setReasons(new Set()), setText(""));
  const canSend = reasons.size > 0 || text.trim().length > 0;

  useSequence([
    [1500, () => toggle("Not accurate")],
    [900, () => toggle("Missed the point")],
    ...typeSteps(DEMO_NOTE, setText, 45, 700),
    [900, () => setSent(true)],
    [2400, reset],
  ]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canSend) setSent(true);
  };

  return (
    <div className={cn(fill, "relative h-full")}>
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            role="status"
            className="flex h-full flex-col items-center justify-center gap-2 text-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={spring}
          >
            <motion.span className="grid size-10 place-items-center rounded-full bg-brand-gradient text-brand-foreground" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...springBouncy, delay: 0.1 }}>
              <Check className="size-5" strokeWidth={3} />
            </motion.span>
            <p className={title}>Thanks for telling us</p>
            <p className={caption}>It helps the next reply.</p>
            <Button variant="ghost" size="sm" onClick={reset}>
              Send another
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="flex h-full flex-col gap-2.5"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <fieldset>
              <legend className={cn(title, "mb-2 px-1")}>What went wrong?</legend>
              <div className="flex flex-wrap gap-1.5">
                {REASONS.map((r) => {
                  const on = reasons.has(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(r)}
                      className={cn(
                        ring,
                        "h-7 rounded-pill px-2.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200",
                        on ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground hover:bg-card/70",
                      )}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label htmlFor={id} className="sr-only">
              Tell us more
            </label>
            <div className="relative min-h-0 flex-1">
              <Textarea
                id={id}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell us more (optional)"
                className={cn(
                  "field-sizing-fixed size-full min-h-0 resize-none rounded-xl border-transparent bg-card text-[13px] leading-5 text-card-foreground md:text-[13px] dark:bg-card",
                  ghost && "text-transparent",
                )}
              />
              {ghost && (
                <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden border border-transparent px-2.5 py-2 text-[13px] leading-5 break-words whitespace-pre-wrap">
                  {text}
                  <i className="ml-px inline-block h-[1.1em] w-[1.5px] translate-y-[2px] animate-caret bg-foreground" />
                </span>
              )}
            </div>
            <Button type="submit" variant={canSend ? "brand" : "default"} aria-disabled={!canSend} className="shrink-0">
              Send feedback
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Conversation history ───────────────────────────────── */

type Chat = { id: string; title: string; pinned: boolean };

const CHATS: Chat[] = [
  { id: "basil", title: "Keeping basil alive", pinned: true },
  { id: "trip", title: "Lisbon weekend plan", pinned: false },
  { id: "sql", title: "Slow query on orders", pinned: false },
  { id: "tides", title: "Tides for a 6 year old", pinned: false },
  { id: "plan", title: "Exam study plan", pinned: false },
];

export function HistoryList() {
  const [chats, setChats] = useState(CHATS);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState("basil");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const editRef = useRef<HTMLInputElement>(null);
  const thumb = useLayoutScope("history");

  const togglePin = (id: string) => setChats((list) => list.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  const startRename = (c: Chat, focus: boolean) => {
    setEditing(c.id);
    setDraft(c.title);
    /* Only a person's click moves focus; the demo never steals it. */
    if (focus) requestAnimationFrame(() => editRef.current?.select());
  };
  const commit = () => {
    const name = draft.trim();
    if (editing && name) setChats((list) => list.map((c) => (c.id === editing ? { ...c, title: name } : c)));
    setEditing(null);
  };
  const onEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(null);
  };

  useSequence([
    ...typeSteps("plan", setQuery, 110, 1500),
    [1600, () => setQuery("")],
    [1100, () => togglePin("trip")],
    [1300, () => (setEditing("sql"), setDraft(""))],
    ...typeSteps("Speed up orders query", setDraft, 55, 500),
    [700, commit],
    [1800, () => setChats(CHATS)],
  ]);

  const q = query.trim().toLowerCase();
  const visible = chats.filter((c) => c.title.toLowerCase().includes(q)).sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className={cn(fill, "flex h-full flex-col gap-2")}>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={2.4} />
        <DemoInput value={query} onChange={setQuery} aria-label="Search conversations" placeholder="Search chats" className="h-9 pl-8" />
      </div>
      <ul className="min-h-0 flex-1 overflow-hidden" aria-label="Conversations">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((c) => {
            const on = c.id === current;
            const isEditing = editing === c.id;
            return (
              <motion.li
                key={c.id}
                layout
                className="group/row relative flex h-9 items-center gap-1 rounded-lg pr-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={spring}
              >
                {on && <SlidingThumb id={thumb} className="rounded-lg bg-card" />}
                {isEditing ? (
                  <input
                    ref={editRef}
                    value={draft}
                    aria-label={`Rename ${c.title}`}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onEditKey}
                    onBlur={commit}
                    className="relative h-7 min-w-0 flex-1 rounded-md border border-ring/40 bg-card px-2 text-[13px] text-card-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/20"
                  />
                ) : (
                  <button
                    type="button"
                    aria-current={on ? "page" : undefined}
                    onClick={() => setCurrent(c.id)}
                    onDoubleClick={() => startRename(c, true)}
                    className={cn(ring, "relative flex h-full min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-left", on ? "font-semibold" : "text-foreground/80")}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {c.pinned ? (
                        <motion.span key="pin" {...pop} transition={springBouncy} className="grid place-items-center">
                          <Pin className="size-3.5 shrink-0 fill-current text-foreground" strokeWidth={2.2} />
                        </motion.span>
                      ) : (
                        <motion.span key="chat" {...pop} className="grid place-items-center">
                          <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.2} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <span className="truncate">{c.title}</span>
                    <span className="sr-only">{c.pinned ? " (pinned)" : ""}</span>
                  </button>
                )}
                {!isEditing && (
                  <span className="relative flex shrink-0 gap-0.5 opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100">
                    <button type="button" aria-label={c.pinned ? `Unpin ${c.title}` : `Pin ${c.title}`} onClick={() => togglePin(c.id)} className={cn(ring, "grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-well hover:text-foreground")}>
                      {c.pinned ? <PinOff className="size-3.5" strokeWidth={2.2} /> : <Pin className="size-3.5" strokeWidth={2.2} />}
                    </button>
                    <button type="button" aria-label={`Rename ${c.title}`} onClick={() => startRename(c, true)} className={cn(ring, "grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-well hover:text-foreground")}>
                      <Pencil className="size-3.5" strokeWidth={2.2} />
                    </button>
                  </span>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
        {visible.length === 0 && <li className={cn(caption, "px-2 py-2")}>No chats match "{query}"</li>}
      </ul>
    </div>
  );
}
