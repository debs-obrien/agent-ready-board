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
const showMove = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

onClickOutside(root, () => {
  open.value = false
  showMove.value = false
})

const moveTargets = computed(() =>
  props.columns.filter(c => c.id !== props.currentColumnId),
)

function toggle() {
  open.value = !open.value
  showMove.value = false
}

function chooseEdit() {
  open.value = false
  emit('edit')
}

function chooseDelete() {
  open.value = false
  emit('delete')
}

function chooseMove(columnId: ColumnId) {
  open.value = false
  showMove.value = false
  emit('moveTo', columnId)
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    if (showMove.value) {
      showMove.value = false
      return
    }
    open.value = false
    trigger.value?.focus()
  }
}
</script>

<template>
  <div ref="root" class="menu" @keydown="onMenuKeydown">
    <button
      ref="trigger"
      type="button"
      class="menu__trigger"
      aria-label="Card actions"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggle"
    >
      ⋯
    </button>

    <div v-if="open" class="menu__panel" role="menu">
      <button type="button" role="menuitem" class="menu__item" @click.stop="chooseEdit">
        Edit
      </button>
      <button
        type="button"
        role="menuitem"
        class="menu__item"
        :aria-expanded="showMove"
        @click.stop="showMove = !showMove"
      >
        Move to…
      </button>
      <div v-if="showMove" class="menu__submenu" role="group" aria-label="Move to column">
        <button
          v-for="column in moveTargets"
          :key="column.id"
          type="button"
          role="menuitem"
          class="menu__item menu__item--sub"
          @click.stop="chooseMove(column.id)"
        >
          {{ column.title }}
        </button>
      </div>
      <button type="button" role="menuitem" class="menu__item menu__item--danger" @click.stop="chooseDelete">
        Delete
      </button>
    </div>
  </div>
</template>

<style scoped>
.menu {
  position: relative;
}

.menu__trigger {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 1.1rem;
  line-height: 1;
}

.menu__trigger:hover,
.menu__trigger[aria-expanded="true"] {
  border-color: var(--border);
  background: var(--surface-muted);
  color: var(--ink);
}

.menu__panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 25;
  min-width: 10rem;
  padding: 0.3rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.menu__item {
  display: block;
  width: 100%;
  padding: 0.45rem 0.6rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  text-align: left;
}

.menu__item:hover {
  background: var(--accent-soft);
}

.menu__item--sub {
  padding-left: 1rem;
  font-size: 0.9rem;
}

.menu__item--danger {
  color: var(--danger);
}

.menu__item--danger:hover {
  background: var(--danger-soft);
}

.menu__submenu {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin: 0.1rem 0 0.2rem;
}
</style>
