import { useEffect, useState, type ComponentType } from "react";
import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlBar, Replayable } from "@/components/controls";
import { ScreenPager } from "@/components/pager";
import { AutoplayProvider } from "@/lib/autoplay";

/**
 * Each screen is its own chunk, loaded when first shown. To add a screen,
 * create `src/screens/<name>.tsx` with a default-exported board and list it here.
 */
const SOURCES = [
  { id: "split", label: "Splitting a bill", load: () => import("@/screens/split") },
  { id: "workspace", label: "Team workspace", load: () => import("@/screens/workspace") },
  { id: "shop", label: "Shop and checkout", load: () => import("@/screens/shop") },
  { id: "assistant", label: "AI assistant", load: () => import("@/screens/assistant") },
  { id: "live", label: "Live event", load: () => import("@/screens/live") },
] satisfies Array<{ id: string; label: string; load: () => Promise<{ default: ComponentType }> }>;

/** Boards that have finished loading, so a screen already fetched renders at once instead of suspending. */
const ready = new Map<string, ComponentType>();
const fetchBoard = ({ id, load }: (typeof SOURCES)[number]) => load().then((m) => (ready.set(id, m.default), m.default));

function LazyBoard({ source }: { source: (typeof SOURCES)[number] }) {
  const [Board, setBoard] = useState<ComponentType | null>(() => ready.get(source.id) ?? null);
  useEffect(() => {
    if (Board) return;
    let live = true;
    void fetchBoard(source).then((C) => live && setBoard(() => C));
    return () => {
      live = false;
    };
  }, [Board, source]);
  return Board ? <Board /> : null;
}

const SCREENS = SOURCES.map((source) => ({
  id: source.id,
  label: source.label,
  content: (
    <Replayable>
      <LazyBoard source={source} />
    </Replayable>
  ),
}));

export function App() {
  /* Fetch the other screens once the first has settled, so switching never waits. */
  useEffect(() => {
    const timer = window.setTimeout(() => SOURCES.forEach((s) => void fetchBoard(s)), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={150}>
        <AutoplayProvider>
          <ScreenPager screens={SCREENS} rail={<ControlBar />} />
        </AutoplayProvider>
      </TooltipProvider>
    </MotionConfig>
  );
}
