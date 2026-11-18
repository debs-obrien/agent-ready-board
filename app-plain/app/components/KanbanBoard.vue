<script setup lang="ts">
import type { ColumnId } from '~/types/board'

const {
  columns,
  people,
  cards,
  cardsInColumn,
  moveCard,
  updateCard,
  deleteCard,
  moveCardByDelta,
} = useBoard()

const draggingCardId = ref<string | null>(null)
const dropTarget = ref<{ columnId: ColumnId; index: number } | null>(null)
const keyboardCardId = ref<string | null>(null)
const keyboardOrigin = ref<{ columnId: ColumnId; index: number } | null>(null)
const editingCardId = ref<string | null>(null)

const editingCard = computed(() =>
  cards.value.find(card => card.id === editingCardId.value) ?? null,
)

function setAssignee(cardId: string, assigneeId: string | null) {
  updateCard(cardId, { assigneeId })
}

function openEdit(cardId: string) {
  editingCardId.value = cardId
}

function closeEdit() {
  editingCardId.value = null
}

function saveEdit(payload: { title: string; description: string }) {
  if (!editingCardId.value) return
  updateCard(editingCardId.value, payload)
  closeEdit()
}

function onDelete(cardId: string) {
  if (keyboardCardId.value === cardId) {
    keyboardCardId.value = null
    keyboardOrigin.value = null
  }
  deleteCard(cardId)
}

function onMoveTo(cardId: string, columnId: ColumnId) {
  moveCard(cardId, columnId)
}

function onDragStart(cardId: string, event: DragEvent) {
  draggingCardId.value = cardId
  keyboardCardId.value = null
  keyboardOrigin.value = null
  event.dataTransfer?.setData('text/plain', cardId)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragEnd() {
  draggingCardId.value = null
  dropTarget.value = null
}

function onDragOverCard(columnId: ColumnId, index: number, event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dropTarget.value = { columnId, index }
}

function onDragOverColumn(columnId: ColumnId, event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dropTarget.value = { columnId, index: cardsInColumn(columnId).length }
}

function resolveDropIndex(columnId: ColumnId, index: number, cardId: string) {
  const siblings = cardsInColumn(columnId)
  const fromIndex = siblings.findIndex(card => card.id === cardId)
  let toIndex = index
  if (fromIndex !== -1 && fromIndex < toIndex) {
    toIndex -= 1
  }
  return Math.max(0, Math.min(toIndex, siblings.length - (fromIndex === -1 ? 0 : 1)))
}

function onDropOnCard(columnId: ColumnId, index: number, event: DragEvent) {
  event.preventDefault()
  const cardId = event.dataTransfer?.getData('text/plain') || draggingCardId.value
  if (!cardId) return
  moveCard(cardId, columnId, resolveDropIndex(columnId, index, cardId))
  onDragEnd()
}

function onDropOnColumn(columnId: ColumnId, event: DragEvent) {
  event.preventDefault()
  const cardId = event.dataTransfer?.getData('text/plain') || draggingCardId.value
  if (!cardId) return
  moveCard(cardId, columnId)
  onDragEnd()
}

function focusCard(cardId: string) {
  nextTick(() => {
    const el = document.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement | null
    el?.focus()
  })
}

function onKeyboardToggle(cardId: string) {
  if (keyboardCardId.value === cardId) {
    keyboardCardId.value = null
    keyboardOrigin.value = null
    return
  }

  const card = cards.value.find(c => c.id === cardId)
  if (!card) return
  const index = cardsInColumn(card.columnId).findIndex(c => c.id === cardId)
  keyboardCardId.value = cardId
  keyboardOrigin.value = { columnId: card.columnId, index }
}

function onKeyboardMove(cardId: string, event: KeyboardEvent) {
  if (keyboardCardId.value !== cardId) return

  if (event.key === 'Escape') {
    if (keyboardOrigin.value) {
      moveCard(cardId, keyboardOrigin.value.columnId, keyboardOrigin.value.index)
    }
    keyboardCardId.value = null
    keyboardOrigin.value = null
    focusCard(cardId)
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    keyboardCardId.value = null
    keyboardOrigin.value = null
    focusCard(cardId)
    return
  }

  const deltas: Record<string, [number, number]> = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
  }
  const delta = deltas[event.key]
  if (!delta) return

  moveCardByDelta(cardId, delta[0], delta[1])
  focusCard(cardId)
}
</script>

<template>
  <div class="board-shell">
    <header class="hero">
      <div>
        <p class="eyebrow">In-memory board</p>
        <h1>Kanban</h1>
        <p class="lede">
          Drag cards with the pointer, or focus a card and press Space, then use arrow keys to move it.
        </p>
      </div>
    </header>

    <div class="board" role="region" aria-label="Kanban board">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :cards="cardsInColumn(column.id)"
        :columns="columns"
        :people="people"
        :dragging-card-id="draggingCardId"
        :drop-target="dropTarget"
        :keyboard-card-id="keyboardCardId"
        @update:assignee="setAssignee"
        @edit="openEdit"
        @delete="onDelete"
        @move-to="onMoveTo"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
        @drag-over-card="onDragOverCard"
        @drag-over-column="onDragOverColumn"
        @drop-on-card="onDropOnCard"
        @drop-on-column="onDropOnColumn"
        @keyboard-toggle="onKeyboardToggle"
        @keyboard-move="onKeyboardMove"
      />
    </div>

    <EditCardDialog
      :open="!!editingCard"
      :card="editingCard"
      @close="closeEdit"
      @save="saveEdit"
    />
  </div>
</template>

<style scoped>
.board-shell {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
}

.hero {
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
  letter-spacing: -0.03em;
}

.lede {
  max-width: 36rem;
  margin: 0.55rem 0 0;
  color: var(--muted);
  line-height: 1.5;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 900px) {
  .board {
    grid-template-columns: 1fr;
  }
}
</style>
