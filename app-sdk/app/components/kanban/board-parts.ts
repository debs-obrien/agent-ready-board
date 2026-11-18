import { createParts } from "@ui-sdk/vue/primitive"
import { board } from "./board"

const {
  Root: KanbanRoot,
  Column: KanbanColumn,
  Card: KanbanCard,
  Handle: KanbanHandle,
} = createParts(board, {
  root: "div",
  column: "div",
  card: "div",
  handle: "button",
})

export { KanbanCard, KanbanColumn, KanbanHandle, KanbanRoot }
