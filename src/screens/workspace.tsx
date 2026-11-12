import { Board, Tile } from "@/components/kit";
import { Donut, Kpi, TaskCard, TaskTable, Timeline, TrendChart } from "@/tiles/workspace/Data";
import { AlertBanner, EmptyState, PasswordStrength, SkeletonCard } from "@/tiles/workspace/Feedback";
import { AssignField, DateRangeField, Dropzone, NoteArea, TagInput } from "@/tiles/workspace/Inputs";
import { Breadcrumbs, Pager, SideNav, TabsPanel } from "@/tiles/workspace/Navigation";
import { CommandPalette, ConfirmDialog, DrawerDemo, MemberHoverCard, MenuDemo } from "@/tiles/workspace/Overlays";

/**
 * Second screen: a team workspace. Larger tiles (table, chart) set the rhythm.
 *
 * `col` / `row` pin each tile on the 8 x 11 desktop board. Below 1320px the
 * board reflows (4, then 2 columns) in source order, so tiles are listed in
 * an order that packs cleanly: single-width tiles come in pairs.
 */
export default function WorkspaceBoard() {
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
