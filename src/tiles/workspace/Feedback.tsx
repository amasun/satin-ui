import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleAlert, CircleCheck, Eye, EyeOff, Plus, RotateCw, TriangleAlert, X } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoInput, PersonAvatar, Swap, caption, fill, title } from "@/components/kit";
import { typeSteps, useEvery, useSequence } from "@/lib/autoplay";
import { people } from "@/lib/data";
import { easeOut, pop, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Skeleton → content ─────────────────────────────────── */

export function SkeletonCard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), 1500);
    return () => window.clearTimeout(t);
  }, [loading]);
  useEvery(3800, () => setLoading(true));

  const who = people[3];

  return (
    <div className={cn(fill, "p-1")} aria-busy={loading}>
      <div className="mb-3 flex items-start justify-between">
        {loading ? <Skeleton className="size-9 rounded-full bg-foreground/10" /> : <PersonAvatar who={who} className="size-9 text-sm" />}
        <Button variant="ghost" size="icon-xs" aria-label="Reload" onClick={() => setLoading(true)}>
          <RotateCw strokeWidth={2.6} className={cn(loading && "animate-spin")} />
        </Button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div key="skeleton" className="space-y-2" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Skeleton className="h-3.5 w-20 bg-foreground/10" />
            <Skeleton className="h-3 w-full bg-foreground/10" />
            <Skeleton className="h-3 w-2/3 bg-foreground/10" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <p className={title}>Juno Park</p>
            <p className={caption}>Product designer, 12 open tasks</p>
          </motion.div>
        )}
      </AnimatePresence>
      <span role="status" className="sr-only">
        {loading ? "Loading profile" : "Profile loaded"}
      </span>
    </div>
  );
}

/* ── Alert banner ───────────────────────────────────────── */

const ALERTS = [
  { tone: "success", Icon: CircleCheck, text: "Sprint 24 shipped on time", tint: "text-[color-mix(in_oklab,var(--brand)_70%,var(--foreground))]" },
  { tone: "warning", Icon: TriangleAlert, text: "3 tasks are due tomorrow", tint: "text-chart-4" },
  { tone: "error", Icon: CircleAlert, text: "Sync failed, retrying in 30s", tint: "text-destructive" },
] as const;

export function AlertBanner() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => (setIndex((i) => (i + 1) % ALERTS.length), setOpen(true)), 500);
    return () => window.clearTimeout(t);
  }, [open]);
  useEvery(3000, () => setOpen(false));

  const alert = ALERTS[index];

  return (
    <div className={cn(fill, "h-11")}>
      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2 } }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <Alert role={alert.tone === "error" ? "alert" : "status"} className="flex! h-11 items-center gap-2.5 rounded-pill border-transparent bg-card py-0 pr-1.5 pl-3.5">
              <alert.Icon className={cn("size-4 shrink-0 translate-y-0!", alert.tint)} strokeWidth={2.4} />
              <AlertTitle className="min-w-0 flex-1 truncate text-[13px] font-semibold">{alert.text}</AlertTitle>
              <Button variant="ghost" size="icon-xs" aria-label="Dismiss" onClick={() => setOpen(false)}>
                <X strokeWidth={2.6} />
              </Button>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────── */

export function EmptyState() {
  const [count, setCount] = useState(0);
  useSequence([
    [2400, () => setCount(1)],
    [2200, () => setCount(0)],
  ]);

  return (
    <div className={cn(fill, "flex flex-col items-center text-center")}>
      <span className={cn("mb-2 grid size-9 place-items-center rounded-full transition-colors duration-300", count ? "bg-brand-gradient text-brand-foreground" : "bg-card text-muted-foreground")}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={count} className="grid place-items-center" {...pop} transition={springBouncy}>
            {count ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" strokeWidth={2.4} />}
          </motion.span>
        </AnimatePresence>
      </span>
      <p className={title} aria-live="polite">
        <Swap id={count}>{count ? "1 task added" : "No tasks yet"}</Swap>
      </p>
      <p className={cn(caption, "mb-2.5")}>{count ? "Nice start" : "Add your first one"}</p>
      <Button size="sm" variant={count ? "secondary" : "default"} onClick={() => setCount((c) => (c ? 0 : 1))}>
        {count ? "Undo" : "New task"}
      </Button>
    </div>
  );
}

/* ── Password with strength meter ───────────────────────── */

const LEVELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

function strength(pw: string) {
  if (pw.length < 4) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/].filter((re) => re.test(pw)).length;
  return Math.max(1, Math.min(4, variety + (pw.length >= 10 ? 1 : 0) - (pw.length < 7 ? 1 : 0)));
}

export function PasswordStrength() {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const level = strength(value);

  useSequence([...typeSteps("Atlas-2026!x", setValue, 170, 900), [2600, () => setValue("")]]);

  return (
    <div className={cn(fill, "relative flex items-center")}>
      <DemoInput
        type={visible ? "text" : "password"}
        value={value}
        onChange={setValue}
        display={visible ? value : "•".repeat(value.length)}
        aria-label="New password"
        aria-describedby="pw-strength"
        placeholder="New password"
        autoComplete="new-password"
        className="pr-[9.5rem]"
      />
      <div className="absolute right-1.5 flex items-center gap-2">
        <div id="pw-strength" className="flex items-center gap-2" aria-live="polite">
          <span className={cn(caption, "hidden w-14 text-right min-[380px]:block")}>{value ? LEVELS[level] : ""}</span>
          <span className="flex gap-[3px]" aria-hidden>
            {[1, 2, 3, 4].map((n) => (
              <i
                key={n}
                className={cn(
                  "h-4 w-1 rounded-full transition-colors duration-300",
                  value && n <= level ? (level <= 1 ? "bg-destructive" : level === 2 ? "bg-chart-4" : "bg-brand") : "bg-foreground/12",
                )}
              />
            ))}
          </span>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
          {visible ? <EyeOff strokeWidth={2.2} /> : <Eye strokeWidth={2.2} />}
        </Button>
      </div>
    </div>
  );
}
