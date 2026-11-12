import { Board, Tile } from "@/components/kit";
import { BranchSwitcher, FeedbackForm, HistoryList, ReplyActions } from "@/tiles/assistant/Actions";
import { Attachments, ModelPicker, PromptBox, SuggestedChips, VoiceInput } from "@/tiles/assistant/Input";
import { Citations, CodeBlock, ImageGrid, StreamingReply, ThinkingSteps, ToolCall } from "@/tiles/assistant/Output";
import { ContextMeter, ErrorRetry, ShortcutHints, TaskQueue, UsageQuota } from "@/tiles/assistant/Status";

/**
 * Fourth screen: a conversational assistant. The streaming reply and the
 * dark code block set the rhythm; the thinking steps sit right beside the reply.
 *
 * `col` / `row` pin each tile on the 8 x 11 desktop board. Below 1320px the
 * board reflows in source order, so single-width tiles are listed in pairs.
 */
export default function AssistantBoard() {
  return (
    <Board label="AI assistant">
      <Tile label="Streaming reply" col={1} row={1} w={3} h={4} tone="raised"><StreamingReply /></Tile>
      <Tile label="Thinking" col={4} row={1} w={2} h={2}><ThinkingSteps /></Tile>
      <Tile label="Model" col={6} row={1} w={2}><ModelPicker /></Tile>
      <Tile label="Usage" col={8} row={1} h={2}><UsageQuota /></Tile>
      <Tile label="Context length" col={8} row={3} h={2}><ContextMeter /></Tile>
      <Tile label="Generated images" col={6} row={2} w={2} h={3}><ImageGrid /></Tile>
      <Tile label="Reply versions" col={4} row={3} w={2}><BranchSwitcher /></Tile>
      <Tile label="Reply actions" col={4} row={4} w={2}><ReplyActions /></Tile>
      <Tile label="Prompt" col={1} row={5} w={3} h={2}><PromptBox /></Tile>
      <Tile label="Code" col={4} row={5} w={3} h={3} tone="dark"><CodeBlock /></Tile>
      <Tile label="Suggestions" col={7} row={5} w={2} h={2}><SuggestedChips /></Tile>
      <Tile label="Attachments" col={1} row={7} w={3}><Attachments /></Tile>
      <Tile label="Tool call" col={7} row={7} w={2} h={2}><ToolCall /></Tile>
      <Tile label="Sources" col={4} row={8} w={3} h={2}><Citations /></Tile>
      <Tile label="Conversations" col={1} row={8} w={2} h={3}><HistoryList /></Tile>
      <Tile label="Voice input" col={3} row={8} h={2}><VoiceInput /></Tile>
      <Tile label="Shortcuts" col={3} row={10} h={2}><ShortcutHints /></Tile>
      <Tile label="Feedback" col={7} row={9} w={2} h={3}><FeedbackForm /></Tile>
      <Tile label="Queue" col={4} row={10} w={3} h={2}><TaskQueue /></Tile>
      <Tile label="Connection" col={1} row={11} w={2}><ErrorRetry /></Tile>
    </Board>
  );
}
