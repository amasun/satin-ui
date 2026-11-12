import { useId, useMemo, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, ArrowUpRight, CalendarDays, Flag } from "lucide-react";
import { AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PersonAvatar, RollingNumber, SlidingThumb, Swap, caption, fill, title, useLayoutScope } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import { people, person } from "@/lib/data";
import { spring, springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Data table: sortable, selectable ───────────────────── */

type Status = "Done" | "In progress" | "In review" | "Todo";
const TASKS: Array<{ id: string; name: string; who: string; status: Status; due: number }> = [
  { id: "t1", name: "Onboarding flow v2", who: "ava", status: "In progress", due: 14 },
  { id: "t2", name: "Billing page copy", who: "kai", status: "In review", due: 12 },
  { id: "t3", name: "Fix invite emails", who: "noor", status: "Done", due: 9 },
  { id: "t4", name: "Q4 roadmap draft", who: "juno", status: "Todo", due: 21 },
];
const STATUS_STYLE: Record<Status, string> = {
  Done: "bg-brand-gradient text-brand-foreground",
  "In progress": "bg-primary text-primary-foreground",
  "In review": "bg-secondary text-secondary-foreground",
  Todo: "border-border bg-transparent text-muted-foreground",
};
type SortKey = "name" | "due";

export function TaskTable() {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "due", asc: true });
  const [selected, setSelected] = useState(() => new Set(["t3"]));

  const rows = useMemo(() => {
    const sorted = [...TASKS].sort((a, b) => (sort.key === "due" ? a.due - b.due : a.name.localeCompare(b.name)));
    return sort.asc ? sorted : sorted.reverse();
  }, [sort]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const sortBy = (key: SortKey) => setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }));

  useSequence([
    [1800, () => toggle("t1")],
    [1600, () => sortBy("due")],
    [1800, () => toggle("t2")],
    [1600, () => sortBy("name")],
    [1800, () => setSelected(new Set(["t3"]))],
  ]);

  const all = selected.size === TASKS.length;
  const SortHead = ({ k, children, className }: { k: SortKey; children: string; className?: string }) => {
    const active = sort.key === k;
    const Arrow = sort.asc ? ArrowUp : ArrowDown;
    return (
      <TableHead aria-sort={active ? (sort.asc ? "ascending" : "descending") : "none"} className={className}>
        <button
          type="button"
          className="-mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-semibold outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          onClick={() => sortBy(k)}
        >
          {children}
          <Arrow className={cn("size-3 transition-opacity", active ? "opacity-100" : "opacity-0")} strokeWidth={2.6} />
        </button>
      </TableHead>
    );
  };

  return (
    <div className="@container w-full self-stretch">
      <div className="mb-1 flex items-center justify-between px-2 pt-1">
        <p className="text-[15px] font-semibold tracking-tight">Sprint tasks</p>
        <p className={caption} aria-live="polite">
          <Swap id={selected.size}>{selected.size} selected</Swap>
        </p>
      </div>
      <Table className="text-[13px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-9">
              <Checkbox
                aria-label="Select all tasks"
                checked={all ? true : selected.size ? "indeterminate" : false}
                onCheckedChange={() => setSelected(all ? new Set() : new Set(TASKS.map((t) => t.id)))}
              />
            </TableHead>
            <SortHead k="name">Task</SortHead>
            <TableHead className="hidden text-xs font-semibold @lg:table-cell">Owner</TableHead>
            <TableHead className="text-xs font-semibold">Status</TableHead>
            <SortHead k="due" className="hidden text-right @sm:table-cell">
              Due
            </SortHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((task) => {
            const on = selected.has(task.id);
            const owner = person(task.who);
            return (
              <motion.tr
                key={task.id}
                layout
                transition={spring}
                data-state={on ? "selected" : undefined}
                className="border-b transition-colors last:border-0 hover:bg-muted/60 data-[state=selected]:bg-muted"
              >
                <TableCell className="h-11 py-0">
                  <Checkbox aria-label={`Select ${task.name}`} checked={on} onCheckedChange={() => toggle(task.id)} />
                </TableCell>
                <TableCell className="max-w-0 truncate py-0 font-semibold">{task.name}</TableCell>
                <TableCell className="hidden py-0 @lg:table-cell">
                  <span className="flex items-center gap-2">
                    <PersonAvatar who={owner} className="size-5 text-[10px]" />
                    {owner.name}
                  </span>
                </TableCell>
                <TableCell className="py-0">
                  <Badge className={cn("border border-transparent", STATUS_STYLE[task.status])}>{task.status}</Badge>
                </TableCell>
                <TableCell className="hidden py-0 text-right text-muted-foreground tabular-nums @sm:table-cell">Nov {task.due}</TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ── Area chart with range switch and hover readout ─────── */

const SERIES: Record<string, { label: string; total: number; points: number[] }> = {
  "7d": { label: "Last 7 days", total: 128, points: [12, 18, 15, 22, 19, 26, 24, 31, 28, 35, 33, 40] },
  "30d": { label: "Last 30 days", total: 512, points: [30, 26, 34, 29, 41, 38, 36, 47, 52, 45, 58, 64] },
};
const W = 300;
const H = 100;

function toPath(points: number[]) {
  const max = Math.max(...points) * 1.15;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * W, H - (p / max) * H] as const);
  /* Smooth the line with midpoint quadratic curves. */
  let d = `M ${xy[0][0]} ${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [px, py] = xy[i - 1];
    const [x, y] = xy[i];
    const mx = (px + x) / 2;
    d += ` C ${mx} ${py}, ${mx} ${y}, ${x} ${y}`;
  }
  return { line: d, area: `${d} L ${W} ${H} L 0 ${H} Z`, xy };
}

export function TrendChart() {
  const gradient = useId();
  const thumb = useLayoutScope("range");
  const [range, setRange] = useState("7d");
  const [active, setActive] = useState(8);
  const series = SERIES[range];
  const path = useMemo(() => toPath(series.points), [series]);

  useSequence([
    [1300, () => setActive(4)],
    [1300, () => setActive(10)],
    [1500, () => setRange((r) => (r === "7d" ? "30d" : "7d"))],
    [1300, () => setActive(6)],
  ]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width));
    setActive(Math.round(ratio * (series.points.length - 1)));
  };
  const [ax, ay] = path.xy[active];

  return (
    <div className="flex w-full flex-col self-stretch p-1.5">
      <div className="flex items-start justify-between">
        <div>
          <p className={caption}>
            Tasks completed, <Swap id={range}>{series.label.toLowerCase()}</Swap>
          </p>
          <output className="block text-[28px] leading-tight font-semibold tracking-tight">
            <RollingNumber value={series.total} />
          </output>
        </div>
        <ToggleGroup
          type="single"
          variant="segment"
          size="sm"
          spacing={0}
          value={range}
          onValueChange={(v) => v && setRange(v)}
          aria-label="Range"
          className="rounded-pill bg-well p-[3px]"
        >
          {Object.keys(SERIES).map((key) => (
            <ToggleGroupItem key={key} value={key} className="w-11 rounded-[calc(var(--shape-pill)-3px)]! px-0">
              {key === range && <SlidingThumb id={thumb} />}
              <span className="relative">{key}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div
        role="img"
        aria-label={`${series.label}: ${series.points.join(", ")} tasks`}
        className="relative mt-2 min-h-0 flex-1 cursor-crosshair touch-none"
        onPointerMove={onMove}
        onPointerDown={onMove}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--brand)" stopOpacity="0.32" />
              <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path initial={false} animate={{ d: path.area }} transition={springSoft} fill={`url(#${gradient})`} />
          <motion.path
            initial={false}
            animate={{ d: path.line }}
            transition={springSoft}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-px bg-foreground/15"
          animate={{ left: `${(ax / W) * 100}%` }}
          transition={spring}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute"
          animate={{ left: `${(ax / W) * 100}%`, top: `${(ay / H) * 100}%` }}
          transition={spring}
        >
          <span className="absolute -top-[5px] -left-[5px] size-2.5 rounded-full border-2 border-tile bg-foreground" />
          <span className="absolute bottom-3 left-0 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-background tabular-nums">
            {series.points[active]}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* ── KPI with sparkline ─────────────────────────────────── */

const KPIS = [
  { value: 42, delta: 12, spark: [8, 11, 9, 14, 13, 17, 19] },
  { value: 38, delta: -9, spark: [19, 17, 18, 14, 15, 12, 11] },
  { value: 47, delta: 24, spark: [9, 10, 13, 12, 16, 19, 22] },
];

export function Kpi() {
  const [index, setIndex] = useState(0);
  useEvery(2600, () => setIndex((i) => (i + 1) % KPIS.length));
  const kpi = KPIS[index];
  const up = kpi.delta >= 0;
  const max = Math.max(...kpi.spark);
  const line = kpi.spark.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (kpi.spark.length - 1)) * 100} ${30 - (v / max) * 26}`).join(" ");

  return (
    <div className={cn(fill, "p-1")}>
      <p className={caption}>Velocity</p>
      <div className="flex items-baseline gap-1.5">
        <output className="text-[28px] leading-tight font-semibold tracking-tight">
          <RollingNumber value={kpi.value} />
        </output>
        <span className={caption}>pts</span>
      </div>
      <p className={cn("flex items-center gap-0.5 text-xs font-semibold", up ? "text-[color-mix(in_oklab,var(--brand)_70%,var(--foreground))]" : "text-destructive")}>
        <ArrowUpRight className={cn("size-3.5 transition-transform duration-300", !up && "rotate-90")} strokeWidth={2.6} />
        <RollingNumber value={kpi.delta} text={`${Math.abs(kpi.delta)}%`} />
        <span className="sr-only">{up ? "up" : "down"} from last sprint</span>
      </p>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-2 h-8 w-full overflow-visible" aria-hidden>
        <motion.path
          initial={false}
          animate={{ d: line }}
          transition={springSoft}
          fill="none"
          stroke={up ? "var(--brand)" : "var(--destructive)"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/* ── Donut ──────────────────────────────────────────────── */

const SLICES = [
  { label: "Done", value: 58, color: "var(--brand)" },
  { label: "Doing", value: 27, color: "var(--foreground)" },
  { label: "Todo", value: 15, color: "color-mix(in oklab, var(--foreground) 22%, transparent)" },
];
const R = 30;
const CIRC = 2 * Math.PI * R;
const GAP = 4;

export function Donut() {
  const [active, setActive] = useState(0);
  useEvery(2000, () => setActive((i) => (i + 1) % SLICES.length));
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative size-[88px]">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90" role="img" aria-label={SLICES.map((s) => `${s.label} ${s.value}%`).join(", ")}>
          {SLICES.map((slice, i) => {
            const length = (slice.value / 100) * CIRC;
            const dash = `${Math.max(0, length - GAP)} ${CIRC}`;
            const start = offset;
            offset += length;
            return (
              <motion.circle
                key={slice.label}
                cx="40"
                cy="40"
                r={R}
                fill="none"
                stroke={slice.color}
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-start}
                className="cursor-pointer"
                animate={{ strokeWidth: i === active ? 11 : 7, opacity: i === active ? 1 : 0.75 }}
                transition={spring}
                onPointerEnter={() => setActive(i)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-lg font-semibold tracking-tight">
            <RollingNumber value={SLICES[active].value} text={`${SLICES[active].value}%`} />
          </span>
        </div>
      </div>
      <p className={cn(caption, "mt-2")} aria-live="polite">
        <Swap id={active}>{SLICES[active].label}</Swap>
      </p>
    </div>
  );
}

/* ── Activity timeline ──────────────────────────────────── */

const EVENTS = [
  { who: "ava", text: "merged Onboarding flow v2" },
  { who: "kai", text: "commented on Billing copy" },
  { who: "noor", text: "closed Fix invite emails" },
  { who: "juno", text: "opened Q4 roadmap draft" },
  { who: "theo", text: "assigned you 2 tasks" },
  { who: "ava", text: "moved 3 tasks to review" },
];
const AGES = ["now", "4m", "12m", "1h"];

export function Timeline() {
  const [head, setHead] = useState(3);
  useEvery(2400, () => setHead((h) => h + 1));
  const visible = Array.from({ length: 4 }, (_, i) => head - i);

  return (
    <div className={cn(fill, "self-stretch px-1 pt-1")}>
      <p className={cn(title, "mb-2.5")}>Activity</p>
      <ol className="relative" role="log" aria-label="Recent activity">
        <span aria-hidden className="absolute top-3 bottom-3 left-[11px] w-px bg-foreground/10" />
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((n, i) => {
            const event = EVENTS[((n % EVENTS.length) + EVENTS.length) % EVENTS.length];
            const who = person(event.who);
            return (
              <motion.li
                key={n}
                layout
                className="relative flex h-[46px] items-center gap-2.5"
                initial={{ opacity: 0, y: -18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
                transition={spring}
              >
                <span className="relative rounded-full ring-3 ring-tile">
                  <PersonAvatar who={who} className="size-[22px] text-[10px]" />
                </span>
                <p className="min-w-0 flex-1 truncate text-[13px]">
                  <strong className="font-semibold">{who.name}</strong> <span className="text-muted-foreground">{event.text}</span>
                </p>
                <span className={cn(caption, "tabular-nums")}>{AGES[i]}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}

/* ── Task card ──────────────────────────────────────────── */

const SUBTASKS = ["Map the first-run steps", "Write empty-state copy", "Prototype the checklist"];

export function TaskCard() {
  const id = useId();
  const [done, setDone] = useState(() => new Set([0]));
  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });

  useSequence([
    [1500, () => setDone(new Set([0, 1]))],
    [1500, () => setDone(new Set([0, 1, 2]))],
    [2400, () => setDone(new Set([0]))],
  ]);

  const complete = done.size === SUBTASKS.length;

  return (
    <article className={cn(fill, "flex flex-col self-stretch rounded-2xl bg-card p-4 text-card-foreground")}>
      <div className="flex items-center gap-1.5">
        <Badge variant="secondary">Design</Badge>
        <Badge className={cn("transition-colors duration-300", complete ? "bg-brand-gradient text-brand-foreground" : "bg-primary text-primary-foreground")}>
          <Swap id={String(complete)}>{complete ? "Done" : "In progress"}</Swap>
        </Badge>
        <Flag className="ml-auto size-3.5 fill-chart-4 text-chart-4" aria-label="High priority" />
      </div>
      <h3 className="mt-2.5 text-[15px] font-semibold tracking-tight">Onboarding flow v2</h3>
      <ul className="mt-1.5 flex-1">
        {SUBTASKS.map((label, i) => (
          <li key={label} className="flex h-8 items-center gap-2.5">
            <Checkbox id={`${id}-${i}`} checked={done.has(i)} onCheckedChange={() => toggle(i)} />
            <Label
              htmlFor={`${id}-${i}`}
              className={cn("h-full min-w-0 flex-1 cursor-pointer truncate text-[13px] transition-colors duration-300", done.has(i) && "text-muted-foreground line-through")}
            >
              {label}
            </Label>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <Progress value={(done.size / SUBTASKS.length) * 100} aria-label="Subtasks complete" className="flex-1" />
        <span className={cn(caption, "tabular-nums")}>
          <RollingNumber value={done.size} />/{SUBTASKS.length}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <AvatarGroup className="-space-x-1.5">
          {people.slice(0, 3).map((p) => (
            <span key={p.id} className="inline-flex rounded-full ring-2 ring-card">
              <PersonAvatar who={p} className="size-[22px] text-[10px]" />
            </span>
          ))}
        </AvatarGroup>
        <span className={cn(caption, "flex items-center gap-1")}>
          <CalendarDays className="size-3.5" strokeWidth={2.2} /> Nov 14
        </span>
      </div>
    </article>
  );
}
