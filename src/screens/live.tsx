import { Board, Tile } from "@/components/kit";
import { CaptionStrip, Chapters, LiveStatusBadge, PlaybackMenu, Player } from "@/tiles/live/Content";
import { Comments, LivePoll, QnA, RaiseHand } from "@/tiles/live/Interaction";
import { JoinNotice, OnlineCount, TypingIndicator, WatchingNow } from "@/tiles/live/Presence";
import { ComboCounter, EmojiBar, LikeButton, ReactionSummary } from "@/tiles/live/Reactions";
import { EngagementRing, OnlineTrend, PeakElapsed } from "@/tiles/live/Stats";

/**
 * Fifth screen: the live room of an online launch event. The stream and the
 * floating hearts set the rhythm; presence, reactions and stats read the
 * shared live store (`src/lib/live.ts`), the rest run their own demos.
 *
 * `col` / `row` pin each tile on the 8 x 11 desktop board. Below 1320px the
 * board reflows in source order, so single-width tiles come in pairs.
 */
export default function LiveBoard() {
  return (
    <Board label="Live event">
      <Tile label="Stream" col={1} row={1} w={4} h={3} tone="dark"><Player /></Tile>
      <Tile label="Online now" col={5} row={1} w={2} h={2} tone="raised"><OnlineCount /></Tile>
      <Tile label="Likes" col={7} row={1} w={2} h={4}><LikeButton /></Tile>
      <Tile label="Watching now" col={5} row={3} w={2}><WatchingNow /></Tile>
      <Tile label="Captions" col={1} row={4} w={4}><CaptionStrip /></Tile>
      <Tile label="Arrivals" col={5} row={4} w={2}><JoinNotice /></Tile>
      <Tile label="Broadcast status" col={5} row={5}><LiveStatusBadge /></Tile>
      <Tile label="Volume and quality" col={6} row={5}><PlaybackMenu /></Tile>
      <Tile label="Chapters" col={1} row={5} w={4}><Chapters /></Tile>
      <Tile label="Combo" col={7} row={5} w={2}><ComboCounter /></Tile>
      <Tile label="Comments" col={1} row={6} w={2} h={4}><Comments /></Tile>
      <Tile label="Poll" col={3} row={6} w={2} h={3}><LivePoll /></Tile>
      <Tile label="Questions" col={5} row={6} w={2} h={4} tone="raised"><QnA /></Tile>
      <Tile label="Online trend" col={7} row={6} w={2} h={3}><OnlineTrend /></Tile>
      <Tile label="Speaker queue" col={3} row={9} w={2} h={3}><RaiseHand /></Tile>
      <Tile label="Engagement" col={7} row={9} h={2}><EngagementRing /></Tile>
      <Tile label="Peak and time" col={8} row={9} h={2}><PeakElapsed /></Tile>
      <Tile label="Reactions" col={1} row={10} w={2} h={2}><EmojiBar /></Tile>
      <Tile label="Reaction mix" col={5} row={10} w={2} h={2}><ReactionSummary /></Tile>
      <Tile label="Typing" col={7} row={11} w={2}><TypingIndicator /></Tile>
    </Board>
  );
}
