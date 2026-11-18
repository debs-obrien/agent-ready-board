<script setup lang="ts">
import type { Card, Column, ColumnId, Person } from '~/types/board'

const props = defineProps<{
  card: Card
  columns: Column[]
  people: Person[]
  isDragging: boolean
  isDropTarget: boolean
  isKeyboardLifted: boolean
}>()

const emit = defineEmits<{
  dragStart: [cardId: string, event: DragEvent]
  dragEnd: []
  dragOver: [cardId: string, event: DragEvent]
  dropOnCard: [cardId: string]
  edit: [cardId: string]
  delete: [cardId: string]
  moveTo: [cardId: string, columnId: ColumnId]
  assign: [cardId: string, assigneeId: string | null]
  keyboardActivate: [cardId: string]
  focusCard: [cardId: string]
}>()

function onDragStart(event: DragEvent) {
  emit('dragStart', props.card.id, event)
}

function onKeydown(event: KeyboardEvent) {
  // Space/Enter handled by board for lift/drop; don't steal from inputs/buttons
  const target = event.target as HTMLElement
  if (target.closest('button, input, textarea, [role="menu"], [role="listbox"]')) {
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    emit('keyboardActivate', props.card.id)
  }
}
</script>

<template>
  <article
    class="card"
    :class="{
      'is-dragging': isDragging,
      'is-drop-target': isDropTarget,
      'is-lifted': isKeyboardLifted,
    }"
    draggable="true"
    tabindex="0"
    :aria-grabbed="isKeyboardLifted || isDragging"
    :data-card-id="card.id"
    @dragstart="onDragStart"
    @dragend="emit('dragEnd')"
    @dragover="emit('dragOver', card.id, $event)"
    @drop.prevent="emit('dropOnCard', card.id)"
    @keydown="onKeydown"
    @focus="emit('focusCard', card.id)"
  >
    <div class="card__header">
      <h3 class="card__title">{{ card.title }}</h3>
      <CardActionsMenu
        :columns="columns"
        :current-column-id="card.columnId"
        @edit="emit('edit', card.id)"
        @delete="emit('delete', card.id)"
        @move-to="(columnId) => emit('moveTo', card.id, columnId)"
      />
    </div>

    <p v-if="card.description" class="card__description">
      {{ card.description }}
    </p>

    <AssignPicker
      :people="people"
      :model-value="card.assigneeId"
      @update:model-value="(value) => emit('assign', card.id, value)"
    />

    <p v-if="isKeyboardLifted" class="card__hint">
      Arrow keys move · Space drops · Esc cancels
    </p>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(26, 35, 50, 0.04);
  cursor: grab;
  transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.card:active {
  cursor: grabbing;
}

.card.is-dragging {
  opacity: 0.45;
}

.card.is-drop-target {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

.card.is-lifted {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft), var(--shadow);
  transform: translateY(-2px);
}

.card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.card__title {
  flex: 1;
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.35;
}

.card__description {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.85rem;
  line-height: 1.45;
}

.card__hint {
  margin: 0;
  padding: 0.35rem 0.45rem;
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.75rem;
}
</style>
