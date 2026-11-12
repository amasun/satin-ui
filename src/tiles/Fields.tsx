import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoInput, fill } from "@/components/kit";
import { typeSteps, useSequence } from "@/lib/autoplay";
import { pop, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Search with live result count ──────────────────────── */

const INDEX = ["Ava", "Ava's birthday", "Ramen night at Ava's", "Kai", "Coffee with Kai", "Noor", "Juno", "Theo", "Drinks", "Brunch"];

export function SearchField() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const count = q.length >= 2 ? INDEX.filter((item) => item.toLowerCase().includes(q)).length : null;

  useSequence([...typeSteps("Ava", setQuery, 150, 900), [2600, () => setQuery("")]]);

  return (
    <div className={cn(fill, "relative flex items-center")} role="search">
      <Search className="pointer-events-none absolute left-4 z-10 size-4 text-muted-foreground" strokeWidth={2.4} />
      <DemoInput type="search" value={query} onChange={setQuery} aria-label="Search friends or bills" placeholder="Search friends or bills" className="pr-28 pl-10" />
      <AnimatePresence>
        {count !== null && (
          <motion.span className="absolute right-1.5" role="status" {...pop}>
            <Badge variant={count ? "brand" : "secondary"} className="h-8 px-3">
              {count === 0 ? "No results" : `${count} result${count === 1 ? "" : "s"}`}
            </Badge>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Text field with inline validation ──────────────────── */

export function TitleField() {
  const [value, setValue] = useState("");
  /* Validate once typing settles, the way a real form would. */
  const [settled, setSettled] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(value), 420);
    return () => window.clearTimeout(t);
  }, [value]);
  const checked = settled === value && value.length > 0;
  const valid = checked && value.trim().length >= 3;

  useSequence([...typeSteps("Ramen night at Ava's", setValue, 75, 800), [2400, () => setValue("")]]);

  return (
    <div className={cn(fill, "relative flex items-center")}>
      <DemoInput value={value} onChange={setValue} aria-label="Bill name" placeholder="Name this bill" aria-invalid={checked && !valid} className="pr-11" />
      <AnimatePresence>
        {valid && (
          <motion.span
            className="absolute right-2.5 grid size-6 place-items-center rounded-full bg-brand-gradient text-brand-foreground"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={springBouncy}
          >
            <Check className="size-3.5" strokeWidth={3} />
            <span className="sr-only">Looks good</span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Message composer ───────────────────────────────────── */

const PHRASES = ["On my way!", "Table for 4 at 8?", "Tab's on me"];

export function Composer() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState<{ id: number; text: string } | null>(null);
  const ready = value.trim().length > 0;
  const latest = useRef(value);
  latest.current = value;

  const send = () => {
    const text = latest.current.trim();
    if (!text) return;
    setSent({ id: Date.now(), text });
    setValue("");
  };

  useSequence(PHRASES.flatMap((phrase) => [...typeSteps(phrase, setValue, 80, 1500), [800, send] as const]));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  return (
    <form className={cn(fill, "relative flex items-center")} onSubmit={onSubmit}>
      <DemoInput value={value} onChange={setValue} aria-label="Message" placeholder={sent ? "" : "Message Ramen night"} className="pr-12" />
      <AnimatePresence>
        {sent && (
          <motion.span
            key={sent.id}
            aria-hidden
            className="pointer-events-none absolute top-1.5 left-2 flex h-8 items-center rounded-pill bg-primary px-3 text-xs whitespace-nowrap text-primary-foreground"
            initial={{ opacity: 0, scale: 0.85, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: 1, y: [0, 0, -6, -34] }}
            transition={{ duration: 1.1, times: [0, 0.15, 0.6, 1], ease: "easeInOut" }}
            onAnimationComplete={() => setSent(null)}
          >
            {sent.text}
          </motion.span>
        )}
      </AnimatePresence>
      {/* Stays enabled-looking but inert when empty, so the control never vanishes. */}
      <Button type="submit" size="icon-sm" variant={ready ? "brand" : "default"} aria-label="Send message" aria-disabled={!ready} className="absolute right-1.5">
        <ArrowUp strokeWidth={2.8} />
      </Button>
    </form>
  );
}
