<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { Column, ColumnId } from '~/types/board'

const props = defineProps<{
  columns: Column[]
  currentColumnId: ColumnId
}>()

const emit = defineEmits<{
  edit: []
  moveTo: [columnId: ColumnId]
  delete: []
}>()

const open = ref(false)
const moveOpen = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

onClickOutside(root, () => {
  open.value = false
  moveOpen.value = false
})

const destinations = computed(() =>
  props.columns.filter(column => column.id !== props.currentColumnId),
)

function toggle() {
  open.value = !open.value
  moveOpen.value = false
}

function onEdit() {
  open.value = false
  emit('edit')
}

function onDelete() {
  open.value = false
  emit('delete')
}

function onMoveTo(columnId: ColumnId) {
  open.value = false
  moveOpen.value = false
  emit('moveTo', columnId)
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    if (moveOpen.value) {
      moveOpen.value = false
    } else {
      open.value = false
      trigger.value?.focus()
    }
  }
}
</script>

<template>
  <div ref="root" class="menu" @keydown="onMenuKeydown">
    <button
      ref="trigger"
      type="button"
      class="menu-trigger"
      aria-label="Card actions"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggle"
    >
      ⋯
    </button>

    <div v-if="open" class="dropdown" role="menu" @click.stop>
      <button type="button" role="menuitem" @click="onEdit">Edit</button>
      <button
        type="button"
        role="menuitem"
        :aria-expanded="moveOpen"
        @click="moveOpen = !moveOpen"
      >
        Move to…
      </button>
      <div v-if="moveOpen" class="submenu" role="group" aria-label="Move to column">
        <button
          v-for="column in destinations"
          :key="column.id"
          type="button"
          role="menuitem"
          @click="onMoveTo(column.id)"
        >
          {{ column.title }}
        </button>
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
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font-size: 1.15rem;
  line-height: 1;
}

.menu-trigger:hover,
.menu-trigger[aria-expanded='true'] {
  border-color: var(--line);
  background: #f3f6f9;
  color: var(--ink);
}

.dropdown {
  position: absolute;
  z-index: 30;
  top: calc(100% + 0.25rem);
  right: 0;
  min-width: 10.5rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 0.35rem;
}

.dropdown > button,
.submenu > button {
  display: block;
  width: 100%;
  border: 0;
  border-radius: 8px;
  background: transparent;
  padding: 0.5rem 0.65rem;
  color: inherit;
  text-align: left;
}

.dropdown > button:hover,
.submenu > button:hover {
  background: #eef6f3;
}

.submenu {
  margin: 0.15rem 0 0.35rem;
  border-left: 2px solid var(--accent-soft);
  padding-left: 0.25rem;
}

.danger {
  color: var(--danger);
}

.danger:hover {
  background: var(--danger-soft) !important;
}
</style>
