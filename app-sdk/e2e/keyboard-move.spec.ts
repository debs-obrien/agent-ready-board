import { expect, test, type Locator, type Page } from "@playwright/test"

function column(page: Page, name: string) {
  return page.getByRole("list", { name })
}

function moveHandle(scope: Page | Locator, cardTitle: string) {
  return scope.getByRole("button", { name: `Move ${cardTitle}` })
}

function liveRegion(page: Page) {
  return page.getByRole("alert")
}

test.describe("keyboard card moving", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("region", { name: "Kanban board" })).toBeVisible()
  })

  test("moves a card within a column", async ({ page }) => {
    const todo = column(page, "To do")
    const handle = moveHandle(todo, "Playwright tests")

    await handle.focus()
    await expect(handle).toBeFocused()
    await page.keyboard.press("Space")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Space")

    await expect(todo.getByRole("heading", { level: 3 })).toHaveText([
      "Fix flaky CI pipeline",
      "Playwright tests",
      "Document API rate limits",
    ])
    await expect(moveHandle(todo, "Playwright tests")).toHaveAccessibleName(
      "Move Playwright tests",
    )
  })

  test("moves a card across columns into Done", async ({ page }) => {
    const todo = column(page, "To do")
    const done = column(page, "Done")
    const handle = moveHandle(todo, "Playwright tests")

    await handle.focus()
    await page.keyboard.press("Space")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("Space")

    await expect(
      done.getByRole("heading", { name: "Playwright tests" }),
    ).toBeVisible()
    await expect(
      todo.getByRole("heading", { name: "Playwright tests" }),
    ).toHaveCount(0)
    await expect(moveHandle(done, "Playwright tests")).toBeVisible()
  })

  test("announces pickup and drop and keeps handle focus", async ({ page }) => {
    const handle = moveHandle(page, "Playwright tests")

    await handle.focus()
    await page.keyboard.press("Space")
    await expect(liveRegion(page)).toHaveText(
      "Picked up Playwright tests, To do, position 1 of 3.",
    )

    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("Space")

    await expect(liveRegion(page)).toHaveText(
      "Dropped Playwright tests in Done, position 1 of 3.",
    )
    await expect(moveHandle(column(page, "Done"), "Playwright tests")).toBeFocused()
    await expect(
      moveHandle(column(page, "Done"), "Playwright tests"),
    ).toHaveAccessibleName("Move Playwright tests")
  })

  test("escape cancels pickup and restores the card", async ({ page }) => {
    const todo = column(page, "To do")
    const handle = moveHandle(todo, "Playwright tests")

    await handle.focus()
    await page.keyboard.press("Space")
    await expect(liveRegion(page)).toHaveText(
      "Picked up Playwright tests, To do, position 1 of 3.",
    )

    await page.keyboard.press("Escape")

    await expect(liveRegion(page)).toHaveText(
      "Moved Playwright tests back to To do, position 1 of 3.",
    )
    await expect(todo.getByRole("heading", { level: 3 })).toHaveText([
      "Playwright tests",
      "Fix flaky CI pipeline",
      "Document API rate limits",
    ])
    await expect(handle).toBeFocused()
  })
})
