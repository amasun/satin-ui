import { useId, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, Hand, Pin, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoInput, PersonAvatar, RollingNumber, caption, fill, title } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import type { Person } from "@/lib/data";
import { easeOut, pop, spring, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ME, focusRing } from "./shared";

const crowd = (name: string, n: number): Person => ({ id: name.toLowerCase(), name, color: `var(--chart-${(n % 5) + 1})` });

/* ── Live poll ──────────────────────────────────────────── */

const OPTIONS = ["Theme switching", "New charts", "Faster builds"];

export function LivePoll() {
  const labelId = useId();
  const [votes, setVotes] = useState([118, 84, 61]);
  const [mine, setMine] = useState<number | null>(null);
  const total = votes.reduce((a, b) => a + b, 0) + (mine === null ? 0 : 1);

  useEvery(900, (tick) => {
    const weights = [0.46, 0.32, 0.22];
    let r = Math.random();
    const pick = weights.findIndex((w) => (r -= w) <= 0);
    setVotes((v) => v.map((n, i) => (i === (pick < 0 ? 0 : pick) ? n + 1 + (tick % 3 === 0 ? 1 : 0) : n)));
    if (tick % 14 === 6) setMine(1);
    if (tick % 14 === 13) setMine(null);
  });

  return (
    <div role="group" aria-labelledby={labelId} className={cn(fill, "flex flex-col gap-2 self-stretch p-1")}>
      <p id={labelId} className={cn(title, "line-clamp-2 leading-snug")}>
        Which launch are you most excited about?
      </p>
      <p className={caption}>
        <RollingNumber value={total} /> votes, poll is open
      </p>
      <ul className="mt-auto flex flex-col gap-1.5">
        {OPTIONS.map((label, i) => {
          const count = votes[i] + (mine === i ? 1 : 0);
          const pct = Math.round((count / total) * 100);
          const chosen = mine === i;
          return (
            <li key={label}>
              <button
                type="button"
                aria-pressed={chosen}
                aria-label={`${label}, ${pct}%`}
                className={cn("relative flex h-10 w-full items-center gap-2 overflow-hidden rounded-xl bg-card px-3 text-left text-card-foreground", focusRing)}
                onClick={() => setMine((m) => (m === i ? null : i))}
              >
                <span
                  aria-hidden
                  className={cn("absolute inset-y-0 left-0 w-full origin-left transition-transform duration-700 ease-out-expo", chosen ? "bg-brand-soft" : "bg-foreground/6")}
                  style={{ transform: `scaleX(${pct / 100})` }}
                />
                <span className="relative min-w-0 flex-1 truncate font-semibold">{label}</span>
                <AnimatePresence>
                  {chosen && (
                    <motion.span className="relative grid size-4 place-items-center rounded-full bg-brand-gradient text-brand-foreground" {...pop} transition={springBouncy}>
                      <Check className="size-2.5" strokeWidth={4} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="relative w-9 text-right text-xs font-semibold tabular-nums" aria-hidden>
                  {pct}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Scrolling comments ─────────────────────────────────── */

type Comment = { id: number; who: Person; text: string };

const CHATTER: Array<[string, string]> = [
  ["Noor", "Hello from Lisbon!"],
  ["Kai", "That theme switch is so smooth"],
  ["Mila", "Will the recording be up later?"],
  ["Ezra", "Dark mode looks great"],
  ["Iris", "Joining late, what did I miss?"],
  ["Leo", "The soft corners are my favourite"],
  ["Sana", "Can we get the slides?"],
  ["Omar", "Love the charts"],
  ["Yuki", "Greetings from Osaka"],
  ["Rosa", "This is exactly what we needed"],
];
const VISIBLE = 6;

export function Comments() {
  const [list, setList] = useState<Comment[]>(() =>
    CHATTER.slice(0, 4).map(([name, text], i) => ({ id: i, who: crowd(name, i), text })),
  );
  const [draft, setDraft] = useState("");
  const add = (who: Person, text: string) => setList((l) => [...l, { id: (l[l.length - 1]?.id ?? 0) + 1, who, text }].slice(-VISIBLE));

  useEvery(1900, (tick) => {
    const n = (tick + 4) % CHATTER.length;
    const [name, text] = CHATTER[n];
    add(crowd(name, n), text);
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    add(ME, text);
    setDraft("");
  };

  return (
    <div className="flex w-full flex-col gap-2.5 self-stretch">
      <ul role="log" aria-label="Comments" aria-live="polite" className="flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-hidden px-1">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((c) => (
            <motion.li
              key={c.id}
              layout
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ ...spring, opacity: { duration: 0.25, ease: easeOut } }}
            >
              <PersonAvatar who={c.who} className="mt-0.5 size-6" />
              <p className="min-w-0 flex-1 leading-snug">
                <span className={cn("block text-xs font-semibold", c.who.id === ME.id ? "text-foreground" : "text-muted-foreground")}>{c.who.name}</span>
                <span className="block truncate">{c.text}</span>
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <form className="flex items-center gap-1.5" onSubmit={submit}>
        <DemoInput value={draft} onChange={setDraft} placeholder="Say something…" aria-label="Write a comment" maxLength={80} className="h-9.5 bg-card" />
        <Button type="submit" variant="brand" size="icon" aria-label="Send comment" disabled={!draft.trim()}>
          <SendHorizontal strokeWidth={2.4} />
        </Button>
      </form>
    </div>
  );
}

/* ── Q&A with the top question pinned ───────────────────── */

type Question = { id: string; who: string; text: string; votes: number };

const QUESTIONS: Question[] = [
  { id: "q1", who: "Mila", text: "Will the recording be available after the event?", votes: 42 },
  { id: "q2", who: "Omar", text: "Can I bring my own colour palette?", votes: 37 },
  { id: "q3", who: "Iris", text: "Is there a Figma library to match?", votes: 29 },
  { id: "q4", who: "Leo", text: "How does it handle right-to-left text?", votes: 18 },
];

export function QnA() {
  const [questions, setQuestions] = useState(QUESTIONS);
  const [upvoted, setUpvoted] = useState<Set<string>>(() => new Set());

  const bump = (id: string, by: number) => setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, votes: q.votes + by } : q)));
  const toggle = (id: string) => {
    const on = upvoted.has(id);
    setUpvoted((prev) => {
      const next = new Set(prev);
      if (on) next.delete(id);
      else next.add(id);
      return next;
    });
    bump(id, on ? -1 : 1);
  };

  /* Demo: votes trickle in, mostly to the runners-up, so the pin changes hands. */
  useSequence([
    [1300, () => bump("q2", 3)],
    [1300, () => bump("q3", 4)],
    [1300, () => bump("q2", 4)],
    [1500, () => bump("q4", 6)],
    [1300, () => bump("q3", 6)],
    [1600, () => setQuestions(QUESTIONS)],
  ]);

  const sorted = [...questions].sort((a, b) => b.votes - a.votes);

  return (
    <div className="flex w-full flex-col gap-2 self-stretch">
      <div className="flex items-baseline justify-between px-1 pt-0.5">
        <p className={title}>Questions</p>
        <p className={caption}>Most votes first</p>
      </div>
      <ol className="flex flex-col gap-1">
        {sorted.map((q, i) => {
          const on = upvoted.has(q.id);
          const pinned = i === 0;
          return (
            <motion.li
              key={q.id}
              layout
              transition={spring}
              className={cn("flex items-center gap-2.5 rounded-xl px-3 py-1.5", pinned ? "bg-brand-soft" : "bg-well")}
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 leading-snug font-semibold">{q.text}</p>
                <p className={cn(caption, "mt-0.5 flex items-center gap-1")}>
                  {pinned && (
                    <>
                      <Pin className="size-3" strokeWidth={2.6} aria-hidden />
                      <span>Pinned,</span>
                    </>
                  )}
                  <span className="truncate">{q.who}</span>
                </p>
              </div>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`Upvote, ${q.votes} votes`}
                className={cn(
                  "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-pill text-xs font-semibold transition-colors",
                  on ? "bg-brand-gradient text-brand-foreground" : "bg-card text-card-foreground hover:bg-card/70",
                  focusRing,
                )}
                onClick={() => toggle(q.id)}
              >
                <ArrowUp className="size-3.5" strokeWidth={2.8} aria-hidden />
                <RollingNumber value={q.votes} />
              </button>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Raise-hand queue ───────────────────────────────────── */

const WAITING = ["Rosa", "Finn", "Zara", "Nico", "Yuki", "Theo"];

export function RaiseHand() {
  const [queue, setQueue] = useState<string[]>(["Rosa", "Finn"]);
  const raised = queue.includes("me");
  const position = queue.indexOf("me") + 1;
  const up = position === 1;

  const refill = (q: string[]) => {
    const next = [...q];
    for (const name of WAITING) if (next.length < 3 && !next.includes(name)) next.push(name);
    return next;
  };
  const toggle = () => setQueue((q) => (q.includes("me") ? refill(q.filter((x) => x !== "me")) : [...q, "me"]));
  const advance = () => setQueue((q) => (q[0] === "me" ? q : q.slice(1)));

  useSequence([
    [1600, () => setQueue((q) => (q.includes("me") ? q : [...q, "me"]))],
    [1700, advance],
    [1700, advance],
    [2600, () => setQueue((q) => refill(q.filter((x) => x !== "me")))],
    [1400, advance],
  ]);

  const status = up ? "You're up, go ahead and speak" : raised ? `You're number ${position} in line` : `${queue.length} waiting to speak`;

  return (
    <div className={cn(fill, "flex flex-col gap-2 self-stretch p-1")}>
      <div>
        <p className={title}>Speaker queue</p>
        <p className={caption} aria-live="polite">
          {status}
        </p>
      </div>
      <ol className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {queue.slice(0, 3).map((id, i) => {
            const me = id === "me";
            const who = me ? ME : crowd(id, WAITING.indexOf(id));
            return (
              <motion.li
                key={id}
                layout
                className={cn("flex h-9 items-center gap-2.5 rounded-xl px-2.5", me && i === 0 ? "bg-brand-gradient text-brand-foreground" : me ? "bg-card" : "")}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                transition={spring}
              >
                <span className={cn("w-4 text-center text-xs font-semibold tabular-nums", !(me && i === 0) && "text-muted-foreground")}>{i + 1}</span>
                <PersonAvatar who={who} className="size-6" />
                <span className="min-w-0 flex-1 truncate font-semibold">{who.name}</span>
                {i === 0 && <span className={cn("text-xs font-semibold", !me && "text-muted-foreground")}>{me ? "You're up" : "Speaking next"}</span>}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      <Button variant={raised ? "secondary" : "brand"} aria-pressed={raised} onClick={toggle} className="w-full">
        <motion.span key={String(raised)} className="grid place-items-center" initial={{ rotate: raised ? -20 : 0 }} animate={{ rotate: 0 }} transition={springBouncy}>
          <Hand className="size-4" strokeWidth={2.4} />
        </motion.span>
        {up ? "Done speaking" : raised ? "Lower hand" : "Raise hand"}
      </Button>
    </div>
  );
}
