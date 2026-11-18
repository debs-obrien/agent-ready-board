<script setup lang="ts">
import type { Card, ColumnId } from '~/composables/useBoard'

const props = defineProps<{
  columnId: ColumnId
  title: string
  cards: Card[]
  draggingCardId: string | null
}>()

const emit = defineEmits<{
  dropCard: [payload: { cardId: string; columnId: ColumnId; index: number }]
  dragStart: [cardId: string]
  dragEnd: []
}>()

const overIndex = ref<number | null>(null)

function onDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  overIndex.value = index
}

function onDragLeave() {
  overIndex.value = null
}

function onDrop(event: DragEvent, index: number) {
  event.preventDefault()
  const cardId = event.dataTransfer?.getData('text/plain')
  overIndex.value = null
  if (!cardId) return
  emit('dropCard', { cardId, columnId: props.columnId, index })
}

function onColumnDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onColumnDrop(event: DragEvent) {
  // Only handle drops on empty area / column itself (not already handled by slot)
  if ((event.target as HTMLElement).closest('.card, .drop-slot')) return
  event.preventDefault()
  const cardId = event.dataTransfer?.getData('text/plain')
  if (!cardId) return
  emit('dropCard', { cardId, columnId: props.columnId, index: props.cards.length })
}
</script>

<template>
  <section
    class="column"
    :aria-labelledby="`column-${columnId}`"
    @dragover="onColumnDragOver"
    @drop="onColumnDrop"
  >
    <header class="column-header">
      <h2 :id="`column-${columnId}`">{{ title }}</h2>
      <span class="count" :aria-label="`${cards.length} cards`">{{ cards.length }}</span>
    </header>

    <div class="column-body">
      <div
        class="drop-slot"
        :class="{ active: overIndex === 0 }"
        @dragover="onDragOver($event, 0)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, 0)"
      />

      <template v-for="(card, index) in cards" :key="card.id">
        <KanbanCard
          :card="card"
          :class="{ dragging: draggingCardId === card.id }"
          @drag-start="(id) => emit('dragStart', id)"
          @drag-end="emit('dragEnd')"
        />
        <div
          class="drop-slot"
          :class="{ active: overIndex === index + 1 }"
          @dragover="onDragOver($event, index + 1)"
          @dragleave="onDragLeave"
          @drop="onDrop($event, index + 1)"
        />
      </template>

      <p v-if="cards.length === 0" class="empty">Drop cards here</p>
    </div>
  </section>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem 0.55rem;
}

.column-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.count {
  min-width: 1.5rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

.column-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 12rem;
  padding: 0.35rem 0.75rem 0.9rem;
}

.drop-slot {
  height: 8px;
  border-radius: 6px;
  transition: height 0.12s ease, background 0.12s ease;
}

.drop-slot.active {
  height: 28px;
  background: var(--accent-soft);
  border: 1px dashed var(--accent);
  margin: 0.15rem 0;
}

.empty {
  margin: 0.75rem 0.25rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
}

:deep(.dragging) {
  opacity: 0.45;
}
</style>
