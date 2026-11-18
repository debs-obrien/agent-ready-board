<script setup lang="ts">
import type { Card, Column, ColumnId, Person } from '~/types/board'

const props = defineProps<{
  card: Card
  columns: Column[]
  people: Person[]
  index: number
  isDragging: boolean
  isDropTarget: boolean
  isKeyboardLifted: boolean
}>()

const emit = defineEmits<{
  'update:assignee': [assigneeId: string | null]
  edit: []
  delete: []
  moveTo: [columnId: ColumnId]
  dragStart: [event: DragEvent]
  dragEnd: []
  dragOver: [event: DragEvent]
  drop: [event: DragEvent]
  keyboardToggle: []
  keyboardMove: [event: KeyboardEvent]
}>()

const assignee = computed({
  get: () => props.card.assigneeId,
  set: (value: string | null) => emit('update:assignee', value),
})

function onKeydown(event: KeyboardEvent) {
  if (props.isKeyboardLifted) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault()
      emit('keyboardMove', event)
    }
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    // Avoid fighting with buttons/inputs inside the card
    const target = event.target as HTMLElement
    if (target !== event.currentTarget) return
    event.preventDefault()
    emit('keyboardToggle')
  }
}
</script>

<template>
  <article
    class="card"
    :class="{
      dragging: isDragging,
      'drop-target': isDropTarget,
      lifted: isKeyboardLifted,
    }"
    :data-card-id="card.id"
    tabindex="0"
    :aria-grabbed="isKeyboardLifted || isDragging"
    :aria-label="`${card.title}. Press Space to pick up, then arrow keys to move, Space to drop.`"
    draggable="true"
    @dragstart="emit('dragStart', $event)"
    @dragend="emit('dragEnd')"
    @dragover="emit('dragOver', $event)"
    @drop="emit('drop', $event)"
    @keydown="onKeydown"
  >
    <div class="card-top">
      <h3>{{ card.title }}</h3>
      <CardActionsMenu
        :columns="columns"
        :current-column-id="card.columnId"
        @edit="emit('edit')"
        @delete="emit('delete')"
        @move-to="emit('moveTo', $event)"
      />
    </div>

    <p v-if="card.description" class="description">{{ card.description }}</p>

    <AssignPicker v-model="assignee" :people="people" />

    <p v-if="isKeyboardLifted" class="hint" aria-live="polite">
      Moving with keyboard — arrows reposition, Space drops, Escape cancels.
    </p>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  box-shadow: 0 1px 0 rgba(21, 32, 43, 0.04);
  padding: 0.85rem 0.85rem 0.9rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.card:hover {
  border-color: var(--line-strong);
}

.card.dragging {
  opacity: 0.45;
}

.card.drop-target {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

.card.lifted {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(15, 110, 86, 0.18), var(--shadow);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  justify-content: space-between;
}

h3 {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.35;
}

.description {
  margin: 0;
  color: var(--muted);
  font-size: 0.86rem;
  line-height: 1.45;
}

.hint {
  margin: 0;
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent);
  padding: 0.45rem 0.55rem;
  font-size: 0.78rem;
}
</style>
