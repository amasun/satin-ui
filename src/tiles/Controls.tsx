import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Check, Ellipsis, Info, Percent, Plus, Share } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RollingNumber, caption, fill, title } from "@/components/kit";
import { useCellActive, useEvery, useSequence } from "@/lib/autoplay";
import { pop, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Icon action cluster ────────────────────────────────── */

export function Actions() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(2);

  useSequence([
    [1900, () => setOpen(true)],
    [1300, () => setUnread((n) => (n >= 9 ? 1 : n + 1))],
    [1700, () => setOpen(false)],
    [1500, () => setUnread((n) => Math.max(1, n - 1))],
  ]);

  return (
    <div className="grid grid-cols-[repeat(2,--spacing(10))] gap-3.5">
      <Button size="icon-lg" aria-label={open ? "Close menu" : "New expense"} aria-pressed={open} onClick={() => setOpen((o) => !o)}>
        <motion.span className="grid place-items-center" animate={{ rotate: open ? 135 : 0 }} transition={springBouncy}>
          <Plus strokeWidth={2.6} />
        </motion.span>
      </Button>
      <Button variant="surface" size="icon-lg" aria-label="Share">
        <Share className="size-3.5!" strokeWidth={2.6} />
      </Button>
      <Button variant="surface" size="icon-lg" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} onClick={() => setUnread(0)}>
        <motion.span key={unread} className="grid place-items-center" animate={unread ? { rotate: [0, -16, 12, -6, 0] } : {}} transition={{ duration: 0.5 }}>
          <Bell className="size-3.5!" strokeWidth={2.6} />
        </motion.span>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span className="absolute -top-1.5 -right-1.5" {...pop} transition={springBouncy}>
              <Badge className="h-[18px] min-w-[18px] border-2 border-tile bg-destructive px-1 text-[10px] leading-none font-bold text-white">
                <RollingNumber value={unread} />
              </Badge>
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
      <Button variant="surface" size="icon-lg" aria-label="More">
        <Ellipsis strokeWidth={2.6} />
      </Button>
    </div>
  );
}

/* ── Setting switches ───────────────────────────────────── */

export function Toggles() {
  const id = useId();
  const [remind, setRemind] = useState(true);
  const [tip, setTip] = useState(false);

  useSequence([
    [1500, () => setTip((v) => !v)],
    [1300, () => setRemind((v) => !v)],
    [1700, () => setRemind((v) => !v)],
  ]);

  const rows = [
    { key: "remind", Icon: Bell, tint: "bg-chart-3", label: "Remind friends", hint: "Every evening until paid", checked: remind, set: setRemind },
    { key: "tip", Icon: Percent, tint: "bg-chart-1", label: "Add tip automatically", hint: "18% on every split", checked: tip, set: setTip },
  ];

  return (
    <div className={cn(fill, "divide-y rounded-2xl bg-card px-3.5 text-card-foreground")}>
      {rows.map(({ key, Icon, tint, label, hint, checked, set }) => (
        <div key={key} className="flex h-[54px] items-center gap-2.5">
          <span className={cn("grid size-5.5 shrink-0 place-items-center rounded-full text-white", tint)}>
            <Icon className="size-3" strokeWidth={2.8} />
          </span>
          <Label htmlFor={`${id}-${key}`} className="min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 self-stretch justify-center text-[13px] leading-tight">
            <span className="w-full truncate font-semibold">{label}</span>
            <span className={cn(caption, "w-full truncate font-medium")}>{hint}</span>
          </Label>
          <Switch id={`${id}-${key}`} checked={checked} onCheckedChange={set} />
        </div>
      ))}
    </div>
  );
}

/* ── Tooltip ────────────────────────────────────────────── */

/** Opens only on hover or focus; the demo never pops it. */
export function TooltipDemo() {
  return (
    <div className="text-center">
      <p className={title}>Total</p>
      <p className={cn(caption, "mb-3")}>Hover for details</p>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="surface" size="icon-sm" aria-label="About this total" className="mx-auto">
            <Info strokeWidth={2.8} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8} className="max-w-[124px] justify-center text-center">
          Includes 18% tip and tax
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/* ── Step list ──────────────────────────────────────────── */

const STEPS = ["Add friends", "Check amounts", "Send requests"];

export function Steps() {
  /** Index of the current step; STEPS.length means everything is done. */
  const [current, setCurrent] = useState(1);
  useEvery(1900, () => setCurrent((c) => (c + 1) % (STEPS.length + 1)));
  const done = current >= STEPS.length;

  return (
    <div className={cn(fill, "p-1")}>
      <h3 className={title} aria-live="polite">
        {done ? "All done" : `Step ${current + 1} of ${STEPS.length}`}
      </h3>
      <ol className="mt-2">
        {STEPS.map((step, i) => {
          const state = i < current ? "done" : i === current ? "current" : "todo";
          return (
            <li key={step}>
              <button
                type="button"
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex h-7 w-full items-center gap-2 rounded-md text-left text-xs font-semibold whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  state === "todo" && "text-muted-foreground",
                )}
                onClick={() => setCurrent(state === "done" ? i : i + 1)}
              >
                <span
                  className={cn(
                    "relative grid size-4 shrink-0 place-items-center rounded-full text-brand-foreground transition-colors duration-300",
                    state === "todo" ? "bg-foreground/10" : "bg-brand-gradient",
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {state === "done" && (
                      <motion.span key="done" className="grid place-items-center" {...pop} transition={springBouncy}>
                        <Check className="size-2.5" strokeWidth={4} />
                      </motion.span>
                    )}
                    {state === "current" && <motion.i key="current" className="size-1.5 rounded-full bg-brand-foreground" {...pop} transition={springBouncy} />}
                  </AnimatePresence>
                </span>
                {step}
                <span className="sr-only">{state === "done" ? " (done)" : state === "current" ? " (current)" : ""}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Slider ─────────────────────────────────────────────── */

const TIP_DEMO = [28, 6, 24, 10, 18];

export function TipSlider() {
  const id = useId();
  const demo = useCellActive();
  const [value, setValue] = useState(18);
  useEvery(2200, (tick) => setValue(TIP_DEMO[tick % TIP_DEMO.length]));

  return (
    <div className={cn(fill, "px-1.5")}>
      <div className="mb-1.5 flex justify-between font-semibold">
        <span id={id}>Tip</span>
        <output>
          <RollingNumber value={value} text={`${value}%`} />
        </output>
      </div>
      <Slider
        min={0}
        max={30}
        step={1}
        value={[value]}
        onValueChange={([v]) => setValue(v)}
        aria-labelledby={id}
        /* Glide while the demo drives it; track the pointer exactly when a person does. */
        className={cn(
          "h-5",
          demo && "[&_[data-slot=slider-range]]:transition-[right] [&_[data-slot=slider-range]]:duration-500 [&_[data-slot=slider-range]]:ease-out-expo [&>span]:transition-[left] [&>span]:duration-500 [&>span]:ease-out-expo",
        )}
      />
    </div>
  );
}

/* ── Accordion ──────────────────────────────────────────── */

const FAQ = [
  { q: "Who paid for what?", a: "Ava paid $96, everyone owes her $24." },
  { q: "Can I pay later?", a: "Yes, settle up any time this week." },
  { q: "How do reminders work?", a: "Every evening at 7 until it's paid." },
];

export function Faq() {
  const [open, setOpen] = useState("0");
  useEvery(2600, () => setOpen((o) => String((Number(o || -1) + 1) % FAQ.length)));

  return (
    <Accordion type="single" collapsible value={open} onValueChange={setOpen} className={cn(fill, "rounded-2xl bg-card px-3.5 py-0.5 text-card-foreground")}>
      {FAQ.map((item, i) => (
        <AccordionItem key={item.q} value={String(i)}>
          <AccordionTrigger className="py-2 text-[12.5px]">{item.q}</AccordionTrigger>
          <AccordionContent className="truncate pb-2.5 text-xs text-muted-foreground">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
