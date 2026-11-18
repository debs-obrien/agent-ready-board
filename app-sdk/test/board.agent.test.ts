import { render, screen } from "@testing-library/vue"
import { createAgent } from "@ui-sdk/vue/agent"
import { expect, test } from "vitest"
import App from "../app/app.vue"

test("an agent can find and change board controls", async () => {
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

  const labels = components.map((entry) => entry.label)
  expect(labels, "board region missing").toContain("Kanban board")
  expect(
    labels.some((label) => label?.includes("Assign to for Playwright tests")),
    "Playwright assign control missing",
  ).toBe(true)
  expect(
    labels.some((label) => label?.includes("Actions for Playwright tests")),
    "Playwright actions control missing",
  ).toBe(true)

  const assign = components.find((entry) =>
    entry.label?.includes("Assign to for Playwright tests"),
  )
  expect(assign, "assign combobox missing").toBeTruthy()

  const result = await agent.act({
    steps: [
      {
        ref: assign!.label!,
        action: "setValue",
        args: ["Grace Hopper"],
      },
      {
        ref: "Kanban board",
        action: "move",
        args: ["playwright-tests", "done", 0],
      },
    ],
  })
  expect(result.ok, result.error?.message).toBe(true)
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
