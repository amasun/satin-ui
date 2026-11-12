import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, CircleCheck, Lock, StickyNote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner, Swap, fill } from "@/components/kit";
import { useEvery } from "@/lib/autoplay";
import { money } from "@/lib/data";
import { easeOut, springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Status pill: Sending → Sent (read-only status) ─────── */

export function StatusPill() {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (sent) return;
    const t = window.setTimeout(() => setSent(true), 1500);
    return () => window.clearTimeout(t);
  }, [sent]);
  useEvery(4200, () => setSent(false));

  return (
    <motion.div
      layout
      role="status"
      className="flex h-9.5 items-center overflow-hidden rounded-pill bg-primary pr-4 pl-3 text-[13px] font-semibold text-primary-foreground"
      transition={springSoft}
    >
      <Swap id={String(sent)} className="gap-2 whitespace-nowrap">
        {sent ? (
          <span className="grid size-4.5 place-items-center rounded-full bg-brand-gradient text-brand-foreground">
            <Check className="size-3" strokeWidth={3.4} />
          </span>
        ) : (
          <Spinner />
        )}
        {sent ? "Sent" : "Sending"}
      </Swap>
    </motion.div>
  );
}

/* ── Confirmation card ──────────────────────────────────── */

const TRANSFERS = [
  { to: "Ava", amount: 24, note: "Ramen night" },
  { to: "Kai", amount: 18, note: "Drinks" },
];

type Phase = "idle" | "sending" | "sent" | "closed";

export function SendCard() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const transfer = TRANSFERS[index];

  useEffect(() => {
    const next: Partial<Record<Phase, [number, () => void]>> = {
      sending: [900, () => setPhase("sent")],
      sent: [1700, () => setPhase("closed")],
      closed: [650, () => (setIndex((i) => (i + 1) % TRANSFERS.length), setPhase("idle"))],
    };
    const step = next[phase];
    if (!step) return;
    const t = window.setTimeout(step[1], step[0]);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEvery(2600, () => setPhase((p) => (p === "idle" ? "sending" : p)));

  const busy = phase !== "idle";

  return (
    <AnimatePresence mode="wait">
      {phase !== "closed" && (
        <motion.div
          key={index}
          role="group"
          aria-label={`Send to ${transfer.to}`}
          className={cn(fill, "rounded-2xl bg-card p-4 text-card-foreground")}
          initial={{ opacity: 0, scale: 0.94, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <header className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold tracking-tight">Send to {transfer.to}</h3>
            <Button variant="secondary" size="icon-xs" aria-label="Close" onClick={() => setPhase("closed")}>
              <X strokeWidth={2.8} />
            </Button>
          </header>
          <p className="mt-2.5 mb-1.5 flex h-8 items-center gap-2 overflow-hidden rounded-lg bg-muted px-2.5 text-xs whitespace-nowrap">
            <CircleCheck className="size-4 shrink-0 fill-foreground stroke-muted" />
            {transfer.to} gets it instantly, no fee
          </p>
          <dl>
            <div className="flex h-8.5 items-center gap-2.5">
              <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-brand-gradient text-brand-foreground">
                <ArrowUp className="size-3" strokeWidth={3} />
              </span>
              <dt className="flex-1">Amount</dt>
              <dd className="text-muted-foreground">{money(transfer.amount)}</dd>
            </div>
            <div className="flex h-8.5 items-center gap-2.5">
              <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-chart-1 text-white">
                <StickyNote className="size-3" strokeWidth={2.6} />
              </span>
              <dt className="flex-1">Note</dt>
              <dd className="text-muted-foreground">{transfer.note}</dd>
            </div>
          </dl>
          <div className="mt-2.5 flex gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {!busy && (
                <motion.div key="cancel" className="flex-1" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}>
                  <Button variant="secondary" className="w-full" onClick={() => setPhase("closed")}>
                    Cancel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div layout className="flex-1" transition={springSoft}>
              <Button
                variant={busy ? "brand" : "default"}
                className="w-full overflow-hidden disabled:opacity-100"
                disabled={busy}
                onClick={() => setPhase("sending")}
              >
                <Swap id={phase} className="gap-1.5">
                  {phase === "idle" && "Continue"}
                  {phase === "sending" && <Spinner />}
                  {phase === "sent" && (
                    <>
                      <Check strokeWidth={3} /> Sent
                    </>
                  )}
                </Swap>
              </Button>
            </motion.div>
          </div>
          <span role="status" className="sr-only">
            {phase === "sent" ? `Sent ${money(transfer.amount)} to ${transfer.to}` : ""}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Pay button: label → spinner → check ────────────────── */

type PayPhase = "idle" | "loading" | "done";

export function PayButton({ amount = 24 }: { amount?: number }) {
  const [phase, setPhase] = useState<PayPhase>("idle");

  useEffect(() => {
    if (phase === "idle") return;
    const t = window.setTimeout(() => setPhase(phase === "loading" ? "done" : "idle"), phase === "loading" ? 1300 : 1500);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEvery(2400, () => setPhase((p) => (p === "idle" ? "loading" : p)));

  return (
    <motion.div className="h-11" animate={{ width: phase === "idle" ? 224 : 44 }} transition={springSoft}>
      <Button
        size="lg"
        variant={phase === "done" ? "brand" : "default"}
        className="w-full overflow-hidden px-0 aria-busy:pointer-events-none"
        aria-busy={phase !== "idle"}
        onClick={() => setPhase((p) => (p === "idle" ? "loading" : p))}
      >
        <Swap id={phase} className="gap-2 whitespace-nowrap">
          {phase === "idle" && (
            <>
              <Lock className="size-3.5" strokeWidth={2.6} /> Pay {money(amount)}
            </>
          )}
          {phase === "loading" && <Spinner className="size-4.5" />}
          {phase === "done" && <Check className="size-5" strokeWidth={3} />}
        </Swap>
        <span role="status" className="sr-only">
          {phase === "loading" ? "Processing payment" : phase === "done" ? "Payment complete" : ""}
        </span>
      </Button>
    </motion.div>
  );
}
