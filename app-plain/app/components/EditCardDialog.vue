<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'

const props = defineProps<{
  open: boolean
  title: string
  description: string
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { title: string; description: string }]
}>()

const localTitle = ref(props.title)
const localDescription = ref(props.description)
const titleInput = ref<HTMLInputElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      localTitle.value = props.title
      localDescription.value = props.description
      await nextTick()
      titleInput.value?.focus()
      titleInput.value?.select()
    }
  },
)

onKeyStroke('Escape', (event) => {
  if (!props.open) return
  event.preventDefault()
  emit('close')
})

function onSubmit() {
  const title = localTitle.value.trim()
  if (!title) return
  emit('save', {
    title,
    description: localDescription.value.trim(),
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-root">
      <div class="dialog-backdrop" @click="emit('close')" />
      <div
        ref="dialog"
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-card-title"
      >
        <h2 id="edit-card-title">Edit card</h2>
        <form class="dialog__form" @submit.prevent="onSubmit">
          <label class="field">
            <span>Title</span>
            <input ref="titleInput" v-model="localTitle" type="text" required>
          </label>
          <label class="field">
            <span>Description</span>
            <textarea v-model="localDescription" rows="4" />
          </label>
          <div class="dialog__actions">
            <button type="button" class="btn btn--ghost" @click="emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn--primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-root {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.dialog-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(18, 24, 36, 0.45);
}

.dialog {
  position: relative;
  width: min(100%, 420px);
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.dialog h2 {
  margin: 0 0 1rem;
  font-size: 1.15rem;
}

.dialog__form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
}

.field input,
.field textarea {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-muted);
  color: inherit;
  resize: vertical;
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.btn {
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid transparent;
}

.btn--ghost {
  background: transparent;
  border-color: var(--border);
  color: inherit;
}

.btn--primary {
  background: var(--accent);
  color: white;
}
</style>
