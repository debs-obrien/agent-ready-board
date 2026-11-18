<script setup lang="ts">
import type { ColumnId } from '~/types/board'

const {
  columns,
  people,
  cards,
  cardsByColumn,
  updateCard,
  deleteCard,
  moveCard,
  moveCardRelative,
} = useBoard()

const draggingCardId = ref<string | null>(null)
const dropTargetCardId = ref<string | null>(null)
const dropTargetColumnId = ref<ColumnId | null>(null)
const keyboardLiftedId = ref<string | null>(null)
const focusedCardId = ref<string | null>(null)

const editingCardId = ref<string | null>(null)
const editingCard = computed(() =>
  cards.value.find(c => c.id === editingCardId.value) ?? null,
)

const liveMessage = ref('')

function announce(message: string) {
  liveMessage.value = ''
  nextTick(() => {
    liveMessage.value = message
  })
}

function focusCardElement(cardId: string) {
  nextTick(() => {
    const el = document.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement | null
    el?.focus()
  })
}

function onDragStart(cardId: string, event: DragEvent) {
  keyboardLiftedId.value = null
  draggingCardId.value = cardId
  dropTargetCardId.value = null
  dropTargetColumnId.value = null
  event.dataTransfer?.setData('text/plain', cardId)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragEnd() {
  draggingCardId.value = null
  dropTargetCardId.value = null
  dropTargetColumnId.value = null
}

function onDragOverCard(cardId: string, event: DragEvent) {
  event.preventDefault()
  if (!draggingCardId.value || draggingCardId.value === cardId) return
  dropTargetCardId.value = cardId
  dropTargetColumnId.value = null
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDragOverColumn(columnId: ColumnId, event: DragEvent) {
  event.preventDefault()
  if (!draggingCardId.value) return
  // Prefer card-level targets when hovering a card
  const target = event.target as HTMLElement
  if (target.closest('[data-card-id]')) return
  dropTargetCardId.value = null
  dropTargetColumnId.value = columnId
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDropOnCard(targetCardId: string) {
  const sourceId = draggingCardId.value
  if (!sourceId || sourceId === targetCardId) {
    onDragEnd()
    return
  }
  const source = cards.value.find(c => c.id === sourceId)
  const target = cards.value.find(c => c.id === targetCardId)
  if (!source || !target) {
    onDragEnd()
    return
  }
  const list = cardsByColumn.value[target.columnId]
  const sourceIndex = list.findIndex(c => c.id === sourceId)
  const targetIndex = list.findIndex(c => c.id === targetCardId)
  let finalIndex = targetIndex
  if (source.columnId === target.columnId && sourceIndex !== -1 && sourceIndex < targetIndex) {
    finalIndex = targetIndex - 1
  }
  moveCard(sourceId, target.columnId, finalIndex)
  announce(`Moved card to ${columnTitle(target.columnId)}`)
  onDragEnd()
  focusCardElement(sourceId)
}

function onDropOnColumn(columnId: ColumnId) {
  const sourceId = draggingCardId.value
  if (!sourceId) {
    onDragEnd()
    return
  }
  const list = cardsByColumn.value[columnId]
  moveCard(sourceId, columnId, list.length)
  announce(`Moved card to ${columnTitle(columnId)}`)
  onDragEnd()
  focusCardElement(sourceId)
}

function columnTitle(columnId: ColumnId) {
  return columns.find(c => c.id === columnId)?.title ?? columnId
}

function onKeyboardActivate(cardId: string) {
  if (keyboardLiftedId.value === cardId) {
    keyboardLiftedId.value = null
    announce('Card dropped')
    return
  }
  keyboardLiftedId.value = cardId
  focusedCardId.value = cardId
  announce('Card picked up. Use arrow keys to move, Space to drop, Escape to cancel.')
}

function onBoardKeydown(event: KeyboardEvent) {
  const liftedId = keyboardLiftedId.value
  if (!liftedId) return

  const target = event.target as HTMLElement
  if (target.closest('input, textarea')) return

  if (event.key === 'Escape') {
    event.preventDefault()
    keyboardLiftedId.value = null
    announce('Move cancelled')
    focusCardElement(liftedId)
    return
  }

  const map: Record<string, 'up' | 'down' | 'left' | 'right'> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }
  const direction = map[event.key]
  if (!direction) return

  event.preventDefault()
  moveCardRelative(liftedId, direction)
  const card = cards.value.find(c => c.id === liftedId)
  if (card) {
    announce(`Moved to ${columnTitle(card.columnId)}`)
  }
  focusCardElement(liftedId)
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
  const id = editingCardId.value
  closeEdit()
  focusCardElement(id)
}

function onDelete(cardId: string) {
  deleteCard(cardId)
  keyboardLiftedId.value = null
  announce('Card deleted')
}

function onMoveTo(cardId: string, columnId: ColumnId) {
  const list = cardsByColumn.value[columnId]
  moveCard(cardId, columnId, list.length)
  announce(`Moved card to ${columnTitle(columnId)}`)
  focusCardElement(cardId)
}

function onAssign(cardId: string, assigneeId: string | null) {
  updateCard(cardId, { assigneeId })
}

onMounted(() => {
  window.addEventListener('keydown', onBoardKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onBoardKeydown)
})
</script>

<template>
  <div class="board-shell">
    <header class="board-header">
      <div>
        <p class="eyebrow">In-memory board</p>
        <h1>Kanban</h1>
      </div>
      <p class="hint">
        Drag cards, or focus one and press Space to pick it up, then use arrow keys.
      </p>
    </header>

    <div class="board" role="region" aria-label="Kanban board">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :cards="cardsByColumn[column.id]"
        :columns="columns"
        :people="people"
        :dragging-card-id="draggingCardId"
        :drop-target-card-id="dropTargetCardId"
        :keyboard-lifted-id="keyboardLiftedId"
        :is-column-drop-target="dropTargetColumnId === column.id"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
        @drag-over-card="onDragOverCard"
        @drag-over-column="onDragOverColumn"
        @drop-on-card="onDropOnCard"
        @drop-on-column="onDropOnColumn"
        @edit="openEdit"
        @delete="onDelete"
        @move-to="onMoveTo"
        @assign="onAssign"
        @keyboard-activate="onKeyboardActivate"
        @focus-card="(id) => (focusedCardId = id)"
      />
    </div>

    <EditCardDialog
      :open="!!editingCard"
      :title="editingCard?.title ?? ''"
      :description="editingCard?.description ?? ''"
      @close="closeEdit"
      @save="saveEdit"
    />

    <div class="sr-only" aria-live="polite">{{ liveMessage }}</div>
  </div>
</template>

<style scoped>
.board-shell {
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
}

.board-header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--ink-muted);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.board-header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  letter-spacing: -0.03em;
}

.hint {
  margin: 0;
  max-width: 28rem;
  color: var(--ink-muted);
  font-size: 0.92rem;
  line-height: 1.45;
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
