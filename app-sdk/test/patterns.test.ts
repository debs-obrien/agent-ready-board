import { checkPattern } from "@ui-sdk/core/testing"
import { render, screen } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { defineComponent, ref } from "vue"
import { expect, test } from "vitest"
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
  DialogTrigger,
} from "@ui-sdk/vue/dialog"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@ui-sdk/vue/menu"

const ComboboxFixture = defineComponent({
  components: {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
  },
  setup() {
    const value = ref<string | null>("ada")
    return { value }
  },
  template: `
    <Combobox v-model="value">
      <ComboboxInput aria-label="Assign to for Playwright tests" />
      <ComboboxContent>
        <ComboboxEmpty>No people found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxItem value="ada" label="Ada Lovelace">Ada Lovelace</ComboboxItem>
          <ComboboxItem value="grace" label="Grace Hopper">Grace Hopper</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  `,
})

const MenuFixture = defineComponent({
  components: { Menu, MenuContent, MenuItem, MenuTrigger },
  template: `
    <Menu>
      <MenuTrigger aria-label="Actions for Playwright tests">Actions</MenuTrigger>
      <MenuContent>
        <MenuItem value="edit">Edit</MenuItem>
        <MenuItem value="delete">Delete</MenuItem>
      </MenuContent>
    </Menu>
  `,
})

const DialogFixture = defineComponent({
  components: {
    Dialog,
    DialogBackdrop,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
  },
  template: `
    <Dialog>
      <DialogTrigger>Edit Playwright tests</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <DialogTitle>Edit card</DialogTitle>
        <DialogDescription>Update the title and description for this card.</DialogDescription>
        <DialogClose>Cancel</DialogClose>
      </DialogContent>
    </Dialog>
  `,
})

test("assign combobox wiring passes checkPattern", async () => {
  const user = userEvent.setup()
  render(ComboboxFixture)
  const input = screen.getByLabelText("Assign to for Playwright tests")
  await user.click(input)
  const root = input.closest('[data-slot="combobox"]') ?? input.parentElement
  expect(root).toBeTruthy()
  await checkPattern(root!, "combobox")
})

test("card actions menu wiring passes checkPattern", async () => {
  const user = userEvent.setup()
  render(MenuFixture)
  const trigger = screen.getByRole("button", {
    name: "Actions for Playwright tests",
  })
  trigger.focus()
  await user.keyboard("{Enter}")
  const menu = await screen.findByRole("menu")
  expect(menu.contains(document.activeElement)).toBe(true)
  const root = menu.closest('[data-slot="menu"]') ?? menu.parentElement
  expect(root).toBeTruthy()
  await checkPattern(root!, "menu")
})

test("edit dialog wiring passes checkPattern", async () => {
  const user = userEvent.setup()
  render(DialogFixture)
  await user.click(screen.getByRole("button", { name: "Edit Playwright tests" }))
  const dialog = await screen.findByRole("dialog")
  const root = dialog.closest('[data-slot="dialog"]') ?? dialog.parentElement
  expect(root).toBeTruthy()
  await checkPattern(root!, "dialog")
})
