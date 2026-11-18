<script setup lang="ts">
import { PEOPLE, type Person } from '~/composables/useBoard'

const props = defineProps<{
  modelValue: string | null
  cardId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const open = ref(false)
const query = ref('')
const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const listboxId = computed(() => `assign-list-${props.cardId}`)

const selected = computed(() =>
  PEOPLE.find(person => person.id === props.modelValue) ?? null,
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return PEOPLE
  return PEOPLE.filter(person => person.name.toLowerCase().includes(q))
})

function openPicker() {
  open.value = true
  query.value = ''
  nextTick(() => inputRef.value?.focus())
}

function closePicker() {
  open.value = false
  query.value = ''
}

function selectPerson(person: Person | null) {
  emit('update:modelValue', person?.id ?? null)
  closePicker()
}

function onDocumentPointerDown(event: MouseEvent) {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(event.target as Node)) closePicker()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    closePicker()
  }
}

onMounted(() => document.addEventListener('mousedown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentPointerDown))
</script>

<template>
  <div ref="rootRef" class="assign" @keydown="onKeydown">
    <span class="assign-label">Assign to</span>
    <button
      type="button"
      class="assign-trigger"
      :aria-expanded="open"
      :aria-controls="listboxId"
      @click="open ? closePicker() : openPicker()"
    >
      <span>{{ selected?.name ?? 'Unassigned' }}</span>
      <span class="chevron" aria-hidden="true">▾</span>
    </button>

    <div
      v-if="open"
      :id="listboxId"
      class="assign-panel"
      role="listbox"
      :aria-label="`Assign card`"
    >
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        class="assign-search"
        placeholder="Search people…"
        aria-label="Search people"
        autocomplete="off"
      >
      <button
        type="button"
        class="assign-option"
        role="option"
        :aria-selected="modelValue === null"
        @click="selectPerson(null)"
      >
        Unassigned
      </button>
      <button
        v-for="person in filtered"
        :key="person.id"
        type="button"
        class="assign-option"
        role="option"
        :aria-selected="modelValue === person.id"
        @click="selectPerson(person)"
      >
        {{ person.name }}
      </button>
      <p v-if="filtered.length === 0" class="assign-empty">No matches</p>
    </div>
  </div>
</template>

<style scoped>
.assign {
  position: relative;
}

.assign-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.assign-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-muted);
  text-align: left;
}

.assign-trigger:hover {
  border-color: var(--border-strong);
}

.chevron {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.assign-panel {
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
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.assign-search {
  width: 100%;
  margin-bottom: 0.25rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
}

.assign-option {
  width: 100%;
  padding: 0.45rem 0.5rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  text-align: left;
}

.assign-option:hover,
.assign-option[aria-selected='true'] {
  background: var(--accent-soft);
}

.assign-empty {
  margin: 0.35rem 0.25rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
