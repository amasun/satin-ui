import { useId, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, Check, ChevronDown, CloudUpload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { DemoInput, PersonAvatar, Swap, caption, fill, title } from "@/components/kit";
import { typeSteps, useCellActive, useEvery, useSequence } from "@/lib/autoplay";
import { people } from "@/lib/data";
import { pop, spring, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Inline autocomplete ────────────────────────────────── */

export function AssignField() {
  const [value, setValue] = useState("");
  const match = value ? people.find((p) => p.name.toLowerCase().startsWith(value.toLowerCase())) : undefined;
  const exact = match && match.name.toLowerCase() === value.toLowerCase();
  const completion = match && !exact ? match.name.slice(value.length) : undefined;

  const accept = () => match && setValue(match.name);
  const latest = useRef(accept);
  latest.current = accept;

  useSequence([
    ...typeSteps("Ju", setValue, 220, 1000),
    [900, () => latest.current()],
    [1800, () => setValue("")],
    ...typeSteps("N", setValue, 220, 800),
    [900, () => latest.current()],
    [1800, () => setValue("")],
  ]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (completion && (e.key === "Tab" || e.key === "ArrowRight")) {
      e.preventDefault();
      accept();
    }
  };

  return (
    <div className={cn(fill, "relative flex items-center")}>
      <span className="pointer-events-none absolute left-2 z-10 grid size-7 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {exact && match ? (
            <motion.span key={match.id} {...pop} transition={springBouncy}>
              <PersonAvatar who={match} className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="at" className="font-semibold text-muted-foreground" {...pop}>
              @
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <DemoInput
        value={value}
        onChange={setValue}
        completion={completion}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={Boolean(completion)}
        aria-autocomplete="inline"
        aria-label="Assign to"
        placeholder="Assign to…"
        className="pr-16 pl-11"
      />
      <AnimatePresence>
        {completion && (
          <motion.kbd className="pointer-events-none absolute right-3 rounded-md bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted-foreground" {...pop}>
            Tab
          </motion.kbd>
        )}
      </AnimatePresence>
      <span role="status" className="sr-only">
        {exact && match ? `Assigned to ${match.name}` : completion ? `Suggestion: ${match?.name}` : ""}
      </span>
    </div>
  );
}

/* ── Tag input ──────────────────────────────────────────── */

const MAX_TAGS = 3;

export function TagInput() {
  const id = useId();
  const demo = useCellActive();
  const [tags, setTags] = useState(["design"]);
  const [draft, setDraft] = useState("");
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const commit = () => {
    const tag = draftRef.current.trim().toLowerCase();
    setDraft("");
    if (tag) setTags((prev) => (prev.includes(tag) || prev.length >= MAX_TAGS ? prev : [...prev, tag]));
  };

  useSequence([
    ...typeSteps("urgent", setDraft, 110, 1000),
    [500, commit],
    ...typeSteps("q4", setDraft, 140, 900),
    [500, commit],
    [2000, () => setTags(["design"])],
  ]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft) {
      setTags((prev) => prev.slice(0, -1));
    }
  };
  const full = tags.length >= MAX_TAGS;

  return (
    <label
      htmlFor={id}
      className={cn(
        fill,
        "flex h-11 cursor-text items-center gap-1.5 overflow-hidden rounded-pill border border-transparent bg-card pr-3 pl-1.5 text-card-foreground transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20",
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {tags.map((tag) => (
          <motion.span key={tag} layout {...pop} transition={springBouncy}>
            <Badge variant="secondary" className="h-8 gap-0.5 pr-1 pl-2.5 text-xs">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                className="grid size-5 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
              >
                <X className="size-3!" strokeWidth={2.8} />
              </button>
            </Badge>
          </motion.span>
        ))}
      </AnimatePresence>
      <motion.span layout="position" className="relative min-w-10 flex-1" transition={spring}>
        <input
          id={id}
          value={draft}
          disabled={full}
          autoComplete="off"
          aria-label="Add a label"
          placeholder={full ? "" : tags.length ? "Add…" : "Add a label"}
          className={cn("h-9 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-[13px]", demo && draft && "text-transparent")}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
        />
        {demo && draft && (
          <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center text-base whitespace-pre md:text-[13px]">
            {draft}
            <i className="ml-px inline-block h-[1.2em] w-[1.5px] animate-caret bg-foreground" />
          </span>
        )}
      </motion.span>
    </label>
  );
}

/* ── Date range ─────────────────────────────────────────── */

const DAY = 86_400_000;
const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const PRESETS = [
  { label: "This week", from: 0, to: 6 },
  { label: "Next 2 weeks", from: 7, to: 20 },
  { label: "This sprint", from: -3, to: 10 },
];

export function DateRangeField() {
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);
  const at = (offset: number) => new Date(today.getTime() + offset * DAY + DAY / 2);
  const [range, setRange] = useState<DateRange | undefined>({ from: at(PRESETS[0].from), to: at(PRESETS[0].to) });
  const [preset, setPreset] = useState<string | null>(PRESETS[0].label);

  useEvery(2400, (tick) => {
    const p = PRESETS[(tick + 1) % PRESETS.length];
    setRange({ from: at(p.from), to: at(p.to) });
    setPreset(p.label);
  });

  const text = range?.from ? `${fmt.format(range.from)} – ${range.to ? fmt.format(range.to) : "…"}` : "Pick dates";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="surface" size="lg" className={cn(fill, "justify-start gap-2.5 px-4 text-[13px] font-medium")}>
          <CalendarDays className="text-muted-foreground" strokeWidth={2.2} />
          <Swap id={text} className="tabular-nums">
            {text}
          </Swap>
          {preset && (
            <Badge variant="secondary" className="ml-auto hidden min-[380px]:inline-flex">
              <Swap id={preset}>{preset}</Swap>
            </Badge>
          )}
          <ChevronDown className={cn("size-3.5! text-muted-foreground", !preset && "ml-auto")} strokeWidth={2.6} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] rounded-2xl p-3 shadow-float">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(r) => (setRange(r), setPreset(null))}
          defaultMonth={range?.from}
        />
      </PopoverContent>
    </Popover>
  );
}

/* ── Textarea with a character limit ────────────────────── */

const LIMIT = 80;
const NOTE = "Moved the kickoff to Thursday so design can join.";

export function NoteArea() {
  const id = useId();
  const [value, setValue] = useState("");
  const [posted, setPosted] = useState(false);
  const over = value.length > LIMIT;

  useSequence([
    ...typeSteps(NOTE, setValue, 45, 900),
    [900, () => setPosted(true)],
    [1500, () => (setPosted(false), setValue(""))],
  ]);

  return (
    <div className={cn(fill, "flex flex-col gap-2 self-stretch")}>
      <Textarea
        value={value}
        onChange={(e) => (setValue(e.target.value), setPosted(false))}
        aria-label="Update"
        aria-invalid={over}
        aria-describedby={id}
        placeholder="Write an update…"
        className="min-h-0 flex-1 resize-none rounded-xl border-transparent bg-card px-3.5 py-2.5 text-base text-card-foreground md:text-[13px]"
      />
      <div className="flex items-center justify-between pl-1">
        <span id={id} className={cn(caption, "tabular-nums transition-colors", over && "font-semibold text-destructive")}>
          {value.length}/{LIMIT}
          {over && <span className="sr-only"> characters, over the limit</span>}
        </span>
        <Button size="sm" variant={posted ? "brand" : "default"} disabled={!value.trim() || over} className={cn(posted && "disabled:opacity-100")} onClick={() => setPosted(true)}>
          <Swap id={String(posted)} className="gap-1">
            {posted ? (
              <>
                <Check className="size-3.5!" strokeWidth={3} /> Posted
              </>
            ) : (
              "Post"
            )}
          </Swap>
        </Button>
      </div>
    </div>
  );
}

/* ── File dropzone ──────────────────────────────────────── */

export function Dropzone() {
  const id = useId();
  const [over, setOver] = useState(false);
  const [count, setCount] = useState(0);

  useSequence([
    [1800, () => setOver(true)],
    [1100, () => (setOver(false), setCount(3))],
    [2200, () => setCount(0)],
  ]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    setCount(e.dataTransfer.files.length);
  };

  return (
    <label
      htmlFor={id}
      className={cn(
        fill,
        "flex cursor-pointer flex-col items-center justify-center self-stretch rounded-xl border-[1.5px] border-dashed text-center transition-colors duration-200 focus-within:border-ring",
        over ? "border-brand bg-brand/10" : "border-foreground/20 hover:border-foreground/40",
      )}
      onDragOver={(e) => (e.preventDefault(), setOver(true))}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <input id={id} type="file" multiple className="sr-only" onChange={(e) => setCount(e.target.files?.length ?? 0)} />
      <motion.span
        className={cn("mb-2 grid size-9 place-items-center rounded-full transition-colors duration-300", count ? "bg-brand-gradient text-brand-foreground" : "bg-card text-card-foreground")}
        animate={{ y: over ? -4 : 0, scale: over ? 1.08 : 1 }}
        transition={springBouncy}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={count ? "done" : "idle"} className="grid place-items-center" {...pop} transition={springBouncy}>
            {count ? <Check className="size-4" strokeWidth={3} /> : <CloudUpload className="size-4" strokeWidth={2.2} />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <span className={title} aria-live="polite">
        <Swap id={`${over}-${count}`}>{count ? `${count} file${count === 1 ? "" : "s"} added` : over ? "Drop to add" : "Drop files"}</Swap>
      </span>
      <span className={caption}>{count ? "Click to replace" : "or click to browse"}</span>
    </label>
  );
}
