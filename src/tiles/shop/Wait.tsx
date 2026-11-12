import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, BellRing, Check, Copy, Heart, Home, MapPinned, Package, PackageCheck, RefreshCw, Search, ShoppingBag, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoInput, RollingNumber, SlidingThumb, Spinner, Swap, caption, fill, title, useLayoutScope } from "@/components/kit";
import { typeSteps, useEvery, useSequence } from "@/lib/autoplay";
import { easeOut, pop, spring, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/* ── Order progress ─────────────────────────────────────── */

const STAGES = [
  { label: "Ordered", note: "Nov 11", Icon: Check },
  { label: "Shipped", note: "Nov 12", Icon: Package },
  { label: "Out for delivery", note: "Nov 13", Icon: Truck },
  { label: "Delivered", note: "Nov 13", Icon: PackageCheck },
];
const ETA = ["Arrives Thu, Nov 14", "Arrives Wed, Nov 13", "Arriving today by 6 pm", "Delivered today, 2:14 pm"];

export function OrderProgress() {
  const [step, setStep] = useState(1);
  useSequence([
    [1800, () => setStep(2)],
    [1800, () => setStep(3)],
    [2600, () => setStep(0)],
    [1600, () => setStep(1)],
  ]);

  return (
    <div className={cn(fill, "max-w-[460px]")}>
      <div className="mb-4 flex items-baseline justify-between gap-3 px-1">
        <p className="text-[15px] font-semibold tracking-tight">Order #BK-2041</p>
        <p className={cn(caption, "truncate")} aria-live="polite">
          <Swap id={step}>{ETA[step]}</Swap>
        </p>
      </div>
      <ol className="relative grid grid-cols-4">
        <span aria-hidden className="absolute top-[17px] right-[12.5%] left-[12.5%] h-1 rounded-full bg-foreground/10">
          <motion.span className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient" animate={{ width: `${(step / (STAGES.length - 1)) * 100}%` }} transition={{ duration: 0.7, ease: easeOut }} />
        </span>
        {STAGES.map(({ label, note, Icon }, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li key={label} className="flex justify-center">
              <button
                type="button"
                aria-current={state === "current" ? "step" : undefined}
                onClick={() => setStep(i)}
                className={cn("flex w-full flex-col items-center gap-1.5 rounded-xl pb-1 text-center", ring)}
              >
                <span
                  className={cn(
                    "relative grid size-9 place-items-center rounded-full transition-colors duration-300",
                    state === "todo" ? "bg-well text-muted-foreground" : "bg-brand-gradient text-brand-foreground",
                  )}
                >
                  {state === "current" && step < STAGES.length - 1 && (
                    <motion.i aria-hidden className="absolute inset-0 rounded-full bg-brand/40" animate={{ scale: [1, 1.5], opacity: [0.7, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />
                  )}
                  <Icon className="relative size-4" strokeWidth={2.4} />
                </span>
                <span className={cn("max-w-full truncate px-1 text-xs font-semibold transition-colors", state === "todo" && "text-muted-foreground")}>{label}</span>
                <span className={cn(caption, "-mt-1 text-[11px]")}>{state === "todo" ? "Pending" : note}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Shipping timeline ──────────────────────────────────── */

const EVENTS = [
  { label: "Label created", where: "Portland, OR", time: "Nov 11, 9:02" },
  { label: "Picked up by courier", where: "Portland, OR", time: "Nov 11, 16:40" },
  { label: "At sorting hub", where: "Sacramento, CA", time: "Nov 12, 5:18" },
  { label: "Out for delivery", where: "Oakland, CA", time: "Nov 13, 8:05" },
  { label: "Delivered", where: "Left at front door", time: "Nov 13, 14:12" },
];

export function ShippingTimeline() {
  const [count, setCount] = useState(3);
  const [copied, setCopied] = useState(false);
  const refresh = () => setCount((c) => (c >= EVENTS.length ? 2 : c + 1));
  useSequence([
    [1900, refresh],
    [1600, () => setCopied(true)],
    [1900, () => (refresh(), setCopied(false))],
    [2400, () => setCount(2)],
    [1600, refresh],
  ]);
  const shown = EVENTS.slice(0, count).reverse().slice(0, 4);

  const copy = () => {
    void navigator.clipboard?.writeText("BK77412209").catch(() => {});
    setCopied(true);
  };

  return (
    <div className={cn(fill, "flex flex-col self-stretch")}>
      <div className="flex items-center gap-2 px-1">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[15px] font-semibold tracking-tight">Tracking</p>
          <button type="button" onClick={copy} className={cn(caption, "inline-flex items-center gap-1 rounded-md font-mono hover:text-foreground", ring)} aria-label="Copy tracking number BK 7741 2209">
            BK 7741 2209
            <Swap id={copied ? "y" : "n"}>{copied ? <Check className="size-3 text-chart-2" strokeWidth={3} /> : <Copy className="size-3" strokeWidth={2.4} />}</Swap>
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? "Tracking number copied" : ""}
          </span>
        </div>
        <Button variant="surface" size="icon-sm" aria-label="Check for updates" onClick={refresh}>
          <motion.span key={count} className="grid place-items-center" initial={{ rotate: -180 }} animate={{ rotate: 0 }} transition={{ duration: 0.5, ease: easeOut }}>
            <RefreshCw strokeWidth={2.6} />
          </motion.span>
        </Button>
      </div>
      <ol className="mt-3 flex-1" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((e, i) => {
            const latest = i === 0;
            return (
              <motion.li
                key={e.label}
                layout
                initial={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={spring}
                className="relative flex h-[42px] gap-3 px-1"
              >
                <span className="relative flex w-3 shrink-0 justify-center pt-1">
                  <i className={cn("relative z-[1] size-3 rounded-full", latest ? "bg-brand-gradient ring-4 ring-brand/20" : "border-2 border-foreground/25 bg-tile")} />
                  {i < shown.length - 1 && <i aria-hidden className="absolute top-4 bottom-[-4px] w-0.5 rounded-full bg-foreground/12" />}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className={cn("truncate", latest ? "font-semibold" : "text-muted-foreground")}>{e.label}</p>
                  <p className={cn(caption, "truncate")}>
                    {e.where} · {e.time}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}

/* ── Limited-time countdown ─────────────────────────────── */

const START = 2 * 3600 + 14 * 60 + 37;
const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown() {
  const [left, setLeft] = useState(START);
  const [remind, setRemind] = useState(false);
  useEvery(1000, () => setLeft((s) => (s <= 0 ? START : s - 1)));
  const parts = [
    { value: Math.floor(left / 3600), unit: "hours" },
    { value: Math.floor((left % 3600) / 60), unit: "min" },
    { value: left % 60, unit: "sec" },
  ];

  return (
    <div className="flex size-full min-w-0 flex-col">
      <p className={cn(title, "flex items-center gap-1.5")}>
        <span className="size-1.5 animate-pulse rounded-full bg-chart-3" aria-hidden /> Flash sale
      </p>
      <p className={cn(caption, "truncate")}>25% off, ends in</p>
      <div className="mt-2.5 flex flex-col gap-1" role="timer" aria-label={`Sale ends in ${parts[0].value} hours ${parts[1].value} minutes`}>
        {parts.map((p) => (
          <div key={p.unit} className="flex h-10 items-center justify-between rounded-xl bg-card px-3 text-card-foreground" aria-hidden>
            <span className="text-xl font-semibold tracking-tight">
              <RollingNumber value={p.value} text={pad(p.value)} />
            </span>
            <span className={caption}>{p.unit}</span>
          </div>
        ))}
      </div>
      <Button variant={remind ? "brand" : "secondary"} size="sm" className="mt-auto w-full" aria-pressed={remind} onClick={() => setRemind((r) => !r)}>
        <Swap id={remind ? "on" : "off"}>
          {remind ? <BellRing className="mr-1 size-3.5" strokeWidth={2.6} /> : <Bell className="mr-1 size-3.5" strokeWidth={2.6} />}
          {remind ? "Reminder set" : "Remind me"}
        </Swap>
      </Button>
    </div>
  );
}

/* ── Back-in-stock notification ─────────────────────────── */

export function NotifyMe() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const submit = (value = email) => {
    const ok = /^\S+@\S+\.\S+$/.test(value);
    setError(!ok);
    setDone(ok);
  };
  const reset = () => (setDone(false), setEmail(""), setError(false));

  useSequence([
    ...typeSteps("jo@mail.com", setEmail, 80, 1200),
    [600, () => submit("jo@mail.com")],
    [2600, reset],
  ]);

  return (
    <div className="w-full min-w-0">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" className="flex flex-col items-center text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={spring}>
            <motion.span className="grid size-10 place-items-center rounded-full bg-brand-gradient text-brand-foreground" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...springBouncy, delay: 0.1 }}>
              <BellRing className="size-4.5" strokeWidth={2.4} />
            </motion.span>
            <p className={cn(title, "mt-2")} role="status">
              You're on the list
            </p>
            <p className={cn(caption, "max-w-full truncate")}>{email}</p>
            <Button variant="link" size="sm" className="mt-0.5 h-6 px-0" onClick={reset}>
              Undo
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="flex flex-col gap-1.5"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: easeOut }}
            onSubmit={(e) => (e.preventDefault(), submit())}
          >
            <p className={title}>Sage mug</p>
            <p className={cn(caption, "-mt-1.5 mb-0.5 truncate")} id={`${id}-hint`}>
              {error ? <span className="text-destructive">Check the email</span> : "Sold out. Get an email"}
            </p>
            <label htmlFor={id} className="sr-only">
              Email
            </label>
            <DemoInput
              id={id}
              type="email"
              value={email}
              onChange={(v) => (setEmail(v), setError(false))}
              placeholder="Email"
              aria-invalid={error || undefined}
              aria-describedby={`${id}-hint`}
              className="h-9 px-3 text-xs md:text-xs"
            />
            <Button type="submit" size="sm" className="w-full">
              Notify me
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Payment success ────────────────────────────────────── */

type PayPhase = "idle" | "busy" | "done";

export function PaymentSuccess() {
  const [phase, setPhase] = useState<PayPhase>("idle");
  useSequence([
    [1800, () => setPhase("busy")],
    [1500, () => setPhase("done")],
    [2800, () => setPhase("idle")],
  ]);

  return (
    <div className="flex w-full flex-col items-center text-center" aria-live="polite">
      <div className="relative grid size-14 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "done" ? (
            <motion.span key="done" className="relative grid size-14 place-items-center" {...pop}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return (
                  <motion.i
                    key={i}
                    aria-hidden
                    className="absolute top-1/2 left-1/2 size-1.5 rounded-full"
                    style={{ background: `var(--chart-${(i % 4) + 1})` }}
                    initial={{ x: "-50%", y: "-50%", opacity: 1 }}
                    animate={{ x: `calc(-50% + ${Math.cos(a) * 40}px)`, y: `calc(-50% + ${Math.sin(a) * 40}px)`, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.25, ease: easeOut }}
                  />
                );
              })}
              <svg viewBox="0 0 56 56" className="size-14" aria-hidden>
                <motion.circle cx="28" cy="28" r="25" fill="none" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: easeOut }} style={{ rotate: -90 }} />
                <motion.path d="M18 29 L25 36 L39 21" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.4, ease: easeOut }} />
              </svg>
            </motion.span>
          ) : phase === "busy" ? (
            <motion.span key="busy" {...pop}>
              <Spinner className="size-9 border-[3px]" />
            </motion.span>
          ) : (
            <motion.span key="idle" className="grid size-14 place-items-center rounded-full bg-well" {...pop}>
              <ShoppingBag className="size-5" strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p className={cn(title, "mt-2")}>
        <Swap id={phase}>{phase === "done" ? "Payment received" : phase === "busy" ? "Processing…" : "$128.40 due"}</Swap>
      </p>
      <p className={cn(caption, "mb-1.5")}>{phase === "done" ? "Receipt sent" : "Visa ending 4242"}</p>
      <Button
        size="sm"
        variant={phase === "done" ? "secondary" : "brand"}
        className="w-full"
        disabled={phase === "busy"}
        onClick={() => setPhase(phase === "done" ? "idle" : "done")}
      >
        {phase === "done" ? "Done" : "Pay $128.40"}
      </Button>
    </div>
  );
}

/* ── Bottom tab bar ─────────────────────────────────────── */

const TABS = [
  { id: "home", label: "Home", Icon: Home },
  { id: "search", label: "Search", Icon: Search },
  { id: "saved", label: "Saved", Icon: Heart },
  { id: "orders", label: "Orders", Icon: MapPinned },
  { id: "account", label: "Account", Icon: User },
];

export function TabBar() {
  const [tab, setTab] = useState("home");
  const [badge, setBadge] = useState(2);
  const thumb = useLayoutScope("tabbar");
  useEvery(1800, (tick) => {
    setTab(TABS[(tick + 1) % TABS.length].id);
    if (tick % TABS.length === 2) setBadge((b) => (b >= 5 ? 1 : b + 1));
  });

  return (
    <nav aria-label="Shop" className={cn(fill, "max-w-[440px]")}>
      <ul className="flex h-12 items-center justify-between rounded-pill bg-card p-1 text-card-foreground">
        {TABS.map(({ id, label, Icon }) => {
          const on = id === tab;
          return (
            <li key={id} className="flex">
              <button
                type="button"
                aria-current={on ? "page" : undefined}
                aria-label={id === "orders" && badge ? `${label}, ${badge} updates` : label}
                onClick={() => (setTab(id), id === "orders" && setBadge(0))}
                className={cn("relative flex h-10 items-center gap-1.5 rounded-pill px-3 text-[13px] transition-colors", ring, on ? "font-semibold text-brand-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {on && <SlidingThumb id={thumb} className="rounded-pill bg-brand-gradient" />}
                <span className="relative">
                  <Icon className="size-4.5" strokeWidth={2.3} />
                  <AnimatePresence>
                    {id === "orders" && badge > 0 && !on && (
                      <motion.span {...pop} transition={springBouncy} className="absolute -top-1.5 -right-2 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-chart-3 px-0.5 text-[9px] font-bold text-white">
                        <RollingNumber value={badge} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span
                      className="relative overflow-hidden whitespace-nowrap"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeOut }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
