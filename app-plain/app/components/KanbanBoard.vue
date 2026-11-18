<script setup lang="ts">
import type { ColumnId } from '~/composables/useBoard'

const { columns, cardsInColumn, moveCard, announcement } = useBoard()

const draggingCardId = ref<string | null>(null)

function onDragStart(cardId: string) {
  draggingCardId.value = cardId
}

function onDragEnd() {
  draggingCardId.value = null
}

function onDropCard(payload: { cardId: string; columnId: ColumnId; index: number }) {
  const { cardId, columnId, index } = payload
  const current = cardsInColumn(columnId)
  const fromIndex = current.findIndex(card => card.id === cardId)

  let targetIndex = index
  // When moving within the same column and dragging downward, account for removal
  if (fromIndex !== -1 && fromIndex < index) {
    targetIndex = index - 1
  }

  moveCard(cardId, columnId, targetIndex)
  draggingCardId.value = null
}
</script>

<template>
  <div class="board-wrap">
    <div class="sr-only" aria-live="polite">{{ announcement }}</div>

    <div class="board" role="region" aria-label="Kanban board">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :column-id="column.id"
        :title="column.title"
        :cards="cardsInColumn(column.id)"
        :dragging-card-id="draggingCardId"
        @drop-card="onDropCard"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
      />
    </div>
  </div>
</template>

<style scoped>
.board-wrap {
  width: 100%;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  align-items: start;
}

@media (max-width: 900px) {
  .board {
    grid-template-columns: 1fr;
  }
}
</style>
