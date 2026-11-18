<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  description: string
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { title: string; description: string }]
}>()

const draftTitle = ref(props.title)
const draftDescription = ref(props.description)
const titleRef = ref<HTMLInputElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    draftTitle.value = props.title
    draftDescription.value = props.description
    nextTick(() => titleRef.value?.focus())
  },
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
}

function save() {
  const title = draftTitle.value.trim()
  if (!title) {
    titleRef.value?.focus()
    return
  }
  emit('save', {
    title,
    description: draftDescription.value.trim(),
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="backdrop"
      role="presentation"
      @click.self="emit('close')"
    >
      <div
        ref="dialogRef"
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-card-title"
        @keydown="onKeydown"
      >
        <h2 id="edit-card-title">Edit card</h2>
        <label class="field">
          <span>Title</span>
          <input ref="titleRef" v-model="draftTitle" type="text" required>
        </label>
        <label class="field">
          <span>Description</span>
          <textarea v-model="draftDescription" rows="4" />
        </label>
        <div class="actions">
          <button type="button" class="btn ghost" @click="emit('close')">Cancel</button>
          <button type="button" class="btn primary" @click="save">Save</button>
        </div>
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
  padding: 1rem;
  background: rgba(16, 24, 40, 0.45);
}

.dialog {
  width: min(420px, 100%);
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.dialog h2 {
  margin: 0 0 1rem;
  font-size: 1.15rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.field span {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.field input,
.field textarea {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-muted);
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  border: 1px solid transparent;
}

.btn.ghost {
  background: transparent;
  border-color: var(--border);
}

.btn.ghost:hover {
  background: var(--surface-muted);
}

.btn.primary {
  background: var(--accent);
  color: #fff;
}

.btn.primary:hover {
  background: var(--accent-hover);
}
</style>
