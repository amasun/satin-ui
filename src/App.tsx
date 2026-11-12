import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlBar, Replayable } from "@/components/controls";
import { Board, Tile } from "@/components/kit";
import { ScreenPager } from "@/components/pager";
import { AutoplayProvider } from "@/lib/autoplay";
import { Chips, Rating, SplitMode, SplitSelect } from "@/tiles/Choices";
import { Actions, Faq, Steps, TipSlider, Toggles, TooltipDemo } from "@/tiles/Controls";
import { Composer, SearchField, TitleField } from "@/tiles/Fields";
import { Countdown, ProgressRing, Stat, Upload, VoiceNote } from "@/tiles/Media";
import { Appearance, PeopleStepper, PlanCalendar, ShareStepper, VerifyCode, ViewSwitch } from "@/tiles/Planning";
import { PayButton, SendCard, StatusPill } from "@/tiles/Sending";
import { AvatarStack, Chat, Toast, WhosIn } from "@/tiles/Social";
import { Donut, Kpi, TaskCard, TaskTable, Timeline, TrendChart } from "@/tiles/workspace/Data";
import { AlertBanner, EmptyState, PasswordStrength, SkeletonCard } from "@/tiles/workspace/Feedback";
import { AssignField, DateRangeField, Dropzone, NoteArea, TagInput } from "@/tiles/workspace/Inputs";
import { Breadcrumbs, Pager, SideNav, TabsPanel } from "@/tiles/workspace/Navigation";
import { CommandPalette, ConfirmDialog, DrawerDemo, MemberHoverCard, MenuDemo } from "@/tiles/workspace/Overlays";

/**
 * `col` / `row` pin each tile on the 8 × 11 desktop board. Below 1320px the
 * board reflows (4, then 2 columns) in source order, so tiles are listed in
 * an order that packs cleanly: single-width tiles come in pairs.
 */
function SplitBoard() {
  return (
    <Board label="Splitting a bill">
      <Tile label="Calendar" col={1} row={1} w={2} h={4} tone="raised"><PlanCalendar /></Tile>
      <Tile label="View" col={1} row={5} w={2}><ViewSwitch /></Tile>
      <Tile label="Your share" col={1} row={6} w={2} h={2} tone="raised"><ShareStepper /></Tile>
      <Tile label="Send status" col={3} row={1} h={2}><StatusPill /></Tile>
      <Tile label="Paid back" col={6} row={1} h={2} tone="dark"><ProgressRing /></Tile>
      <Tile label="Send money" col={4} row={1} w={2} h={3}><SendCard /></Tile>
      <Tile label="Notification" col={4} row={4} w={2}><Toast /></Tile>
      <Tile label="Settings" col={7} row={1} w={2} h={2}><Toggles /></Tile>
      <Tile label="Who's in" col={3} row={3} h={4}><WhosIn /></Tile>
      <Tile label="Split by" col={4} row={8} h={4}><SplitSelect /></Tile>
      <Tile label="Search" col={1} row={8} w={2}><SearchField /></Tile>
      <Tile label="Voice note" col={4} row={5} w={2} h={2} tone="dark"><VoiceNote /></Tile>
      <Tile label="Monthly spend" col={6} row={3} h={2}><Stat /></Tile>
      <Tile label="Quick actions" col={6} row={5} h={2}><Actions /></Tile>
      <Tile label="Dishes" col={7} row={3} w={2}><Chips /></Tile>
      <Tile label="Split mode" col={7} row={4} w={2} h={2}><SplitMode /></Tile>
      <Tile label="People" col={1} row={9} h={2}><PeopleStepper /></Tile>
      <Tile label="Appearance" col={2} row={9} h={2}><Appearance /></Tile>
      <Tile label="Bill name" col={3} row={7} w={2}><TitleField /></Tile>
      <Tile label="Chat" col={5} row={7} w={2} h={2}><Chat /></Tile>
      <Tile label="Message" col={5} row={9} w={2}><Composer /></Tile>
      <Tile label="Receipt upload" col={3} row={8} h={2}><Upload /></Tile>
      <Tile label="Group" col={3} row={10} h={2}><AvatarStack /></Tile>
      <Tile label="Tip" col={7} row={8} w={2}><TipSlider /></Tile>
      <Tile label="Request timer" col={5} row={10} h={2}><Countdown /></Tile>
      <Tile label="Rating" col={6} row={10} h={2}><Rating /></Tile>
      <Tile label="Questions" col={7} row={9} w={2} h={2}><Faq /></Tile>
      <Tile label="Tooltip" col={7} row={6} h={2}><TooltipDemo /></Tile>
      <Tile label="Progress" col={8} row={6} h={2}><Steps /></Tile>
      <Tile label="Verification code" col={1} row={11} w={2}><VerifyCode /></Tile>
      <Tile label="Pay" col={7} row={11} w={2}><PayButton /></Tile>
    </Board>
  );
}

/** Second screen: a team workspace. Larger tiles (table, chart) set the rhythm. */
function WorkspaceBoard() {
  return (
    <Board label="Team workspace">
      <Tile label="Sprint tasks" col={1} row={1} w={4} h={3} tone="raised"><TaskTable /></Tile>
      <Tile label="Tasks completed" col={5} row={1} w={3} h={3}><TrendChart /></Tile>
      <Tile label="Velocity" col={8} row={1} h={2}><Kpi /></Tile>
      <Tile label="Task breakdown" col={8} row={3} h={2}><Donut /></Tile>
      <Tile label="Status message" col={1} row={4} w={2}><AlertBanner /></Tile>
      <Tile label="Location" col={3} row={4} w={2}><Breadcrumbs /></Tile>
      <Tile label="Pages" col={5} row={4} w={3}><Pager /></Tile>
      <Tile label="Command palette" col={1} row={5} w={2} h={4} className="@container"><CommandPalette /></Tile>
      <Tile label="Navigation" col={3} row={5} h={4}><SideNav /></Tile>
      <Tile label="Team" col={8} row={5} h={2}><MemberHoverCard /></Tile>
      <Tile label="Drawer" col={8} row={7} h={2}><DrawerDemo /></Tile>
      <Tile label="Project" col={4} row={5} w={2} h={2}><TabsPanel /></Tile>
      <Tile label="Activity" col={6} row={5} w={2} h={3}><Timeline /></Tile>
      <Tile label="Confirm delete" col={4} row={7} w={2} h={2}><ConfirmDialog /></Tile>
      <Tile label="Assignee" col={6} row={8} w={2}><AssignField /></Tile>
      <Tile label="Task" col={1} row={9} w={2} h={3}><TaskCard /></Tile>
      <Tile label="Menu" col={3} row={9} h={2}><MenuDemo /></Tile>
      <Tile label="Profile" col={4} row={9} h={2}><SkeletonCard /></Tile>
      <Tile label="Date range" col={3} row={11} w={2}><DateRangeField /></Tile>
      <Tile label="Update" col={5} row={9} w={2} h={2}><NoteArea /></Tile>
      <Tile label="Attachments" col={7} row={9} h={2}><Dropzone /></Tile>
      <Tile label="Tasks" col={8} row={9} h={2}><EmptyState /></Tile>
      <Tile label="Password" col={5} row={11} w={2}><PasswordStrength /></Tile>
      <Tile label="Labels" col={7} row={11} w={2}><TagInput /></Tile>
    </Board>
  );
}

const SCREENS = [
  { id: "split", label: "Splitting a bill", content: <Replayable><SplitBoard /></Replayable> },
  { id: "workspace", label: "Team workspace", content: <Replayable><WorkspaceBoard /></Replayable> },
];

export function App() {
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
