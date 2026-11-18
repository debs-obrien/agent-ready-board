<script setup lang="ts">
import type { Card, ColumnId } from '~/composables/useBoard'

const props = defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  dragStart: [cardId: string, event: DragEvent]
  dragEnd: []
}>()

const {
  getPerson,
  updateCard,
  deleteCard,
  moveCard,
  moveCardRelative,
} = useBoard()

const editing = ref(false)
const cardRef = ref<HTMLElement | null>(null)

const assignee = computed(() => getPerson(props.card.assigneeId))

function onAssigneeUpdate(assigneeId: string | null) {
  updateCard(props.card.id, { assigneeId })
}

function onEditSave(payload: { title: string; description: string }) {
  updateCard(props.card.id, payload)
  editing.value = false
}

function onMoveTo(columnId: ColumnId) {
  moveCard(props.card.id, columnId)
}

function onDelete() {
  deleteCard(props.card.id)
}

function onDragStart(event: DragEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('button, input, textarea, a, [role="menu"], [role="listbox"]')) {
    event.preventDefault()
    return
  }
  event.dataTransfer?.setData('text/plain', props.card.id)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
  emit('dragStart', props.card.id, event)
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target !== cardRef.value) return

  const map: Record<string, 'up' | 'down' | 'left' | 'right'> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }
  const direction = map[event.key]
  if (!direction) return

  event.preventDefault()
  moveCardRelative(props.card.id, direction)
  nextTick(() => {
    document.getElementById(`card-${props.card.id}`)?.focus()
  })
}
</script>

<template>
  <article
    :id="`card-${card.id}`"
    ref="cardRef"
    class="card"
    tabindex="0"
    draggable="true"
    :aria-label="`${card.title}${assignee ? `, assigned to ${assignee.name}` : ', unassigned'}`"
    @dragstart="onDragStart"
    @dragend="emit('dragEnd')"
    @keydown="onKeydown"
  >
    <div class="card-top">
      <h3 class="card-title">{{ card.title }}</h3>
      <CardActionsMenu
        :card-id="card.id"
        :current-column-id="card.columnId"
        @edit="editing = true"
        @delete="onDelete"
        @move-to="onMoveTo"
      />
    </div>

    <p v-if="card.description" class="card-desc">{{ card.description }}</p>

    <AssignPicker
      :card-id="card.id"
      :model-value="card.assigneeId"
      @update:model-value="onAssigneeUpdate"
    />

    <p class="card-hint">
      Drag, or focus and use arrow keys to move
    </p>

    <EditCardDialog
      :open="editing"
      :title="card.title"
      :description="card.description"
      @close="editing = false"
      @save="onEditSave"
    />
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  cursor: grab;
}

.card:active {
  cursor: grabbing;
}

.card:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 650;
  line-height: 1.3;
}

.card-desc {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.88rem;
}

.card-hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.72rem;
}
</style>
