<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { Button } from "@ui-sdk/vue/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@ui-sdk/vue/combobox"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/vue/dialog"
import { Field, FieldLabel } from "@ui-sdk/vue/field"
import { Input } from "@ui-sdk/vue/input"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/vue/menu"
import { Textarea } from "@ui-sdk/vue/textarea"
import type { TransferLists } from "@ui-sdk/core"
import {
  KanbanCard,
  KanbanColumn,
  KanbanHandle,
  KanbanRoot,
} from "./components/kanban/board-parts"
import { COLUMN_LABELS, COLUMN_ORDER } from "./components/kanban/board"

type Card = {
  id: string
  title: string
  description: string
  assignee: string | null
}

type Person = {
  value: string
  label: string
}

const people: Person[] = [
  { value: "ada", label: "Ada Lovelace" },
  { value: "alan", label: "Alan Turing" },
  { value: "grace", label: "Grace Hopper" },
  { value: "linus", label: "Linus Torvalds" },
  { value: "margaret", label: "Margaret Hamilton" },
  { value: "barbara", label: "Barbara Liskov" },
  { value: "donald", label: "Donald Knuth" },
  { value: "tim", label: "Tim Berners-Lee" },
  { value: "evelyn", label: "Evelyn Boyd Granville" },
  { value: "ken", label: "Ken Thompson" },
]

const cards = reactive<Record<string, Card>>({
  "playwright-tests": {
    id: "playwright-tests",
    title: "Playwright tests",
    description: "Cover the board's keyboard moves and dialogs.",
    assignee: "ada",
  },
  "fix-ci": {
    id: "fix-ci",
    title: "Fix flaky CI pipeline",
    description: "Pin the Node image and retry the seed step.",
    assignee: "grace",
  },
  "auth-middleware": {
    id: "auth-middleware",
    title: "Ship auth middleware",
    description: "Gate preview routes behind the session cookie.",
    assignee: "linus",
  },
  "api-rate-limits": {
    id: "api-rate-limits",
    title: "Document API rate limits",
    description: "Add burst and sustained limits to the public docs.",
    assignee: null,
  },
  "zod-schemas": {
    id: "zod-schemas",
    title: "Refactor Zod schemas",
    description: "Share card and person schemas across forms.",
    assignee: "barbara",
  },
  "nuxt-modules": {
    id: "nuxt-modules",
    title: "Upgrade Nuxt modules",
    description: "Bump the UI SDK module and re-check generate.",
    assignee: "margaret",
  },
  "openapi-types": {
    id: "openapi-types",
    title: "Add OpenAPI types",
    description: "Generate clients from the board service contract.",
    assignee: "tim",
  },
  "vite-chunking": {
    id: "vite-chunking",
    title: "Tune Vite chunking",
    description: "Split the board shell from the dialog routes.",
    assignee: "ken",
  },
})

const lists = ref<TransferLists>({
  todo: ["playwright-tests", "fix-ci", "api-rate-limits"],
  doing: ["auth-middleware", "zod-schemas", "nuxt-modules"],
  done: ["openapi-types", "vite-chunking"],
})

const labels = computed(() =>
  Object.fromEntries(
    Object.values(cards).map((card) => [card.id, card.title]),
  ),
)

const editingId = ref<string | null>(null)
const editTitle = ref("")
const editDescription = ref("")
const editOpen = ref(false)

const personLabel = (value: string | null) =>
  people.find((person) => person.value === value)?.label ?? "Unassigned"

function cardOf(cardId: string): Card {
  const card = cards[cardId]
  if (!card) {
    throw new Error(`Unknown card: ${cardId}`)
  }
  return card
}

function columnCards(column: string): string[] {
  return lists.value[column] ?? []
}

function onListsChange(next: TransferLists) {
  lists.value = next
}

function assignCard(cardId: string, value: string | null) {
  cardOf(cardId).assignee = value
}

function openEdit(cardId: string) {
  const card = cardOf(cardId)
  editingId.value = cardId
  editTitle.value = card.title
  editDescription.value = card.description
  editOpen.value = true
}

function saveEdit() {
  const id = editingId.value
  if (!id) return
  const card = cardOf(id)
  card.title = editTitle.value.trim() || card.title
  card.description = editDescription.value.trim()
  editOpen.value = false
  editingId.value = null
}

function deleteCard(cardId: string) {
  lists.value = {
    todo: (lists.value.todo ?? []).filter((id) => id !== cardId),
    doing: (lists.value.doing ?? []).filter((id) => id !== cardId),
    done: (lists.value.done ?? []).filter((id) => id !== cardId),
  }
  delete cards[cardId]
}

function moveCard(cardId: string, column: string) {
  const next: TransferLists = {
    todo: (lists.value.todo ?? []).filter((id) => id !== cardId),
    doing: (lists.value.doing ?? []).filter((id) => id !== cardId),
    done: (lists.value.done ?? []).filter((id) => id !== cardId),
  }
  next[column] = [...(next[column] ?? []), cardId]
  lists.value = next
}

function onCardAction(cardId: string, value: string) {
  if (value === "edit") {
    openEdit(cardId)
    return
  }
  if (value === "delete") {
    deleteCard(cardId)
    return
  }
  if (value.startsWith("move:")) {
    moveCard(cardId, value.slice(5))
  }
}
</script>

<template>
  <div class="board-page">
    <h1>Sprint board</h1>
    <p class="lede">
      Drag cards between columns, or focus a move handle and use the keyboard.
    </p>

    <p id="board-move-instructions" class="board-instructions">
      Press Space or Enter to pick up a card, arrow keys to move it within or
      across columns, then Space or Enter to drop. Escape cancels.
    </p>

    <KanbanRoot
      class="board"
      :lists="lists"
      :labels="labels"
      @lists-change="onListsChange"
    >
      <section
        v-for="column in COLUMN_ORDER"
        :key="column"
        class="column"
      >
        <h2 class="column-heading">{{ COLUMN_LABELS[column] }}</h2>
        <KanbanColumn :value="column" class="column-list">
          <KanbanCard
            v-for="cardId in columnCards(column)"
            :key="cardId"
            :value="cardId"
            class="card"
          >
            <div class="card-top">
              <KanbanHandle :value="cardId" class="move-handle">⋮⋮</KanbanHandle>
              <h3 class="card-title">{{ cardOf(cardId).title }}</h3>
              <Menu @action="(value) => onCardAction(cardId, value)">
                <MenuTrigger :aria-label="`Actions for ${cardOf(cardId).title}`">
                  Actions
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="edit">Edit</MenuItem>
                  <MenuSub>
                    <MenuSubTrigger>Move to…</MenuSubTrigger>
                    <MenuSubContent>
                      <MenuItem
                        v-for="target in COLUMN_ORDER"
                        :key="target"
                        :value="`move:${target}`"
                        :disabled="target === column"
                      >
                        {{ COLUMN_LABELS[target] }}
                      </MenuItem>
                    </MenuSubContent>
                  </MenuSub>
                  <MenuItem
                    value="delete"
                    :data-agent-confirm="`Deletes ${cardOf(cardId).title}`"
                  >
                    Delete
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>

            <p v-if="cardOf(cardId).description" class="card-description">
              {{ cardOf(cardId).description }}
            </p>

            <div class="card-assign">
              <Combobox
                :model-value="cardOf(cardId).assignee"
                @value-change="(value) => assignCard(cardId, value)"
              >
                <ComboboxInput
                  :aria-label="`Assign to for ${cardOf(cardId).title}`"
                  :placeholder="personLabel(cardOf(cardId).assignee)"
                />
                <ComboboxContent>
                  <ComboboxEmpty>No people found.</ComboboxEmpty>
                  <ComboboxList>
                    <ComboboxItem
                      v-for="person in people"
                      :key="person.value"
                      :value="person.value"
                      :label="person.label"
                    >
                      {{ person.label }}
                    </ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </KanbanCard>
        </KanbanColumn>
      </section>
    </KanbanRoot>

    <Dialog v-model:open="editOpen">
      <DialogBackdrop />
      <DialogContent>
        <DialogTitle>Edit card</DialogTitle>
        <DialogDescription>
          Update the title and description for this card.
        </DialogDescription>
        <form class="edit-form" @submit.prevent="saveEdit">
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input v-model="editTitle" required />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea v-model="editDescription" />
          </Field>
          <div class="edit-actions">
            <DialogClose>Cancel</DialogClose>
            <Button type="submit" data-variant="solid">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
