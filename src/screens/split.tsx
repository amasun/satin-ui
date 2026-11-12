import { Board, Tile } from "@/components/kit";
import { Chips, Rating, SplitMode, SplitSelect } from "@/tiles/Choices";
import { Actions, Faq, Steps, TipSlider, Toggles, TooltipDemo } from "@/tiles/Controls";
import { Composer, SearchField, TitleField } from "@/tiles/Fields";
import { Countdown, ProgressRing, Stat, Upload, VoiceNote } from "@/tiles/Media";
import { Appearance, PeopleStepper, PlanCalendar, ShareStepper, VerifyCode, ViewSwitch } from "@/tiles/Planning";
import { PayButton, SendCard, StatusPill } from "@/tiles/Sending";
import { AvatarStack, Chat, Toast, WhosIn } from "@/tiles/Social";

/**
 * First screen: splitting a bill with friends.
 *
 * `col` / `row` pin each tile on the 8 x 11 desktop board. Below 1320px the
 * board reflows (4, then 2 columns) in source order, so tiles are listed in
 * an order that packs cleanly: single-width tiles come in pairs.
 */
export default function SplitBoard() {
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
