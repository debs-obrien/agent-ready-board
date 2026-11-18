<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { Person } from '~/types/board'

const props = defineProps<{
  people: Person[]
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const open = ref(false)
const query = ref('')
const root = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const activeIndex = ref(0)

const selected = computed(() =>
  props.people.find(p => p.id === props.modelValue) ?? null,
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.people
  return props.people.filter(p => p.name.toLowerCase().includes(q))
})

onClickOutside(root, () => {
  open.value = false
})

watch(open, async (isOpen) => {
  if (isOpen) {
    query.value = ''
    activeIndex.value = 0
    await nextTick()
    searchInput.value?.focus()
  }
})

watch(filtered, (list) => {
  if (activeIndex.value >= list.length) {
    activeIndex.value = Math.max(0, list.length - 1)
  }
})

function toggle() {
  open.value = !open.value
}

function select(person: Person | null) {
  emit('update:modelValue', person?.id ?? null)
  open.value = false
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (filtered.value.length) {
      activeIndex.value = (activeIndex.value + 1) % filtered.value.length
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (filtered.value.length) {
      activeIndex.value = (activeIndex.value - 1 + filtered.value.length) % filtered.value.length
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const person = filtered.value[activeIndex.value]
    if (person) select(person)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
  }
}
</script>

<template>
  <div ref="root" class="assign">
    <button
      type="button"
      class="assign__trigger"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="toggle"
    >
      <span class="assign__label">Assign to</span>
      <span class="assign__value">{{ selected?.name ?? 'Unassigned' }}</span>
    </button>

    <div v-if="open" class="assign__popover" role="listbox" aria-label="Assign to">
      <input
        ref="searchInput"
        v-model="query"
        type="search"
        class="assign__search"
        placeholder="Search people…"
        aria-label="Search people"
        @keydown="onSearchKeydown"
        @click.stop
      >
      <button
        type="button"
        class="assign__option"
        role="option"
        :aria-selected="modelValue === null"
        @click.stop="select(null)"
      >
        Unassigned
      </button>
      <button
        v-for="(person, index) in filtered"
        :key="person.id"
        type="button"
        class="assign__option"
        :class="{ 'is-active': index === activeIndex }"
        role="option"
        :aria-selected="modelValue === person.id"
        @click.stop="select(person)"
        @mouseenter="activeIndex = index"
      >
        {{ person.name }}
      </button>
      <p v-if="filtered.length === 0" class="assign__empty">No matches</p>
    </div>
  </div>
</template>

<style scoped>
.assign {
  position: relative;
}

.assign__trigger {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  width: 100%;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-muted);
  color: inherit;
  text-align: left;
}

.assign__label {
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.assign__value {
  font-size: 0.85rem;
}

.assign__popover {
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-height: 220px;
  overflow: auto;
  padding: 0.4rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.assign__search {
  width: 100%;
  margin-bottom: 0.2rem;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}

.assign__option {
  width: 100%;
  padding: 0.45rem 0.55rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  text-align: left;
}

.assign__option.is-active,
.assign__option:hover {
  background: var(--accent-soft);
}

.assign__empty {
  margin: 0.35rem 0.4rem;
  color: var(--ink-muted);
  font-size: 0.85rem;
}
</style>
