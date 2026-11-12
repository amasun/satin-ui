import { useEffect, useRef, useSyncExternalStore } from "react";
import { useAutoplay } from "@/lib/autoplay";
import type { Person } from "@/lib/data";
import { useSetting } from "@/lib/settings";

/**
 * Live room data for the "Live event" screen.
 *
 * Tiles only talk to this module: they read slices of one external store
 * (`useLive`), listen to event streams (`useLiveReactions`, `useLivePresence`)
 * and send reactions (`sendReaction`). Where the numbers come from is a
 * `LiveSource`. Today the only source is a simulator; a real-time backend can
 * replace it by implementing the same interface and pushing into the same
 * sink, without touching any tile.
 *
 * The source runs only while at least one tile is subscribed, the demos are
 * on (`useAutoplay().enabled`) and the tab is visible. Its pace follows the
 * `speed` setting.
 */

/* ── Public types ───────────────────────────────────────── */

export const EMOJIS = ["❤️", "🔥", "👏", "😂", "🎉"] as const;
export type Emoji = (typeof EMOJIS)[number];

export const EMOJI_NAMES: Record<Emoji, string> = {
  "❤️": "Love",
  "🔥": "Fire",
  "👏": "Applause",
  "😂": "Laugh",
  "🎉": "Party",
};

/** `simulated`: demo data. `live`: real visitors. `offline`: real source unreachable, fell back to the simulator. */
export type LiveStatus = "simulated" | "live" | "offline";

export type Viewer = Person;

export type ReactionEvent = { id: number; emoji: Emoji; mine: boolean };
export type PresenceEvent = { id: number; kind: "join" | "leave"; who: Viewer };

export type LiveState = {
  status: LiveStatus;
  /** People in the room right now. */
  online: number;
  /** Recent online counts, oldest first (for the sparkline). */
  samples: readonly number[];
  /** Highest online count this session. */
  peak: number;
  /** Reactions this session, per emoji. */
  counts: Readonly<Record<Emoji, number>>;
  /** How many reactions this visitor sent. */
  mine: number;
  /** Distinct people who reacted this session. */
  reacted: number;
  /** The most recent arrivals, newest first (for avatar stacks). */
  viewers: readonly Viewer[];
  /** Seconds since the session started. */
  elapsed: number;
};

/** What a source pushes into the store. */
export type LiveSink = {
  seed(snapshot: Partial<Pick<LiveState, "online" | "samples" | "peak" | "counts" | "viewers" | "elapsed">> & { reactors?: Iterable<string> }): void;
  status(status: LiveStatus): void;
  online(count: number): void;
  presence(kind: PresenceEvent["kind"], who: Viewer): void;
  /** One reaction. `sender` identifies who sent it, for the engagement share. */
  reaction(emoji: Emoji, from: { mine: boolean; sender: string }): void;
  clock(elapsedSeconds: number): void;
};

/** A data source. `start` begins pushing into the sink and returns a stop function. */
export type LiveSource = {
  start(speed: number): () => void;
  setSpeed(speed: number): void;
  /** Send this visitor's reaction. Must reach the sink immediately. */
  send(emoji: Emoji): void;
};

/* ── Store ──────────────────────────────────────────────── */

const MAX_SAMPLES = 30;
const MAX_VIEWERS = 5;

const zeroCounts = () => Object.fromEntries(EMOJIS.map((e) => [e, 0])) as Record<Emoji, number>;

let state: LiveState = {
  status: "simulated",
  online: 0,
  samples: [],
  peak: 0,
  counts: zeroCounts(),
  mine: 0,
  reacted: 0,
  viewers: [],
  elapsed: 0,
};

const listeners = new Set<() => void>();
const reactionListeners = new Set<(e: ReactionEvent) => void>();
const presenceListeners = new Set<(e: PresenceEvent) => void>();
const reactors = new Set<string>();
let eventId = 0;

function set(patch: Partial<LiveState>) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

const sink: LiveSink = {
  seed({ reactors: seeded, ...s }) {
    if (seeded) for (const r of seeded) reactors.add(r);
    const online = s.online ?? state.online;
    set({
      ...s,
      online,
      peak: Math.max(s.peak ?? state.peak, online),
      reacted: reactors.size,
    });
  },
  status(status) {
    set({ status });
  },
  online(count) {
    set({
      online: count,
      peak: Math.max(state.peak, count),
      samples: [...state.samples, count].slice(-MAX_SAMPLES),
    });
  },
  presence(kind, who) {
    const rest = state.viewers.filter((v) => v.id !== who.id);
    set({ viewers: kind === "join" ? [who, ...rest].slice(0, MAX_VIEWERS) : rest });
    const event = { id: ++eventId, kind, who };
    presenceListeners.forEach((fn) => fn(event));
  },
  reaction(emoji, { mine, sender }) {
    reactors.add(sender);
    set({
      counts: { ...state.counts, [emoji]: state.counts[emoji] + 1 },
      mine: state.mine + (mine ? 1 : 0),
      reacted: reactors.size,
    });
    const event = { id: ++eventId, emoji, mine };
    reactionListeners.forEach((fn) => fn(event));
  },
  clock(elapsed) {
    if (elapsed !== state.elapsed) set({ elapsed });
  },
};

const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));

/* ── Simulator ──────────────────────────────────────────── */

const NAMES = ["Noor", "Kai", "Mila", "Ezra", "Iris", "Leo", "Sana", "Omar", "Yuki", "Rosa", "Finn", "Zara", "Nico", "Ava", "Theo", "Juno"];
const POOL: Viewer[] = NAMES.map((name, i) => ({ id: `v-${name.toLowerCase()}`, name, color: `var(--chart-${(i % 5) + 1})` }));

const MIN_ONLINE = 196;
const MAX_ONLINE = 288;
/** Weighted pick for ambient reactions. */
const WEIGHTS: Array<[Emoji, number]> = [
  ["❤️", 0.46],
  ["🔥", 0.2],
  ["👏", 0.17],
  ["😂", 0.09],
  ["🎉", 0.08],
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pickEmoji = (): Emoji => {
  let r = Math.random();
  for (const [e, w] of WEIGHTS) if ((r -= w) <= 0) return e;
  return "❤️";
};

function createSimulator(out: LiveSink): LiveSource {
  let online = 241;
  /** Named people the simulator knows are in the room. */
  const present = POOL.slice(0, 4);

  /* Seed a session already in progress, so the board looks lived-in at once. */
  const samples: number[] = [];
  let walk = 222;
  for (let i = 0; i < MAX_SAMPLES - 1; i++) {
    walk = Math.max(MIN_ONLINE, Math.min(MAX_ONLINE, walk + Math.round(rand(-5, 7))));
    samples.push(walk);
  }
  samples.push(online);
  out.seed({
    online,
    samples,
    peak: 268,
    counts: { "❤️": 1284, "🔥": 412, "👏": 538, "😂": 167, "🎉": 203 },
    viewers: [...present].reverse(),
    elapsed: 23 * 60 + 41,
    reactors: Array.from({ length: 110 }, (_, i) => `s${i}`),
  });

  let speed = 1;
  let timer = 0;
  let last = 0;
  /** Simulated milliseconds, advanced by real time times speed. */
  let sim = 0;
  let elapsedMs = (23 * 60 + 41) * 1000;
  let nextDrift = 0;
  let nextReaction = 0;
  let burst = 0;

  const drift = () => {
    /* A slow random walk pulled back toward the middle of the range. */
    const mid = (MIN_ONLINE + MAX_ONLINE) / 2;
    const pull = (mid - online) / (MAX_ONLINE - MIN_ONLINE);
    const delta = Math.round(rand(-2.4, 2.4) + pull * 2);
    if (delta === 0) return;
    for (let i = 0; i < Math.min(3, Math.abs(delta)); i++) {
      if (delta > 0) {
        const away = POOL.filter((p) => !present.includes(p));
        const who = away[Math.floor(Math.random() * away.length)];
        if (who) {
          present.push(who);
          out.presence("join", who);
        }
      } else if (present.length > 2) {
        const who = present.splice(Math.floor(Math.random() * present.length), 1)[0];
        out.presence("leave", who);
      }
    }
    online = Math.max(MIN_ONLINE, Math.min(MAX_ONLINE, online + delta));
    out.online(online);
  };

  const react = (emoji: Emoji) => {
    /* Senders come from a pool a bit over half the room, so the engagement share settles around 60%. */
    out.reaction(emoji, { mine: false, sender: `s${Math.floor(Math.random() * online * 0.62)}` });
  };

  const tick = () => {
    const now = performance.now();
    const dt = Math.min(now - last, 500) * speed;
    last = now;
    sim += dt;
    elapsedMs += dt;
    out.clock(Math.floor(elapsedMs / 1000));

    if (sim >= nextDrift) {
      drift();
      nextDrift = sim + rand(1800, 4200);
    }
    if (sim >= nextReaction) {
      if (burst > 0) {
        burst--;
        react(Math.random() < 0.8 ? "❤️" : pickEmoji());
        nextReaction = sim + rand(70, 170);
      } else {
        react(pickEmoji());
        if (Math.random() < 0.09) burst = Math.round(rand(5, 13));
        nextReaction = sim + rand(380, 1700);
      }
    }
    timer = window.setTimeout(tick, 90);
  };

  return {
    start(s) {
      speed = s;
      last = performance.now();
      nextDrift = sim + rand(900, 2200);
      nextReaction = sim + rand(200, 700);
      tick();
      return () => window.clearTimeout(timer);
    },
    setSpeed(s) {
      speed = s;
    },
    send(emoji) {
      out.reaction(emoji, { mine: true, sender: "me" });
    },
  };
}

const source: LiveSource = createSimulator(sink);

/* ── Running only while someone is watching ─────────────── */

type Hold = { enabled: boolean; speed: number };
const holds = new Map<symbol, Hold>();
let stopSource: (() => void) | null = null;

function sync() {
  const active = [...holds.values()].filter((h) => h.enabled);
  const run = active.length > 0 && !document.hidden;
  if (run) {
    if (!stopSource) stopSource = source.start(active[0].speed);
    else source.setSpeed(active[0].speed);
  } else if (stopSource) {
    stopSource();
    stopSource = null;
  }
}

function hold(key: symbol, value: Hold) {
  if (holds.size === 0) document.addEventListener("visibilitychange", sync);
  holds.set(key, value);
  sync();
  return () => {
    holds.delete(key);
    if (holds.size === 0) document.removeEventListener("visibilitychange", sync);
    sync();
  };
}

/** Keeps the source running while the calling component is mounted. */
function useHold() {
  const { enabled } = useAutoplay();
  const [speed] = useSetting("speed");
  useEffect(() => hold(Symbol("live"), { enabled, speed }), [enabled, speed]);
}

/* ── Hooks ──────────────────────────────────────────────── */

/**
 * Reads one slice of the live state. `select` must return a primitive or a
 * value already on the state (e.g. `s => s.counts`), not a new object.
 */
export function useLive<T>(select: (s: LiveState) => T): T {
  useHold();
  return useSyncExternalStore(subscribe, () => select(state));
}

/** Calls `fn` for every reaction (simulated, real, or this visitor's own). */
export function useLiveReactions(fn: (e: ReactionEvent) => void) {
  useHold();
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const listener = (e: ReactionEvent) => ref.current(e);
    reactionListeners.add(listener);
    return () => void reactionListeners.delete(listener);
  }, []);
}

/** Calls `fn` whenever someone joins or leaves. */
export function useLivePresence(fn: (e: PresenceEvent) => void) {
  useHold();
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const listener = (e: PresenceEvent) => ref.current(e);
    presenceListeners.add(listener);
    return () => void presenceListeners.delete(listener);
  }, []);
}

/** Sends this visitor's reaction. Takes effect immediately, even while demos are paused. */
export function sendReaction(emoji: Emoji) {
  source.send(emoji);
}
