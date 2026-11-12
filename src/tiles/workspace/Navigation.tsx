import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, FileText, FolderKanban, Inbox, ListTodo, Settings, Target } from "lucide-react";
import { AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonAvatar, RollingNumber, SlidingThumb, caption, fill, useLayoutScope } from "@/components/kit";
import { useEvery, useSequence } from "@/lib/autoplay";
import { people } from "@/lib/data";
import { easeOut, pop, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Tabs with panels ───────────────────────────────────── */

const PANELS = ["Overview", "Files", "Members"];

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex h-[66px] items-center"
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export function TabsPanel() {
  const [tab, setTab] = useState(PANELS[0]);
  const thumb = useLayoutScope("tabs");
  useEvery(2600, () => setTab((t) => PANELS[(PANELS.indexOf(t) + 1) % PANELS.length]));

  return (
    <Tabs value={tab} onValueChange={setTab} className={cn(fill, "gap-2.5")}>
      <TabsList className="h-9.5! w-full rounded-pill bg-well p-1">
        {PANELS.map((name) => (
          <TabsTrigger
            key={name}
            value={name}
            className="relative h-full rounded-[calc(var(--shape-pill)-3px)] border-0 text-[13px] text-muted-foreground shadow-none! data-active:bg-transparent data-active:font-semibold data-active:text-foreground dark:data-active:bg-transparent"
          >
            {name === tab && <SlidingThumb id={thumb} />}
            <span className="relative">{name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="Overview" className="px-1">
        <Panel>
          <dl className="grid w-full grid-cols-3 text-center">
            {[
              ["12", "Open"],
              ["4", "In review"],
              ["128", "Done"],
            ].map(([n, label]) => (
              <div key={label}>
                <dd className="text-xl font-semibold tracking-tight">{n}</dd>
                <dt className={caption}>{label}</dt>
              </div>
            ))}
          </dl>
        </Panel>
      </TabsContent>
      <TabsContent value="Files" className="px-1">
        <Panel>
          <ul className="w-full">
            {[
              ["Brief.pdf", "2.1 MB"],
              ["Flows.fig", "18 MB"],
            ].map(([name, size]) => (
              <li key={name} className="flex h-8 items-center gap-2">
                <FileText className="size-4 text-muted-foreground" strokeWidth={2.2} />
                <span className="flex-1 font-semibold">{name}</span>
                <span className={caption}>{size}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </TabsContent>
      <TabsContent value="Members" className="px-1">
        <Panel>
          <AvatarGroup className="-space-x-1.5">
            {people.map((p) => (
              <span key={p.id} className="inline-flex rounded-full ring-2 ring-tile">
                <PersonAvatar who={p} className="size-8 text-xs" />
              </span>
            ))}
          </AvatarGroup>
          <p className={cn(caption, "ml-3")}>5 members, 2 online</p>
        </Panel>
      </TabsContent>
    </Tabs>
  );
}

/* ── Breadcrumb with a collapsible middle ───────────────── */

const TRAIL = ["Workspace", "Projects", "Atlas", "Design", "Onboarding"];

export function Breadcrumbs() {
  /** How many levels deep we are (2…TRAIL.length). */
  const [depth, setDepth] = useState(TRAIL.length);
  const [expanded, setExpanded] = useState(false);
  useSequence([
    [2000, () => (setExpanded(false), setDepth(3))],
    [1800, () => setDepth(4)],
    [1800, () => setDepth(5)],
  ]);

  const path = TRAIL.slice(0, depth);
  const collapse = !expanded && path.length > 3;
  const shown = collapse ? [path[0], null, ...path.slice(-2)] : path;

  return (
    <Breadcrumb className={cn(fill, "px-2")}>
      <BreadcrumbList className="flex-nowrap gap-1.5 text-[13px] sm:gap-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((name, i) => {
            const last = i === shown.length - 1;
            return (
              <motion.li
                key={name ?? "ellipsis"}
                layout
                className="inline-flex items-center gap-1.5 whitespace-nowrap"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: easeOut }}
              >
                {name === null ? (
                  <button
                    type="button"
                    aria-label="Show hidden levels"
                    className="rounded-md outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
                    onClick={() => setExpanded(true)}
                  >
                    <BreadcrumbEllipsis className="size-5" />
                  </button>
                ) : last ? (
                  <BreadcrumbPage className="font-semibold">{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button type="button" className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40" onClick={() => setDepth(TRAIL.indexOf(name) + 1)}>
                      {name}
                    </button>
                  </BreadcrumbLink>
                )}
                {!last && <ChevronRight aria-hidden className="size-3.5 text-muted-foreground" strokeWidth={2.2} />}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/* ── Pagination ─────────────────────────────────────────── */

const PAGES = 12;

/** First, last, and a window around the current page; null marks a gap. */
function pageWindow(current: number): Array<number | null> {
  const keep = new Set([1, PAGES, current - 1, current, current + 1].filter((p) => p >= 1 && p <= PAGES));
  if (current <= 3) [2, 3, 4].forEach((p) => keep.add(p));
  if (current >= PAGES - 2) [PAGES - 3, PAGES - 2, PAGES - 1].forEach((p) => keep.add(p));
  const out: Array<number | null> = [];
  [...keep].sort((a, b) => a - b).forEach((p, i, list) => {
    if (i && p - list[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}

export function Pager() {
  const [page, setPage] = useState(3);
  const marker = useLayoutScope("page");
  useEvery(1700, () => setPage((p) => (p % PAGES) + 1));

  return (
    <nav aria-label="Pagination" className={cn(fill, "flex max-w-none items-center justify-center gap-1")}>
      <Button variant="ghost" size="icon-sm" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
        <ChevronLeft strokeWidth={2.6} />
      </Button>
      <ol className="flex items-center gap-0.5">
        {pageWindow(page).map((p, i) =>
          p === null ? (
            <li key={`gap-${i}`} aria-hidden className="w-6 text-center text-muted-foreground">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "relative grid size-8 place-items-center rounded-pill text-[13px] tabular-nums outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
                  p === page ? "font-semibold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setPage(p)}
              >
                {p === page && <SlidingThumb id={marker} className="rounded-pill bg-primary" />}
                <span className="relative">{p}</span>
              </button>
            </li>
          ),
        )}
      </ol>
      <Button variant="ghost" size="icon-sm" aria-label="Next page" disabled={page === PAGES} onClick={() => setPage((p) => p + 1)}>
        <ChevronRight strokeWidth={2.6} />
      </Button>
    </nav>
  );
}

/* ── Side navigation ────────────────────────────────────── */

const NAV = [
  { id: "inbox", label: "Inbox", Icon: Inbox },
  { id: "tasks", label: "My tasks", Icon: ListTodo },
  { id: "projects", label: "Projects", Icon: FolderKanban },
  { id: "docs", label: "Docs", Icon: FileText },
  { id: "goals", label: "Goals", Icon: Target },
  { id: "settings", label: "Settings", Icon: Settings },
];

export function SideNav() {
  const [active, setActive] = useState("tasks");
  const [unread, setUnread] = useState(3);
  const highlight = useLayoutScope("nav");

  useSequence([
    [1800, () => setActive("projects")],
    [1400, () => setUnread((n) => (n >= 9 ? 1 : n + 1))],
    [1600, () => setActive("docs")],
    [1800, () => setActive("inbox")],
    [1200, () => setUnread(0)],
    [1600, () => (setActive("tasks"), setUnread(2))],
  ]);

  return (
    <nav aria-label="Workspace" className={cn(fill, "flex flex-col self-stretch py-1")}>
      <p className="mb-2 flex items-center gap-2 px-1.5 font-semibold">
        <span className="grid size-6 place-items-center rounded-lg bg-brand-gradient text-xs font-bold text-brand-foreground">A</span>
        Atlas
      </p>
      <ul className="flex-1">
        {NAV.map(({ id, label, Icon }) => {
          const on = id === active;
          return (
            <li key={id}>
              <button
                type="button"
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative flex h-9.5 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
                  on ? "font-semibold text-card-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => (setActive(id), id === "inbox" && setUnread(0))}
              >
                {on && <SlidingThumb id={highlight} className="rounded-lg bg-card" />}
                <Icon className="relative size-4 shrink-0" strokeWidth={2.2} />
                <span className="relative min-w-0 flex-1 truncate">{label}</span>
                <AnimatePresence>
                  {id === "inbox" && unread > 0 && (
                    <motion.span className="relative" {...pop} transition={springBouncy}>
                      <Badge variant="brand" className="h-[18px] min-w-[18px] px-1 text-[10px] font-bold">
                        <RollingNumber value={unread} />
                      </Badge>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-2 border-t border-foreground/8 px-1.5 pt-2.5">
        <PersonAvatar who={people[0]} className="size-6" />
        <span className="min-w-0 flex-1 truncate font-semibold">Ava Chen</span>
      </div>
    </nav>
  );
}
