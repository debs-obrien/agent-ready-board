<script setup lang="ts">
import type { Card, Column, ColumnId, Person } from '~/types/board'

defineProps<{
  column: Column
  cards: Card[]
  columns: Column[]
  people: Person[]
  draggingCardId: string | null
  dropTargetCardId: string | null
  keyboardLiftedId: string | null
  isColumnDropTarget: boolean
}>()

const emit = defineEmits<{
  dragStart: [cardId: string, event: DragEvent]
  dragEnd: []
  dragOverCard: [cardId: string, event: DragEvent]
  dragOverColumn: [columnId: ColumnId, event: DragEvent]
  dropOnCard: [cardId: string]
  dropOnColumn: [columnId: ColumnId]
  edit: [cardId: string]
  delete: [cardId: string]
  moveTo: [cardId: string, columnId: ColumnId]
  assign: [cardId: string, assigneeId: string | null]
  keyboardActivate: [cardId: string]
  focusCard: [cardId: string]
}>()
</script>

<template>
  <section
    class="column"
    :class="{ 'is-drop-target': isColumnDropTarget }"
    :aria-label="column.title"
    @dragover.prevent="emit('dragOverColumn', column.id, $event)"
    @drop.prevent="emit('dropOnColumn', column.id)"
  >
    <header class="column__header">
      <h2>{{ column.title }}</h2>
      <span class="column__count" :aria-label="`${cards.length} cards`">
        {{ cards.length }}
      </span>
    </header>

    <div class="column__list" role="list">
      <KanbanCard
        v-for="card in cards"
        :key="card.id"
        role="listitem"
        :card="card"
        :columns="columns"
        :people="people"
        :is-dragging="draggingCardId === card.id"
        :is-drop-target="dropTargetCardId === card.id"
        :is-keyboard-lifted="keyboardLiftedId === card.id"
        @drag-start="(id, event) => emit('dragStart', id, event)"
        @drag-end="emit('dragEnd')"
        @drag-over="(id, event) => emit('dragOverCard', id, event)"
        @drop-on-card="(id) => emit('dropOnCard', id)"
        @edit="(id) => emit('edit', id)"
        @delete="(id) => emit('delete', id)"
        @move-to="(id, columnId) => emit('moveTo', id, columnId)"
        @assign="(id, assigneeId) => emit('assign', id, assigneeId)"
        @keyboard-activate="(id) => emit('keyboardActivate', id)"
        @focus-card="(id) => emit('focusCard', id)"
      />
    </div>
  </section>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 28rem;
  padding: 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(6px);
}

.column.is-drop-target {
  border-color: var(--accent);
  background: rgba(232, 240, 254, 0.65);
}

.column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.15rem 0.2rem;
}

.column__header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 650;
  letter-spacing: 0.01em;
}

.column__count {
  display: inline-grid;
  place-items: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--ink-muted);
  font-size: 0.75rem;
  font-family: var(--mono);
}

.column__list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex: 1;
  min-height: 4rem;
}
</style>
