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
  props.people.find(person => person.id === props.modelValue) ?? null,
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.people
  return props.people.filter(person => person.name.toLowerCase().includes(q))
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
    activeIndex.value = Math.min(filtered.value.length, activeIndex.value + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = Math.max(0, activeIndex.value - 1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (activeIndex.value === 0) {
      select(null)
    } else {
      const person = filtered.value[activeIndex.value - 1]
      if (person) select(person)
    }
  } else if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
  }
}
</script>

<template>
  <div ref="root" class="picker">
    <button
      type="button"
      class="picker-trigger"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="toggle"
    >
      <span v-if="selected" class="avatar" aria-hidden="true">{{ selected.initials }}</span>
      <span v-else class="avatar empty" aria-hidden="true">?</span>
      <span class="label">
        <span class="eyebrow">Assign to</span>
        <span>{{ selected ? selected.name : 'Unassigned' }}</span>
      </span>
      <span class="chevron" aria-hidden="true">▾</span>
    </button>

    <div v-if="open" class="popover" role="listbox" @click.stop>
      <input
        ref="searchInput"
        v-model="query"
        type="search"
        class="search"
        placeholder="Search people"
        aria-label="Search people"
        @keydown="onSearchKeydown"
      >
      <button
        type="button"
        class="option"
        role="option"
        :aria-selected="modelValue === null"
        :class="{ active: activeIndex === 0 }"
        @mouseenter="activeIndex = 0"
        @click="select(null)"
      >
        Unassigned
      </button>
      <button
        v-for="(person, index) in filtered"
        :key="person.id"
        type="button"
        class="option"
        role="option"
        :aria-selected="modelValue === person.id"
        :class="{ active: activeIndex === index + 1 }"
        @mouseenter="activeIndex = index + 1"
        @click="select(person)"
      >
        <span class="avatar" aria-hidden="true">{{ person.initials }}</span>
        {{ person.name }}
      </button>
      <p v-if="filtered.length === 0" class="empty-state">No matches</p>
    </div>
  </div>
</template>

<style scoped>
.picker {
  position: relative;
}

.picker-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #f7fafc;
  padding: 0.4rem 0.55rem;
  color: inherit;
  text-align: left;
}

.label {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.05rem;
}

.eyebrow {
  color: var(--muted);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.label > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.88rem;
}

.chevron {
  color: var(--muted);
  font-size: 0.75rem;
}

.avatar {
  display: inline-grid;
  width: 1.7rem;
  height: 1.7rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.68rem;
  font-weight: 600;
}

.avatar.empty {
  background: #edf1f5;
  color: var(--muted);
}

.popover {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.35rem);
  left: 0;
  width: min(100%, 16rem);
  min-width: 14rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 0.45rem;
}

.search {
  width: 100%;
  margin-bottom: 0.35rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0.45rem 0.55rem;
}

.option {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.55rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  padding: 0.45rem 0.5rem;
  color: inherit;
  text-align: left;
}

.option.active,
.option:hover {
  background: #eef6f3;
}

.empty-state {
  margin: 0.35rem 0.5rem;
  color: var(--muted);
  font-size: 0.85rem;
}
</style>
