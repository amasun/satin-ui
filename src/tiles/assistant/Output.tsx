import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brain, Check, ChevronDown, CloudSun, Copy, RefreshCw, Sparkles, Square, TriangleAlert, WrapText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner, Swap, caption, fill, title } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import { easeOut, pop, spring, springBouncy } from "@/lib/motion";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/** The assistant's mark: a brand-gradient circle, so it follows the accent. */
export function AssistantMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-brand-gradient text-brand-foreground", className)}>
      <Sparkles className="size-3.5" strokeWidth={2.4} />
    </span>
  );
}

/* ── Streaming reply ────────────────────────────────────── */

const QUESTION = "How do I keep basil alive indoors?";
const REPLY = `Basil wants three things: light, warmth and a steady drink.
• Give it 6 or more hours of sun; a south-facing window is ideal.
• Water when the top inch of soil feels dry, not on a fixed schedule.
• Pinch the tips above a leaf pair each week so it grows bushy.
Keep it away from cold drafts in winter. It sulks below 10°C.`;
const TOKENS = REPLY.match(/\S+\s*/g) ?? [];

type Phase = "idle" | "thinking" | "writing" | "done";

export function StreamingReply() {
  const [phase, setPhase] = useState<Phase>("done");
  const [count, setCount] = useState(TOKENS.length);
  const [speed] = useSetting("speed");

  /* Token pacing is the reply's own behaviour (it runs after a person presses Regenerate too). */
  useEffect(() => {
    if (phase !== "writing") return;
    const t = window.setInterval(() => setCount((c) => c + 1), 55 / speed);
    return () => window.clearInterval(t);
  }, [phase, speed]);
  useEffect(() => {
    if (phase === "writing" && count >= TOKENS.length) setPhase("done");
  }, [phase, count]);
  useEffect(() => {
    if (phase !== "thinking") return;
    const t = window.setTimeout(() => setPhase("writing"), 1300 / speed);
    return () => window.clearTimeout(t);
  }, [phase, speed]);

  const regenerate = () => {
    setCount(0);
    setPhase("thinking");
  };
  const stop = () => setPhase("done");

  useSequence([
    [2600, regenerate],
    [7400, () => {}],
  ]);

  const shown = TOKENS.slice(0, Math.max(0, count - 1)).join("");
  const last = count > 0 ? TOKENS[count - 1] : "";
  const busy = phase === "thinking" || phase === "writing";

  return (
    <article className={cn(fill, "flex h-full flex-col gap-3 py-1")}>
      <header className="flex items-center gap-2">
        <AssistantMark />
        <span className={title}>Assistant</span>
        <span className={cn(caption, "min-w-0 flex-1 truncate")}>
          <Swap id={phase}>{phase === "thinking" ? "Thinking…" : phase === "writing" ? "Writing…" : "Answered just now"}</Swap>
        </span>
        <Button variant={busy ? "secondary" : "ghost"} size="sm" onClick={busy ? stop : regenerate} aria-label={busy ? "Stop generating" : "Regenerate reply"}>
          {busy ? <Square className="size-2.5! fill-current" strokeWidth={0} /> : <RefreshCw strokeWidth={2.4} />}
          {busy ? "Stop" : "Retry"}
        </Button>
      </header>

      <p className="ml-auto max-w-[85%] truncate rounded-pill bg-primary px-3.5 py-1.5 text-xs text-primary-foreground">{QUESTION}</p>

      <div className={cn(caption, "flex h-5 items-center gap-1.5")}>
        <Brain className="size-3.5" strokeWidth={2.2} />
        <Swap id={phase === "thinking" ? "t" : "d"}>
          {phase === "thinking" ? (
            <span className="inline-flex items-center gap-1.5">
              Thinking
              <span className="inline-flex gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <i key={i} className="size-[4px] animate-typing rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </span>
          ) : (
            "Thought for 3s"
          )}
        </Swap>
      </div>

      {/* Tokens are not announced one by one; the status line below speaks once per reply. */}
      <div aria-live="off" className="min-h-0 flex-1 overflow-hidden text-[13px] leading-5 whitespace-pre-line text-foreground/90">
        {shown}
        {last && (
          <motion.span key={count} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.25, ease: easeOut }}>
            {last}
          </motion.span>
        )}
        {busy && <i aria-hidden className="ml-0.5 inline-block size-2.5 translate-y-px animate-caret rounded-full bg-foreground" />}
      </div>
      <p className="sr-only" aria-live="polite">
        {phase === "done" ? "Reply complete" : ""}
      </p>
    </article>
  );
}

/* ── Thinking steps ─────────────────────────────────────── */

const THOUGHTS = ["Reading the question", "Checking light needs", "Weighing watering advice", "Drafting a short answer"];

export function ThinkingSteps() {
  const id = useId();
  const [open, setOpen] = useState(true);
  /** Steps finished so far; THOUGHTS.length means thinking is over. */
  const [done, setDone] = useState(THOUGHTS.length);
  const thinking = done < THOUGHTS.length;

  useSequence([
    [2000, () => (setDone(0), setOpen(true))],
    [900, () => setDone(1)],
    [900, () => setDone(2)],
    [1000, () => setDone(3)],
    [900, () => setDone(4)],
    [1800, () => setOpen(false)],
    [1400, () => setOpen(true)],
  ]);

  return (
    <div className={cn(fill, "self-start rounded-2xl bg-card px-3.5 py-1 text-card-foreground")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(ring, "flex h-9 w-full items-center gap-2 rounded-lg text-left")}
      >
        <span className="grid size-5 place-items-center text-muted-foreground">
          {thinking ? <Spinner className="size-3.5" /> : <Brain className="size-4" strokeWidth={2.2} />}
        </span>
        <span className="min-w-0 flex-1 truncate font-semibold" aria-live="polite">
          <Swap id={thinking ? "on" : "off"}>{thinking ? "Thinking…" : "Thought for 4 seconds"}</Swap>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="grid place-items-center text-muted-foreground">
          <ChevronDown className="size-4" strokeWidth={2.4} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            id={id}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            {THOUGHTS.map((step, i) => {
              const state = i < done ? "done" : i === done ? "now" : "todo";
              return (
                <li key={step} className={cn("relative flex h-[22px] items-center gap-2 pl-0.5 text-xs", state === "todo" && "text-muted-foreground/60")}>
                  {i < THOUGHTS.length - 1 && <i aria-hidden className="absolute top-[15px] left-[8.5px] h-[15px] w-px bg-foreground/12" />}
                  <span className="relative grid size-4 shrink-0 place-items-center">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {state === "done" ? (
                        <motion.span key="d" className="grid size-4 place-items-center rounded-full bg-brand-gradient text-brand-foreground" {...pop} transition={springBouncy}>
                          <Check className="size-2.5" strokeWidth={4} />
                        </motion.span>
                      ) : state === "now" ? (
                        <motion.span key="n" {...pop}>
                          <Spinner className="size-3.5" />
                        </motion.span>
                      ) : (
                        <motion.i key="t" className="size-1.5 rounded-full bg-foreground/25" {...pop} />
                      )}
                    </AnimatePresence>
                  </span>
                  <span className={cn("truncate", state === "now" && "font-semibold")}>{step}</span>
                  <span className="sr-only">{state === "done" ? "(done)" : state === "now" ? "(in progress)" : ""}</span>
                </li>
              );
            })}
            <li aria-hidden className="h-1" />
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Code block ─────────────────────────────────────────── */

type Seg = readonly [kind: "k" | "s" | "n" | "c" | "f" | "p", text: string];
const k = (t: string): Seg => ["k", t];
const s = (t: string): Seg => ["s", t];
const n = (t: string): Seg => ["n", t];
const c = (t: string): Seg => ["c", t];
const f = (t: string): Seg => ["f", t];
const p = (t: string): Seg => ["p", t];

const CODE: Seg[][] = [
  [c("// Water only when the top layer is dry")],
  [k("export function "), f("needsWater"), p("(soil: Reading, limit = "), n("0.25"), p(") {")],
  [p("  "), k("const "), p("depth = soil.byDepth."), f("findIndex"), p("((m) => m < limit);")],
  [p("  "), k("if "), p("(depth === "), n("-1"), p(") "), k("return "), s('"skip"'), p(";")],
  [p("  "), k("return "), p("depth <= "), n("2"), p(" ? "), s('"water now"'), p(" : "), s('"check tomorrow"'), p("; "), c("// about an inch")],
  [p("}")],
];
const CODE_TEXT = CODE.map((line) => line.map(([, t]) => t).join("")).join("\n");
const SEG_CLASS = { k: "text-chart-1", s: "text-chart-2", n: "text-chart-4", c: "text-muted-foreground italic", f: "text-brand", p: "" } as const;

export function CodeBlock() {
  const [wrap, setWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lines, setLines] = useState(CODE.length);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);

  useSequence([
    [1800, () => (setLines(0), setWrap(false))],
    ...CODE.map((_, i) => [i === 0 ? 400 : 260, () => setLines(i + 1)] as const),
    [1400, () => setWrap(true)],
    [1600, () => setCopied(true)],
    [2000, () => setWrap(false)],
  ]);

  const copy = () => {
    void navigator.clipboard?.writeText(CODE_TEXT).catch(() => {});
    setCopied(true);
  };

  return (
    <figure className={cn(fill, "flex h-full flex-col gap-2")}>
      <figcaption className="flex items-center gap-1.5">
        <Badge variant="secondary" className="h-6 px-2.5 font-mono text-[11px]">
          TypeScript
        </Badge>
        <span className={cn(caption, "min-w-0 flex-1 truncate")}>water.ts</span>
        <Button variant="ghost" size="icon-xs" aria-label="Wrap long lines" aria-pressed={wrap} onClick={() => setWrap((w) => !w)} className="aria-pressed:bg-muted aria-pressed:text-foreground text-muted-foreground">
          <WrapText strokeWidth={2.4} />
        </Button>
        <Button variant="ghost" size="sm" onClick={copy} aria-label={copied ? "Copied" : "Copy code"} className="h-7 w-[76px] px-2 text-muted-foreground hover:text-foreground">
          <Swap id={copied ? "y" : "n"} className="gap-1">
            {copied ? <Check className="size-3.5 text-brand" strokeWidth={3} /> : <Copy className="size-3.5" strokeWidth={2.4} />}
            {copied ? "Copied" : "Copy"}
          </Swap>
        </Button>
      </figcaption>
      <pre
        tabIndex={0}
        aria-label="Code sample"
        className={cn(
          ring,
          "min-h-0 flex-1 rounded-xl bg-card px-3.5 py-3 font-mono text-[11.5px] leading-[19px] text-card-foreground",
          wrap ? "overflow-hidden break-words whitespace-pre-wrap" : "overflow-x-auto overflow-y-hidden whitespace-pre [scrollbar-width:thin]",
        )}
      >
        <code>
          {CODE.map((line, i) => (
            <motion.span
              key={i}
              className="block"
              initial={false}
              animate={{ opacity: i < lines ? 1 : 0, x: i < lines ? 0 : -6 }}
              transition={{ duration: 0.25, ease: easeOut }}
            >
              {line.map(([kind, text], j) => (
                <span key={j} className={SEG_CLASS[kind]}>
                  {text}
                </span>
              ))}
            </motion.span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

/* ── Source citations ───────────────────────────────────── */

const SOURCES = [
  { site: "leafandloam.example", name: "Light for kitchen herbs", tint: 2 },
  { site: "potbound.example", name: "When to water, really", tint: 4 },
  { site: "herbnotes.example", name: "Pinching for bushier basil", tint: 1 },
];
const CLAIMS = ["6 to 8 hours of light", "soil that dries between drinks", "a weekly pinch"];

export function Citations() {
  const [active, setActive] = useState(0);
  useEvery(1900, () => setActive((a) => (a + 1) % SOURCES.length));

  const marker = (i: number) => (
    <button
      type="button"
      aria-label={`Source ${i + 1}: ${SOURCES[i].name}`}
      aria-pressed={active === i}
      onClick={() => setActive(i)}
      className={cn(
        ring,
        "mx-0.5 inline-grid h-4 min-w-4 -translate-y-px place-items-center rounded-pill px-1 align-middle text-[10px] font-bold transition-colors",
        active === i ? "bg-brand-gradient text-brand-foreground" : "bg-foreground/10 text-muted-foreground",
      )}
    >
      {i + 1}
    </button>
  );

  return (
    <div className={cn(fill, "flex flex-col gap-3")}>
      <p className="line-clamp-2 px-1 leading-5">
        Basil needs {CLAIMS[0]}
        {marker(0)}, {CLAIMS[1]}
        {marker(1)} and {CLAIMS[2]}
        {marker(2)}.
      </p>
      <ul className="grid grid-cols-3 gap-2">
        {SOURCES.map((src, i) => (
          <li key={src.site} className="min-w-0">
            <button
              type="button"
              aria-pressed={active === i}
              onClick={() => setActive(i)}
              className={cn(
                ring,
                "flex h-[60px] w-full flex-col justify-between rounded-xl border p-2 text-left transition-colors duration-300",
                active === i ? "border-transparent bg-card text-card-foreground" : "border-foreground/8 text-foreground/80 hover:bg-card/60",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="grid size-4 shrink-0 place-items-center rounded-[5px] text-[9px] font-bold text-white" style={{ background: `var(--chart-${src.tint})` }}>
                  {src.site[0].toUpperCase()}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">{src.site.replace(".example", "")}</span>
              </span>
              <span className="line-clamp-1 text-xs font-semibold">{src.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Tool call ──────────────────────────────────────────── */

type ToolState = "running" | "success" | "failed";

export function ToolCall() {
  const [state, setState] = useState<ToolState>("success");
  const attempt = useRef(1);
  const [speed] = useSetting("speed");

  /* The fake call settles on its own; every third attempt times out. */
  useEffect(() => {
    if (state !== "running") return;
    const t = window.setTimeout(() => setState(attempt.current % 3 === 0 ? "failed" : "success"), 1500 / speed);
    return () => window.clearTimeout(t);
  }, [state, speed]);

  const run = () => {
    attempt.current += 1;
    setState("running");
  };
  useEvery(3200, run);

  const badge = {
    running: { label: "Running", cls: "bg-foreground/8 text-muted-foreground", icon: <Spinner className="size-3" /> },
    success: { label: "Done", cls: "bg-brand-gradient text-brand-foreground", icon: <Check strokeWidth={3.4} /> },
    failed: { label: "Failed", cls: "bg-destructive/12 text-destructive", icon: <X strokeWidth={3.4} /> },
  }[state];

  return (
    <div className={cn(fill, "flex flex-col gap-2 rounded-2xl bg-card p-2.5 text-card-foreground")}>
      <div className="flex items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-chart-4/15 text-chart-4">
          <CloudSun className="size-4" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate font-semibold">Weather lookup</span>
          <code className="block truncate font-mono text-[11px] text-muted-foreground">city: "Lisbon"</code>
        </span>
        <span aria-live="polite">
          <Swap id={state}>
            <span className={cn("inline-flex h-5.5 items-center gap-1 rounded-pill px-2 text-[11px] font-semibold [&_svg]:size-3", badge.cls)}>
              {badge.icon}
              {badge.label}
            </span>
          </Swap>
        </span>
      </div>
      <div className="flex h-8 items-center gap-2 rounded-xl bg-well/60 px-2.5 text-xs">
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "running" ? (
            <motion.span key="r" className="flex flex-1 gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <i className="h-2 w-1/3 animate-pulse rounded-full bg-foreground/12" />
              <i className="h-2 w-1/4 animate-pulse rounded-full bg-foreground/12 [animation-delay:150ms]" />
            </motion.span>
          ) : state === "success" ? (
            <motion.span key="s" className="min-w-0 flex-1 truncate" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
              18°C, light rain, wind 12 km/h
            </motion.span>
          ) : (
            <motion.span key="f" className="flex min-w-0 flex-1 items-center gap-1.5 text-destructive" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
              <TriangleAlert className="size-3.5 shrink-0" strokeWidth={2.4} />
              <span className="truncate">Timed out after 10s</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <Button variant={state === "failed" ? "default" : "secondary"} size="sm" disabled={state === "running"} onClick={run} className="self-start">
        <RefreshCw strokeWidth={2.4} />
        {state === "failed" ? "Retry call" : "Run again"}
      </Button>
    </div>
  );
}

/* ── Generated images ───────────────────────────────────── */

/** Four small landscapes drawn with the chart palette; `shift` re-colours them per run. */
function Art({ variant, shift }: { variant: number; shift: number }) {
  const gid = useId().replace(/:/g, "");
  const hue = (i: number) => `var(--chart-${((i + shift + variant) % 4) + 1})`;
  return (
    <svg viewBox="0 0 100 64" preserveAspectRatio="xMidYMid slice" className="size-full" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" style={{ stopColor: hue(0) }} />
          <stop offset="1" style={{ stopColor: hue(1) }} />
        </linearGradient>
      </defs>
      <rect width="100" height="64" fill={`url(#${gid}-sky)`} />
      {variant === 0 && (
        <>
          <circle cx="72" cy="20" r="9" className="fill-white/70" />
          <path d="M0 50 L22 28 L38 42 L58 22 L80 44 L100 34 L100 64 L0 64 Z" className="fill-black/25" />
          <path d="M0 58 Q30 46 60 56 T100 52 L100 64 L0 64 Z" className="fill-black/30" />
        </>
      )}
      {variant === 1 && (
        <>
          <circle cx="30" cy="30" r="16" className="fill-white/35" />
          <circle cx="62" cy="26" r="10" className="fill-white/25" />
          <path d="M0 46 Q50 30 100 46 L100 64 L0 64 Z" style={{ fill: hue(2) }} opacity="0.85" />
        </>
      )}
      {variant === 2 && (
        <>
          {[14, 30, 46, 62, 78].map((x, i) => (
            <path key={x} d={`M${x} ${64} L${x + 8} ${22 + (i % 2) * 8} L${x + 16} 64 Z`} className="fill-black/25" />
          ))}
          <rect y="54" width="100" height="10" className="fill-white/20" />
        </>
      )}
      {variant === 3 && (
        <>
          <ellipse cx="50" cy="40" rx="18" ry="18" className="fill-white/55" />
          <rect x="0" y="40" width="100" height="24" style={{ fill: hue(2) }} opacity="0.6" />
          {[46, 51, 56].map((y) => (
            <rect key={y} x={30 + (y % 10)} y={y} width={40 - (y - 46) * 2} height="1.4" rx="0.7" className="fill-white/50" />
          ))}
        </>
      )}
    </svg>
  );
}

export function ImageGrid() {
  const [run, setRun] = useState(0);
  const [ready, setReady] = useState(true);
  const [picked, setPicked] = useState<number | null>(null);

  const regenerate = () => {
    setReady(false);
    setPicked(null);
    setRun((r) => r + 1);
  };
  useSequence([
    [2200, regenerate],
    [4200, () => setPicked(2)],
    [1600, () => {}],
  ]);

  return (
    <div className={cn(fill, "flex h-full flex-col gap-2")}>
      <p className="flex items-center gap-1.5 px-1">
        <span className={cn(title, "min-w-0 flex-1 truncate")}>“Fox in a misty pine forest”</span>
      </p>
      <ul className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5" aria-busy={!ready}>
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="min-h-0">
            <button
              type="button"
              aria-label={`Image ${i + 1}${ready ? "" : ", still generating"}`}
              aria-pressed={picked === i}
              onClick={() => setPicked(picked === i ? null : i)}
              className={cn(
                ring,
                "relative block size-full overflow-hidden rounded-xl bg-well transition-[box-shadow] duration-300",
                picked === i && "ring-3 ring-foreground",
              )}
            >
              <motion.span
                key={run}
                className="absolute inset-0 block"
                initial={run ? { filter: "blur(18px) saturate(0.4)", scale: 1.25, opacity: 0.35 } : false}
                animate={{
                  filter: ["blur(18px) saturate(0.4)", "blur(10px) saturate(0.7)", "blur(10px) saturate(0.7)", "blur(4px) saturate(0.9)", "blur(0px) saturate(1)"],
                  scale: [1.25, 1.12, 1.12, 1.04, 1],
                  opacity: [0.35, 0.75, 0.75, 1, 1],
                }}
                transition={{ duration: 2.6, delay: i * 0.25, times: [0, 0.3, 0.55, 0.8, 1], ease: "easeOut" }}
                onAnimationComplete={() => i === 3 && setReady(true)}
              >
                <Art variant={i} shift={run} />
              </motion.span>
              <AnimatePresence>
                {picked === i && (
                  <motion.span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background" {...pop}>
                    <Check className="size-3" strokeWidth={3.4} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 pl-1">
        <span className={cn(caption, "min-w-0 flex-1 truncate")} aria-live="polite">
          <Swap id={ready ? (picked !== null ? "p" : "r") : "g"}>{!ready ? "Generating 4 images…" : picked !== null ? `Image ${picked + 1} selected` : "4 images, 2.6s"}</Swap>
        </span>
        <Button variant="surface" size="sm" onClick={regenerate} disabled={!ready}>
          <RefreshCw strokeWidth={2.4} />
          Redo
        </Button>
      </div>
    </div>
  );
}
