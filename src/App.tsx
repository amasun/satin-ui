import { Suspense, lazy, useEffect, type ComponentType } from "react";
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

const SCREENS = SOURCES.map(({ id, label, load }) => {
  const Board = lazy(load);
  return {
    id,
    label,
    content: (
      <Replayable>
        <Suspense fallback={null}>
          <Board />
        </Suspense>
      </Replayable>
    ),
  };
});

export function App() {
  /* Fetch the other screens once the first has settled, so switching never waits. */
  useEffect(() => {
    const timer = window.setTimeout(() => SOURCES.forEach((s) => void s.load()), 1500);
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
