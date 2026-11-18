import { checkServer, mount } from "@ui-sdk/core/testing"
import { expect, test } from "vitest"
import { board } from "../app/components/kanban/board"

const markup = `
<root>
  <column value="todo">
    <card value="playwright-tests"><handle value="playwright-tests">Move</handle></card>
    <card value="fix-ci"><handle value="fix-ci">Move</handle></card>
  </column>
  <column value="doing">
    <card value="auth-middleware"><handle value="auth-middleware">Move</handle></card>
  </column>
  <column value="done"></column>
</root>
`

const options = {
  defaultLists: {
    todo: ["playwright-tests", "fix-ci"],
    doing: ["auth-middleware"],
    done: [] as string[],
  },
  labels: {
    "playwright-tests": "Playwright tests",
    "fix-ci": "Fix flaky CI pipeline",
    "auth-middleware": "Ship auth middleware",
  },
}

test("keyboard transfer moves a card and announces the drop", async () => {
  const view = mount(board, options, markup)

  try {
    const handle = view.part("handle", "playwright-tests") as HTMLElement
    handle.focus()
    await view.keys(" ", "ArrowRight", " ")
    expect(view.state.lists.doing).toEqual([
      "playwright-tests",
      "auth-middleware",
    ])
    expect(view.state.lists.todo).toEqual(["fix-ci"])
    expect(view.announced.at(-1)).toBe(
      "Dropped Playwright tests in Doing, position 1 of 2.",
    )
  } finally {
    view.unmount()
  }
})

test("renders on the server with one tab stop", () => {
  checkServer(
    board,
    {
      defaultLists: {
        todo: ["playwright-tests"],
        doing: [],
        done: [],
      },
      labels: { "playwright-tests": "Playwright tests" },
    },
    `<root><column value="todo"><card value="playwright-tests"><handle value="playwright-tests">Move</handle></card></column><column value="doing"></column><column value="done"></column></root>`,
  )
})
