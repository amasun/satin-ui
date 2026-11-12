import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Archive, CalendarDays, Check, ChevronDown, Copy, FolderKanban, Inbox, Maximize2, Pencil, Plus, Settings, Trash2, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { PersonAvatar, Spinner, Swap, caption, fill, title } from "@/components/kit";
import { typeSteps, useEvery, useSequence } from "@/lib/autoplay";
import { people } from "@/lib/data";
import { easeOut, spring, springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Command palette (inline, fully working) ────────────── */

const COMMANDS = [
  { group: "Actions", label: "New task", Icon: Plus, keys: "N" },
  { group: "Actions", label: "Assign to…", Icon: UserPlus, keys: "A" },
  { group: "Actions", label: "Set due date", Icon: CalendarDays, keys: "D" },
  { group: "Go to", label: "Inbox", Icon: Inbox, keys: "G I" },
  { group: "Go to", label: "Projects", Icon: FolderKanban, keys: "G P" },
  { group: "Go to", label: "Settings", Icon: Settings, keys: "G S" },
];
const GROUPS = ["Actions", "Go to"];

export function CommandPalette() {
  const [query, setQuery] = useState("");
  const [ran, setRan] = useState<string | null>(null);

  useSequence([
    ...typeSteps("due", setQuery, 180, 1400),
    [1600, () => setQuery("")],
    ...typeSteps("pro", setQuery, 180, 1400),
    [1600, () => setQuery("")],
  ]);

  useEffect(() => {
    if (!ran) return;
    const t = window.setTimeout(() => setRan(null), 1400);
    return () => window.clearTimeout(t);
  }, [ran]);

  return (
    <Command label="Command palette" className={cn(fill, "self-stretch")}>
      <CommandInput value={query} onValueChange={setQuery} placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>Nothing matches “{query}”.</CommandEmpty>
        {GROUPS.map((group) => (
          <CommandGroup key={group} heading={group}>
            {COMMANDS.filter((c) => c.group === group).map(({ label, Icon, keys }) => (
              <CommandItem key={label} value={label} onSelect={() => setRan(label)}>
                <Icon strokeWidth={2.2} />
                {label}
                {ran === label ? (
                  <Check className="ml-auto size-3.5! text-brand!" strokeWidth={3} />
                ) : (
                  <CommandShortcut className="hidden @[240px]:inline">{keys}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <span role="status" className="sr-only">
        {ran ? `Ran ${ran}` : ""}
      </span>
    </Command>
  );
}

/* ── Confirm dialog ─────────────────────────────────────── */

type Phase = "idle" | "deleting" | "deleted" | "closed";
const DOCS = ["Q3 roadmap", "Old brand kit"];

/**
 * The tile shows the dialog's content inline so it can demo itself; the
 * expand button opens the same content as a real modal AlertDialog.
 */
export function ConfirmDialog() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  /* While the real dialog is open the inline demo holds still, so the dialog's host never unmounts under it. */
  const [modal, setModal] = useState(false);
  const doc = DOCS[index];

  useEffect(() => {
    const next: Partial<Record<Phase, [number, () => void]>> = {
      deleting: [900, () => setPhase("deleted")],
      deleted: [1300, () => setPhase("closed")],
      closed: [600, () => (setIndex((i) => (i + 1) % DOCS.length), setPhase("idle"))],
    };
    const step = next[phase];
    if (!step) return;
    const t = window.setTimeout(step[1], step[0]);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEvery(2800, () => !modal && setPhase((p) => (p === "idle" ? "deleting" : p)));

  const busy = phase !== "idle";

  return (
    <AnimatePresence mode="wait">
      {phase !== "closed" && (
        <motion.div
          key={index}
          role="group"
          aria-label={`Delete ${doc}`}
          className={cn(fill, "rounded-2xl bg-card p-3.5 text-card-foreground")}
          initial={{ opacity: 0, scale: 0.94, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: easeOut }}
        >
          <div className="flex items-start gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive">
              <Trash2 className="size-4" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[13px] font-semibold">Delete “{doc}”?</h3>
              <p className={cn(caption, "truncate")}>This can't be undone.</p>
            </div>
            <AlertDialog open={modal} onOpenChange={setModal}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label="Open as a dialog" disabled={busy}>
                  <Maximize2 strokeWidth={2.4} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{doc}”?</AlertDialogTitle>
                  <AlertDialogDescription>The document and its comments will be removed for everyone. This can't be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => setPhase("deleting")}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" disabled={busy} onClick={() => setPhase("closed")}>
              Cancel
            </Button>
            <Button
              className={cn("flex-1 overflow-hidden text-white disabled:opacity-100", phase === "deleted" ? "bg-primary text-primary-foreground" : "bg-destructive hover:bg-destructive/90")}
              disabled={busy}
              onClick={() => setPhase("deleting")}
            >
              <Swap id={phase} className="gap-1.5">
                {phase === "idle" && "Delete"}
                {phase === "deleting" && <Spinner />}
                {phase === "deleted" && (
                  <>
                    <Check strokeWidth={3} /> Deleted
                  </>
                )}
              </Swap>
            </Button>
          </div>
          <span role="status" className="sr-only">
            {phase === "deleted" ? `${doc} deleted` : ""}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Dropdown menu ──────────────────────────────────────── */

const MENU = [
  { label: "Rename", Icon: Pencil, keys: "R" },
  { label: "Duplicate", Icon: Copy, keys: "D" },
  { label: "Archive", Icon: Archive, keys: "E" },
];

/** The real menu opens from the button; the list below previews its items. */
export function MenuDemo() {
  const [hot, setHot] = useState(0);
  const [last, setLast] = useState<string | null>(null);
  useEvery(1300, () => setHot((i) => (i + 1) % MENU.length));

  return (
    <div className={cn(fill, "flex flex-col gap-1.5")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="surface" size="sm" className="w-full justify-between px-3">
            <Swap id={last ?? "none"}>{last ?? "Actions"}</Swap>
            <ChevronDown className="size-3.5! text-muted-foreground" strokeWidth={2.6} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          {MENU.map(({ label, Icon, keys }) => (
            <DropdownMenuItem key={label} onSelect={() => setLast(label)}>
              <Icon /> {label}
              <DropdownMenuShortcut>{keys}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setLast("Delete")}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ul aria-hidden className="rounded-xl bg-card p-1 text-card-foreground shadow-float">
        {MENU.map(({ label, Icon, keys }, i) => (
          <li key={label} className="relative flex h-7 items-center gap-2 px-2 text-xs font-medium">
            {i === hot && <motion.span layoutId="menu-hot" className="absolute inset-0 rounded-lg bg-accent" transition={spring} />}
            <Icon className="relative size-3.5 text-muted-foreground" strokeWidth={2.2} />
            <span className="relative flex-1">{label}</span>
            <kbd className="relative font-sans text-[10px] text-muted-foreground">{keys}</kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Hover card ─────────────────────────────────────────── */

const ROLES = ["Engineering lead", "Frontend engineer", "Product manager"];

/** Opens only when a person hovers or focuses a member; the demo never pops it. */
export function MemberHoverCard() {
  return (
    <div className={cn(fill, "text-center")}>
      <p className={title}>Team</p>
      <p className={cn(caption, "mb-3")}>Hover a member</p>
      <div className="flex justify-center gap-1.5">
        {people.slice(0, 3).map((p, i) => (
          <HoverCard key={p.id} openDelay={120} closeDelay={80}>
            <HoverCardTrigger asChild>
              <button type="button" aria-label={p.name} className="rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/40">
                <PersonAvatar who={p} className="size-8 text-xs" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent side="top" sideOffset={8} className="w-48 rounded-2xl p-3 shadow-float">
              <div className="flex items-center gap-2.5">
                <PersonAvatar who={p} className="size-9 text-sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{p.name}</p>
                  <p className={cn(caption, "truncate")}>{ROLES[i]}</p>
                </div>
              </div>
              <p className={cn(caption, "mt-2.5 border-t pt-2")}>
                <strong className="font-semibold text-foreground">{12 - i * 3}</strong> open tasks, online now
              </p>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}

/* ── Drawer ─────────────────────────────────────────────── */

export function DrawerDemo() {
  const [peek, setPeek] = useState(false);
  useEvery(1800, () => setPeek((p) => !p));

  return (
    <div className={cn(fill, "flex flex-col items-center gap-2.5")}>
      {/* A miniature of the motion; the button opens the real drawer. */}
      <div aria-hidden className="relative h-[72px] w-full overflow-hidden rounded-xl bg-card">
        <div className="space-y-1.5 p-2.5">
          <i className="block h-1.5 w-10 rounded-full bg-foreground/12" />
          <i className="block h-1.5 w-16 rounded-full bg-foreground/8" />
        </div>
        <motion.div className="absolute inset-0 bg-foreground" animate={{ opacity: peek ? 0.12 : 0 }} transition={{ duration: 0.3 }} />
        <motion.div
          className="absolute inset-x-1.5 bottom-0 h-11 rounded-t-xl bg-popover shadow-float"
          animate={{ y: peek ? 0 : 48 }}
          transition={springSoft}
        >
          <i className="mx-auto mt-1.5 block h-1 w-7 rounded-full bg-foreground/20" />
          <i className="mx-auto mt-2.5 block h-1.5 w-14 rounded-full bg-foreground/12" />
        </motion.div>
      </div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button size="sm" variant="surface">
            Open drawer
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Share “Atlas”</DrawerTitle>
              <DrawerDescription>Anyone with the link can view this project.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button variant="brand">Copy link</Button>
              <DrawerClose asChild>
                <Button variant="secondary">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
