<script setup lang="ts">
import type { Card, Column, ColumnId, Person } from '~/types/board'

defineProps<{
  column: Column
  cards: Card[]
  columns: Column[]
  people: Person[]
  draggingCardId: string | null
  dropTarget: { columnId: ColumnId; index: number } | null
  keyboardCardId: string | null
}>()

const emit = defineEmits<{
  'update:assignee': [cardId: string, assigneeId: string | null]
  edit: [cardId: string]
  delete: [cardId: string]
  moveTo: [cardId: string, columnId: ColumnId]
  dragStart: [cardId: string, event: DragEvent]
  dragEnd: []
  dragOverCard: [columnId: ColumnId, index: number, event: DragEvent]
  dragOverColumn: [columnId: ColumnId, event: DragEvent]
  dropOnCard: [columnId: ColumnId, index: number, event: DragEvent]
  dropOnColumn: [columnId: ColumnId, event: DragEvent]
  keyboardToggle: [cardId: string]
  keyboardMove: [cardId: string, event: KeyboardEvent]
}>()
</script>

<template>
  <section
    class="column"
    :class="{ 'column-active': dropTarget?.columnId === column.id && dropTarget.index === cards.length }"
    @dragover="emit('dragOverColumn', column.id, $event)"
    @drop="emit('dropOnColumn', column.id, $event)"
  >
    <header class="column-header">
      <h2>{{ column.title }}</h2>
      <span class="count" :aria-label="`${cards.length} cards`">{{ cards.length }}</span>
    </header>

    <div class="card-list" role="list">
      <KanbanCard
        v-for="(card, index) in cards"
        :key="card.id"
        role="listitem"
        :card="card"
        :columns="columns"
        :people="people"
        :index="index"
        :is-dragging="draggingCardId === card.id"
        :is-drop-target="dropTarget?.columnId === column.id && dropTarget.index === index"
        :is-keyboard-lifted="keyboardCardId === card.id"
        @update:assignee="emit('update:assignee', card.id, $event)"
        @edit="emit('edit', card.id)"
        @delete="emit('delete', card.id)"
        @move-to="emit('moveTo', card.id, $event)"
        @drag-start="emit('dragStart', card.id, $event)"
        @drag-end="emit('dragEnd')"
        @drag-over="emit('dragOverCard', column.id, index, $event)"
        @drop="emit('dropOnCard', column.id, index, $event)"
        @keyboard-toggle="emit('keyboardToggle', card.id)"
        @keyboard-move="emit('keyboardMove', card.id, $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.column {
  display: flex;
  min-height: 28rem;
  flex-direction: column;
  gap: 0.85rem;
  border: 1px solid rgba(154, 171, 189, 0.55);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
  padding: 0.9rem;
}

.column-active {
  border-color: var(--accent);
  background: rgba(216, 243, 234, 0.35);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.15rem 0.2rem;
}

h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.count {
  display: inline-grid;
  min-width: 1.6rem;
  place-items: center;
  border-radius: 999px;
  background: #e7edf3;
  color: var(--muted);
  padding: 0.15rem 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.card-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.7rem;
  min-height: 8rem;
}
</style>
