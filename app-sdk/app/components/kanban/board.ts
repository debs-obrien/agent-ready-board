import {
  createChange,
  createRovingFocus,
  createTransfer,
  definePrimitive,
  type ChangeDetails,
  type TransferDraft,
  type TransferLists,
  type TransferReason,
} from "@ui-sdk/core"

const COLUMN_ORDER = ["todo", "doing", "done"] as const

const COLUMN_LABELS: Record<string, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
}

type BoardOptions = {
  lists?: TransferLists
  defaultLists?: TransferLists
  onListsChange?: (
    lists: TransferLists,
    details: ChangeDetails<TransferReason> & {
      key: string
      from: string
      to: string
      index: number
    },
  ) => void
  labels?: Record<string, string>
}

type BoardState = {
  lists: TransferLists
  moving: TransferDraft | null
  focused: string | null
  labels: Record<string, string>
}

const emptyLists = (): TransferLists => ({
  todo: [],
  doing: [],
  done: [],
})

const board = definePrimitive({
  name: "kanban-board",
  options: {
    lists: "value",
    defaultLists: "value",
    onListsChange: "callback",
    labels: "value",
  },
  controlled: ["lists"],
  state: (options: BoardOptions): BoardState => ({
    lists: options.lists ?? options.defaultLists ?? emptyLists(),
    moving: null,
    focused: null,
    labels: options.labels ?? {},
  }),
  sync: (options: BoardOptions) => {
    const next: Partial<BoardState> = {}
    if (options.lists !== undefined) next.lists = options.lists
    if (options.labels !== undefined) next.labels = options.labels
    return next
  },
  api: (context) => {
    const change = createChange(context)
    const transfer = createTransfer(context, {
      key: "lists",
      draft: "moving",
      set: (value, details) => change("lists", value, details),
      order: () => [...COLUMN_ORDER],
      label: (key) => context.store.get().labels[key],
      listLabel: (list) => COLUMN_LABELS[list] ?? list,
      createAutoScroll: false,
    })
    const roving = createRovingFocus(context, {
      slot: "handle",
      key: "focused",
    })

    return {
      transfer,
      roving,
      move: (key: string, list: string, index: number) =>
        transfer.move(key, list, index),
      grab: (key: string) => transfer.grab(key),
      drop: (event?: Event) => transfer.drop(event),
      cancel: () => transfer.cancel(),
    }
  },
  agent: {
    actions: ["move", "grab", "drop", "cancel"],
  },
  slots: (slot) => ({
    root: slot<{}, { lists: TransferLists }>({
      state: (state, { api }) => ({
        lists: api.transfer.lists(state),
      }),
      attrs: () => ({
        role: "region",
        "aria-label": "Kanban board",
      }),
    }),
    column: slot<{ value: string }>({
      props: { value: "string" },
      role: "list",
      attrs: (_state, { key }) => ({
        "aria-label": COLUMN_LABELS[key] ?? key,
      }),
      bind: (el, { api, key }) => api.transfer.bindList(el, key),
    }),
    card: slot<{ value: string }>({
      props: { value: "string" },
      role: "listitem",
      attrs: (state, { api, key }) => ({
        "data-moving": api.transfer.moving(state, key) ? "" : undefined,
        "data-dragging": api.transfer.dragging(state, key) ? "" : undefined,
      }),
      bind: (el, { api, key }) => api.transfer.bindItem(el, key),
    }),
    handle: slot<{ value: string }>({
      props: { value: "string" },
      role: "button",
      focus: "roving",
      press: {
        none: "Space and Enter grab for keyboard moves; pointer starts a drag.",
      },
      keys: [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Enter",
        "Escape",
        " ",
      ],
      attrs: (state, part) => {
        const label = state.labels[part.key] ?? part.key
        return {
          type: "button",
          tabindex: part.api.roving.tabIndex(state, part),
          "aria-label": `Move ${label}`,
          "aria-describedby": "board-move-instructions",
          "aria-pressed": String(part.api.transfer.moving(state, part.key)),
          "data-grabbed": part.api.transfer.moving(state, part.key)
            ? ""
            : undefined,
        }
      },
      on: {
        keydown: (event, { el, api, key }) => {
          api.transfer.keydown(event, key) || api.roving.keydown(event, el!)
        },
        pointerdown: (event, { api, key }) => {
          api.transfer.pointerdown(event, key)
        },
      },
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
  }),
})

export { board, COLUMN_LABELS, COLUMN_ORDER, type BoardOptions }
