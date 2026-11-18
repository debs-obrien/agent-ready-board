<script setup lang="ts">
import type { Card } from '~/types/board'

const props = defineProps<{
  card: Card | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { title: string; description: string }]
}>()

const title = ref('')
const description = ref('')
const titleInput = ref<HTMLInputElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

watch(
  () => [props.open, props.card] as const,
  async ([isOpen, card]) => {
    if (isOpen && card) {
      title.value = card.title
      description.value = card.description
      await nextTick()
      titleInput.value?.focus()
      titleInput.value?.select()
    }
  },
)

function close() {
  emit('close')
}

function save() {
  const nextTitle = title.value.trim()
  if (!nextTitle) {
    titleInput.value?.focus()
    return
  }
  emit('save', {
    title: nextTitle,
    description: description.value.trim(),
  })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && card"
      class="backdrop"
      @keydown="onKeydown"
      @click.self="close"
    >
      <div
        ref="dialog"
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-card-title"
      >
        <header>
          <h2 id="edit-card-title">Edit card</h2>
          <button type="button" class="icon-close" aria-label="Close" @click="close">×</button>
        </header>

        <label class="field">
          <span>Title</span>
          <input ref="titleInput" v-model="title" type="text" maxlength="120">
        </label>

        <label class="field">
          <span>Description</span>
          <textarea v-model="description" rows="4" maxlength="500" />
        </label>

        <footer>
          <button type="button" class="ghost" @click="close">Cancel</button>
          <button type="button" class="primary" @click="save">Save</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(21, 32, 43, 0.42);
  padding: 1rem;
}

.dialog {
  width: min(100%, 28rem);
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 1.1rem 1.15rem 1.15rem;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

h2 {
  margin: 0;
  font-size: 1.15rem;
}

.icon-close {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font-size: 1.35rem;
}

.icon-close:hover {
  background: #f3f6f9;
  color: var(--ink);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.field input,
.field textarea {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  color: var(--ink);
  resize: vertical;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
}

.ghost,
.primary {
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
}

.ghost {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
}

.primary {
  border: 0;
  background: var(--accent);
  color: white;
}
</style>
