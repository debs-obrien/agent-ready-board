<script setup lang="ts">
import { COLUMNS, type ColumnId } from '~/composables/useBoard'

const props = defineProps<{
  cardId: string
  currentColumnId: ColumnId
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  moveTo: [columnId: ColumnId]
}>()

const open = ref(false)
const moveOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const menuId = computed(() => `card-menu-${props.cardId}`)

const otherColumns = computed(() =>
  COLUMNS.filter(column => column.id !== props.currentColumnId),
)

function toggle() {
  open.value = !open.value
  if (!open.value) moveOpen.value = false
}

function close() {
  open.value = false
  moveOpen.value = false
}

function onEdit() {
  close()
  emit('edit')
}

function onDelete() {
  close()
  emit('delete')
}

function onMoveTo(columnId: ColumnId) {
  close()
  emit('moveTo', columnId)
}

function onDocumentPointerDown(event: MouseEvent) {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    if (moveOpen.value) moveOpen.value = false
    else close()
  }
}

onMounted(() => document.addEventListener('mousedown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentPointerDown))
</script>

<template>
  <div ref="rootRef" class="menu" @keydown="onKeydown">
    <button
      type="button"
      class="menu-trigger"
      :aria-expanded="open"
      :aria-controls="menuId"
      aria-haspopup="menu"
      aria-label="Card actions"
      @click="toggle"
    >
      ⋯
    </button>

    <div
      v-if="open"
      :id="menuId"
      class="menu-panel"
      role="menu"
    >
      <button type="button" role="menuitem" @click="onEdit">Edit</button>
      <div class="submenu">
        <button
          type="button"
          role="menuitem"
          :aria-expanded="moveOpen"
          @click="moveOpen = !moveOpen"
        >
          Move to…
        </button>
        <div v-if="moveOpen" class="submenu-panel" role="menu">
          <button
            v-for="column in otherColumns"
            :key="column.id"
            type="button"
            role="menuitem"
            @click="onMoveTo(column.id)"
          >
            {{ column.title }}
          </button>
        </div>
      </div>
      <button type="button" role="menuitem" class="danger" @click="onDelete">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.menu {
  position: relative;
}

.menu-trigger {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1;
}

.menu-trigger:hover,
.menu-trigger[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--surface-muted);
  color: var(--text);
}

.menu-panel {
  position: absolute;
  z-index: 25;
  top: calc(100% + 4px);
  right: 0;
  min-width: 160px;
  padding: 0.35rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.menu-panel > button,
.submenu > button,
.submenu-panel > button {
  display: block;
  width: 100%;
  padding: 0.45rem 0.55rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  text-align: left;
}

.menu-panel > button:hover,
.submenu > button:hover,
.submenu-panel > button:hover {
  background: var(--accent-soft);
}

.danger {
  color: var(--danger);
}

.danger:hover {
  background: var(--danger-soft) !important;
}

.submenu {
  position: relative;
}

.submenu-panel {
  margin: 0.15rem 0 0.25rem;
  padding: 0.2rem;
  border-left: 2px solid var(--border);
  margin-left: 0.35rem;
}
</style>
