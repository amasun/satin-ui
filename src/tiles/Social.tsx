import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PersonAvatar, Swap, caption, fill, title } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import { money, people, person } from "@/lib/data";
import { spring, springBouncy, springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Checklist of friends ───────────────────────────────── */

const TOGGLE_ORDER = [3, 4, 0, 1, 2, 4, 0, 3, 1, 2];

export function WhosIn() {
  const id = useId();
  const [inIds, setInIds] = useState(() => new Set(people.slice(0, 3).map((p) => p.id)));
  const toggle = (pid: string) =>
    setInIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(pid)) next.add(pid);
      return next;
    });

  useEvery(1100, (tick) => toggle(people[TOGGLE_ORDER[tick % TOGGLE_ORDER.length]].id));

  return (
    <fieldset className={cn(fill, "p-1")}>
      <legend className={title}>Who's in?</legend>
      <p className={caption} aria-live="polite">
        {inIds.size} of {people.length} friends
      </p>
      <ul className="mt-3">
        {people.map((p) => (
          <li key={p.id} className="flex h-[39px] items-center gap-2.5">
            <PersonAvatar who={p} className="size-5.5" />
            <Label htmlFor={`${id}-${p.id}`} className="h-full flex-1 cursor-pointer text-[13px]">
              {p.name}
            </Label>
            <Checkbox id={`${id}-${p.id}`} checked={inIds.has(p.id)} onCheckedChange={() => toggle(p.id)} />
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/* ── Toast (floats, so it carries elevation) ────────────── */

const TOASTS = [
  { who: "Ava", amount: 18 },
  { who: "Kai", amount: 24 },
  { who: "Noor", amount: 12.5 },
];

export function Toast() {
  const [index, setIndex] = useState(0);
  useEvery(3400, () => setIndex((i) => (i + 1) % TOASTS.length));
  const toast = TOASTS[index];

  return (
    <div className={cn(fill, "flex justify-center")} role="status">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          className="flex h-11.5 items-center gap-2.5 overflow-hidden rounded-pill bg-card pr-4 pl-2.5 whitespace-nowrap text-card-foreground shadow-float"
          initial={{ width: 46, opacity: 0, scale: 0.7 }}
          animate={{ width: "100%", opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -14, filter: "blur(4px)", transition: { duration: 0.22 } }}
          transition={{ ...springSoft, opacity: { duration: 0.2 }, width: { ...springSoft, delay: 0.25 } }}
        >
          <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-brand-gradient text-brand-foreground">
            <Check className="size-3.5" strokeWidth={3.2} />
          </span>
          <motion.span
            className="flex min-w-0 flex-1 items-baseline justify-between gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.3 }}
          >
            <strong className="font-semibold">
              {toast.who} paid you {money(toast.amount)}
            </strong>
            <span className={caption}>now</span>
          </motion.span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Chat thread ────────────────────────────────────────── */

type Message = { id: number; from: string; text: string; typing?: boolean };

const SCRIPT: Message[][] = [
  [{ id: 1, from: "ava", text: "Who's getting dessert?" }],
  [
    { id: 1, from: "ava", text: "Who's getting dessert?" },
    { id: 2, from: "me", text: "On it, mochi for four" },
  ],
  [
    { id: 1, from: "ava", text: "Who's getting dessert?" },
    { id: 2, from: "me", text: "On it, mochi for four" },
    { id: 3, from: "kai", text: "", typing: true },
  ],
  [
    { id: 1, from: "ava", text: "Who's getting dessert?" },
    { id: 2, from: "me", text: "On it, mochi for four" },
    { id: 3, from: "kai", text: "I'll bring matcha ice cream" },
  ],
  [
    { id: 2, from: "me", text: "On it, mochi for four" },
    { id: 3, from: "kai", text: "I'll bring matcha ice cream" },
    { id: 4, from: "ava", text: "Perfect, see you at 8" },
  ],
];
/** How long each beat stays on screen before the next one (starting from beat 1). */
const BEATS = [1100, 1500, 1700, 2600, 1100];

export function Chat() {
  const [beat, setBeat] = useState(1);
  useSequence(BEATS.map((ms, i) => [ms, () => setBeat((i + 2) % SCRIPT.length)] as const));

  return (
    <div className={cn(fill, "flex flex-col justify-center gap-2 self-stretch px-1")} role="log" aria-label="Group chat">
      <AnimatePresence mode="popLayout" initial={false}>
        {SCRIPT[beat].map((m) => {
          const mine = m.from === "me";
          return (
            <motion.div
              key={m.id}
              layout
              className={cn("flex items-center gap-2", mine && "justify-end")}
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.94, transition: { duration: 0.2 } }}
              transition={spring}
            >
              {!mine && <PersonAvatar who={person(m.from)} className="size-5 text-[10px]" />}
              <motion.span
                layout
                className={cn(
                  "inline-flex h-[30px] items-center rounded-pill px-3 text-xs whitespace-nowrap",
                  mine ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground",
                )}
                transition={spring}
              >
                {m.typing ? (
                  <span className="inline-flex gap-[3px]" role="img" aria-label={`${person(m.from).name} is typing`}>
                    {[0, 1, 2].map((i) => (
                      <i key={i} className="size-[5px] animate-typing rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                ) : (
                  <motion.span layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                    {m.text}
                  </motion.span>
                )}
              </motion.span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ── Avatar stack ───────────────────────────────────────── */

export function AvatarStack() {
  const [count, setCount] = useState(3);
  const full = count >= people.length;
  useEvery(1700, () => setCount((c) => (c >= people.length ? 3 : c + 1)));

  return (
    <div className={cn(fill, "text-center")}>
      <AvatarGroup className="mb-3 justify-center -space-x-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {people.slice(0, count).map((p) => (
            <motion.span
              key={p.id}
              layout
              className="inline-flex rounded-full ring-2 ring-tile"
              initial={{ opacity: 0, scale: 0.3, x: 12 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.15 } }}
              transition={springBouncy}
            >
              <PersonAvatar who={p} className="size-7 text-xs" />
            </motion.span>
          ))}
          <motion.span key="add" layout className="inline-flex rounded-pill ring-2 ring-tile" transition={springBouncy}>
            <Button variant="surface" size="icon-xs" aria-label="Add a friend" disabled={full} className="disabled:opacity-100 disabled:[&_svg]:opacity-30" onClick={() => setCount((c) => Math.min(people.length, c + 1))}>
              <Plus strokeWidth={2.8} />
            </Button>
          </motion.span>
        </AnimatePresence>
      </AvatarGroup>
      <p className={title}>Ramen night</p>
      <p className={caption} aria-live="polite">
        <Swap id={count}>{count} people</Swap>
      </p>
    </div>
  );
}
