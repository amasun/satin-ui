import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Brain, Check, FileText, Mic, Paperclip, Plus, RefreshCw, Scale, Square, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner, Swap, caption, fill, title } from "@/components/kit";
import { useCellActive, useEvery, useSequence, typeSteps } from "@/lib/autoplay";
import { easeOut, pop, spring, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/* ── Prompt box ─────────────────────────────────────────── */

const PROMPTS = ["Why are my basil leaves curling?", "Plan a slow Sunday in Lisbon", "Explain tides to a six year old"];

export function PromptBox() {
  const id = useId();
  const [value, setValue] = useState("");
  const [generating, setGenerating] = useState(false);
  const [listening, setListening] = useState(false);
  const [files, setFiles] = useState(0);
  const ghost = useCellActive() && value.length > 0;
  const latest = useRef(value);
  latest.current = value;
  const ready = value.trim().length > 0;

  const send = () => {
    if (!latest.current.trim()) return;
    setValue("");
    setListening(false);
    setGenerating(true);
  };
  const stop = () => setGenerating(false);

  useSequence(
    PROMPTS.flatMap((p, i) => [
      ...typeSteps(p, setValue, 60, 1400),
      [700, send] as const,
      [2600, stop] as const,
      [900, () => (i === 1 ? setFiles(1) : setListening(true))] as const,
      [1300, () => (setListening(false), setFiles(0))] as const,
    ]),
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (generating) stop();
    else send();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    } else if (e.key === "Escape" && generating) stop();
  };

  const text = "px-0.5 text-[13px] leading-5 whitespace-pre-wrap break-words";

  return (
    <form className={cn(fill, "flex flex-col gap-2 rounded-2xl bg-card p-3 text-card-foreground")} onSubmit={onSubmit}>
      <label htmlFor={id} className="sr-only">
        Message the assistant
      </label>
      <div className="relative h-10">
        <textarea
          id={id}
          rows={2}
          value={value}
          spellCheck={false}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={generating ? "Generating a reply…" : "Ask anything"}
          className={cn(text, "size-full resize-none rounded-md bg-transparent outline-none placeholder:text-muted-foreground", ghost && "text-transparent")}
        />
        {ghost && (
          <span aria-hidden className={cn(text, "pointer-events-none absolute inset-0 overflow-hidden")}>
            {value}
            <i className="ml-px inline-block h-[1.1em] w-[1.5px] translate-y-[2px] animate-caret bg-foreground" />
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Attach a file" aria-pressed={files > 0} onClick={() => setFiles((n) => (n ? 0 : 1))} className="aria-pressed:bg-muted">
          <Paperclip strokeWidth={2.4} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={listening ? "Stop voice input" : "Voice input"}
          aria-pressed={listening}
          onClick={() => setListening((l) => !l)}
          className={cn(listening && "bg-brand-gradient text-brand-foreground hover:bg-brand-gradient")}
        >
          <Mic strokeWidth={2.4} />
        </Button>
        <p className={cn(caption, "ml-1 min-w-0 flex-1 truncate")} aria-live="polite">
          <Swap id={generating ? "g" : listening ? "l" : files ? "f" : "i"}>
            {generating ? "Writing a reply…" : listening ? "Listening…" : files ? "1 file attached" : "Enter to send"}
          </Swap>
        </p>
        <Button
          type="submit"
          size="icon-sm"
          variant={generating ? "default" : ready ? "brand" : "default"}
          aria-label={generating ? "Stop generating" : "Send message"}
          aria-disabled={!generating && !ready}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {generating ? (
              <motion.span key="stop" className="relative grid place-items-center" {...pop}>
                <Spinner className="absolute size-6 border-[1.5px] opacity-70" />
                <Square className="size-2.5! fill-current" strokeWidth={0} />
              </motion.span>
            ) : (
              <motion.span key="send" className="grid place-items-center" {...pop}>
                <ArrowUp strokeWidth={2.8} />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </form>
  );
}

/* ── Model picker ───────────────────────────────────────── */

const MODELS = [
  { id: "swift", name: "Swift", hint: "Quick answers", Icon: Zap, tint: "bg-chart-4" },
  { id: "balanced", name: "Balanced", hint: "Everyday work", Icon: Scale, tint: "bg-chart-2" },
  { id: "deep", name: "Deep", hint: "Thinks longer", Icon: Brain, tint: "bg-chart-1" },
];

function ModelBadge({ model }: { model: (typeof MODELS)[number] }) {
  const { Icon } = model;
  return (
    <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-white", model.tint)}>
      <Icon className="size-3.5" strokeWidth={2.6} />
    </span>
  );
}

export function ModelPicker() {
  const id = useId();
  const [value, setValue] = useState("balanced");
  const model = MODELS.find((m) => m.id === value) ?? MODELS[1];
  useEvery(2400, () => setValue((v) => MODELS[(MODELS.findIndex((m) => m.id === v) + 1) % MODELS.length].id));

  return (
    <div className={cn(fill, "flex items-center gap-2.5")}>
      <Label htmlFor={id} className="shrink-0 pl-1 text-[13px] font-semibold">
        Model
      </Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={id} className="h-11 min-w-0 flex-1 rounded-pill pl-2">
          <SelectValue>
            <Swap id={model.id} className="min-w-0 gap-2">
              <ModelBadge model={model} />
              <span className="font-semibold">{model.name}</span>
              <span className={cn(caption, "truncate")}>{model.hint}</span>
            </Swap>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MODELS.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <ModelBadge model={m} />
              <span className="font-semibold">{m.name}</span>
              <span className={caption}>{m.hint}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ── Suggested questions ────────────────────────────────── */

const SUGGESTION_SETS = [
  ["Plan a 3-day trip", "Explain like I'm 5", "Fix my SQL query", "Draft a polite no"],
  ["Summarize this PDF", "Name my plant shop", "Make a study plan", "Compare two laptops"],
];

export function SuggestedChips() {
  const [set, setSet] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const chips = SUGGESTION_SETS[set];

  useSequence([
    [1500, () => setPicked(1)],
    [1500, () => setPicked(3)],
    [1600, () => (setPicked(null), setSet((s) => (s + 1) % SUGGESTION_SETS.length))],
    [1500, () => setPicked(0)],
    [1600, () => (setPicked(null), setSet((s) => (s + 1) % SUGGESTION_SETS.length))],
  ]);

  return (
    <div className={cn(fill, "flex flex-col gap-2.5 self-stretch py-1")}>
      <div className="flex items-center justify-between pl-1">
        <h3 className={title}>Try asking</h3>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Show other suggestions"
          onClick={() => (setPicked(null), setSet((s) => (s + 1) % SUGGESTION_SETS.length))}
        >
          <motion.span className="grid place-items-center" animate={{ rotate: set * 180 }} transition={spring}>
            <RefreshCw strokeWidth={2.4} />
          </motion.span>
        </Button>
      </div>
      <ul className="flex flex-wrap content-start gap-1.5" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {chips.map((chip, i) => {
            const on = picked === i;
            return (
              <motion.li
                key={chip}
                layout
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: easeOut }}
              >
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(on ? null : i)}
                  className={cn(
                    ring,
                    "flex h-8 items-center gap-1 rounded-pill px-3 text-xs font-semibold whitespace-nowrap transition-colors duration-200",
                    on ? "bg-brand-gradient text-brand-foreground" : "bg-card text-card-foreground hover:bg-card/70",
                  )}
                >
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span className="-ml-0.5 grid place-items-center overflow-hidden" initial={{ width: 0, opacity: 0 }} animate={{ width: 14, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={spring}>
                        <Check className="size-3" strokeWidth={3.2} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {chip}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ── Attachment preview strip ───────────────────────────── */

type Attachment = { id: string; kind: "image" | "file"; name: string; meta: string; hue: [number, number] };

const POOL: Attachment[] = [
  { id: "sketch", kind: "image", name: "sketch.png", meta: "1.2 MB", hue: [1, 4] },
  { id: "notes", kind: "file", name: "Field notes.pdf", meta: "PDF · 340 KB", hue: [2, 3] },
  { id: "plot", kind: "image", name: "garden.jpg", meta: "860 KB", hue: [2, 4] },
  { id: "budget", kind: "file", name: "Budget.csv", meta: "CSV · 12 KB", hue: [4, 1] },
];

export function Attachments() {
  const [items, setItems] = useState<Attachment[]>(POOL.slice(0, 2));
  const [uploading, setUploading] = useState<string | null>(null);

  const add = () => {
    const next = POOL.find((p) => !items.some((l) => l.id === p.id));
    if (!next || items.length >= 3) return;
    setUploading(next.id);
    setItems([...items, next]);
  };
  const remove = (id: string) => setItems((list) => list.filter((l) => l.id !== id));

  useSequence([
    [1400, add],
    [1300, () => setUploading(null)],
    [1600, () => remove("notes")],
    [1300, add],
    [1300, () => setUploading(null)],
    [1700, () => setItems(POOL.slice(0, 2))],
  ]);

  return (
    <div className={cn(fill, "flex h-[50px] items-center gap-2")}>
      <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden" aria-label="Attachments">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout
              className="relative shrink-0 py-1"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.15 } }}
              transition={springBouncy}
            >
              {item.kind === "image" ? (
                <span
                  role="img"
                  aria-label={item.name}
                  className="relative block size-10 overflow-hidden rounded-xl"
                  style={{ background: `linear-gradient(135deg, var(--chart-${item.hue[0]}), var(--chart-${item.hue[1]}))` }}
                >
                  <i className="absolute top-1.5 right-2 size-2.5 rounded-full bg-white/70" />
                  <i className="absolute -bottom-2 -left-1 h-5 w-9 rotate-[-12deg] rounded-[40%] bg-black/25" />
                  {uploading === item.id && (
                    <span className="absolute inset-0 grid place-items-center bg-black/35 text-white">
                      <Spinner className="size-4" />
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex h-10 w-[132px] items-center gap-2 rounded-xl bg-card pr-3 pl-2 text-card-foreground">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: `var(--chart-${item.hue[0]})` }}>
                    {uploading === item.id ? <Spinner className="size-3.5" /> : <FileText className="size-3.5" strokeWidth={2.4} />}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-xs font-semibold">{item.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{uploading === item.id ? "Uploading…" : item.meta}</span>
                  </span>
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => remove(item.id)}
                className={cn(
                  ring,
                  "absolute -top-0.5 -right-1.5 grid size-4.5 place-items-center rounded-full border-2 border-tile bg-foreground text-background after:absolute after:-inset-2",
                )}
              >
                <X className="size-2.5" strokeWidth={3.4} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <Button variant="surface" size="icon" aria-label="Add attachment" disabled={items.length >= 3} onClick={add} className="shrink-0">
        <Plus strokeWidth={2.6} />
      </Button>
    </div>
  );
}

/* ── Voice input ────────────────────────────────────────── */

const WAVE = [40, 70, 55, 90, 62, 80, 45, 72, 58, 36];

export function VoiceInput() {
  const [listening, setListening] = useState(false);
  const [seconds, setSeconds] = useState(0);

  /* A real clock while listening, whether the demo or a person started it. */
  useEffect(() => {
    if (!listening) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [listening]);

  useSequence([
    [1600, () => (setSeconds(0), setListening(true))],
    [4200, () => setListening(false)],
  ]);

  const toggle = () => {
    if (!listening) setSeconds(0);
    setListening((l) => !l);
  };

  return (
    <div className="flex h-full w-full min-w-0 flex-col items-center justify-between py-0.5">
      <p className={cn(caption, "w-full truncate text-center")} aria-live="polite">
        <Swap id={listening ? "on" : seconds ? "done" : "idle"}>{listening ? "Listening…" : seconds ? "Got it" : "Tap to talk"}</Swap>
      </p>
      <div aria-hidden className="flex h-9 w-full items-center justify-center gap-[3px]">
        {WAVE.map((h, i) => (
          <motion.i
            key={i}
            className={cn("w-[3px] rounded-full", listening ? "bg-brand-gradient-v" : "bg-foreground/20")}
            animate={listening ? { height: [`${h * 0.3}%`, `${h}%`, `${h * 0.5}%`, `${h * 0.85}%`, `${h * 0.3}%`] } : { height: "12%" }}
            transition={listening ? { duration: 1 + (i % 3) * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 } : spring}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon-lg"
          variant={listening ? "brand" : "default"}
          aria-label={listening ? "Stop listening" : "Start voice input"}
          aria-pressed={listening}
          onClick={toggle}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {listening ? (
              <motion.span key="stop" className="grid place-items-center" {...pop}>
                <Square className="size-3! fill-current" strokeWidth={0} />
              </motion.span>
            ) : (
              <motion.span key="mic" className="grid place-items-center" {...pop}>
                <Mic strokeWidth={2.4} />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <span className="w-7 text-xs font-semibold tabular-nums">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
