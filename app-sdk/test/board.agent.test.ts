import { render, screen } from "@testing-library/vue"
import { createAgent } from "@ui-sdk/vue/agent"
import { expect, test } from "vitest"
import App from "../app/app.vue"

test("an agent can find named controls and move Playwright tests to Done", async () => {
  const agent = createAgent()
  render(App)

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more")

  for (const entry of components) {
    expect(
      entry.label,
      `${entry.component} ${entry.ref} has no name`,
    ).toBeTruthy()
  }

  const board = components.find((entry) => entry.label === "Kanban board")
  expect(board, "board missing from snapshot").toBeTruthy()
  expect(
    board?.items?.some((item) => item.label === "Playwright tests"),
    "Playwright tests missing from board items",
  ).toBe(true)

  const result = await agent.act({
    steps: [
      {
        ref: "Kanban board",
        action: "move",
        args: ["Playwright tests", "Done", 0],
      },
    ],
  })
  expect(result.ok, result.error?.message).toBe(true)

  const after = agent
    .snapshot()
    .find((entry) => entry.label === "Kanban board")
  expect(after?.lists?.done?.[0]).toBe("playwright-tests")
  expect(
    screen.getByLabelText("Assign to for Playwright tests"),
  ).toBeTruthy()
})

test("delete requires a person", async () => {
  let approve = false
  const agent = createAgent({
    allow: (step) => !step.confirm || approve,
  })

  render(App)

  const remove = {
    steps: [
      {
        ref: "Actions for Playwright tests",
        action: "press",
        args: ["Delete"],
      },
    ],
  }

  expect((await agent.act(remove)).ok).toBe(false)
  approve = true
  expect((await agent.act(remove)).ok).toBe(true)
})
