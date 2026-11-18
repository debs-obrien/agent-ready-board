# SDK attempt run notes

## Model

Cursor Grok 4.5

## Package versions

Pinned exact installs in `app-sdk/package.json`:

- `@ui-sdk/vue@0.1.0-beta.10`
- `@ui-sdk/core@0.1.0-beta.10`

Related app stack from the Nuxt minimal scaffold:

- `nuxt@^4.6.4` (resolved 4.6.4)
- `vue@^3.5.45`

## Skill paths followed

Installed with `npx skills@latest add vercel-labs/ui --skill ui-sdk` → `./.agents/skills/ui-sdk`.

1. `SKILL.md` — Nuxt 4 setup: install packages, add `"@ui-sdk/vue"` to `modules`, import `@ui-sdk/core/web.css`, declare `@layer ui-sdk;`, add `AGENTS.md`.
2. `references/build-interface.md` — mapped task pieces to Combobox (assign), Menu (actions / Move to…), Dialog + Field/Input/Textarea (edit), Button; board drag/keyboard → custom component on `createTransfer`.
3. `references/create-component.md` + `node_modules/@ui-sdk/vue/docs/core.md` (“Moving Between Lists” / “A Board with Rules”) + `docs/rendering.md` — `definePrimitive` + `createTransfer` + `createRovingFocus`, rendered with `createParts` from `@ui-sdk/vue/primitive`.
4. Component pages: `docs/components/combobox.md`, `menu.md`, `dialog.md`, plus Field/Input/Textarea/Button as needed.
5. `references/agent-ready.md` + `docs/agents.md` — named controls, `data-agent-confirm` on Delete, `createAgent` / `registerTools` in a client plugin, agent test.
6. `references/testing.md` + `references/styles.md` — vitest/jsdom stubs, agent test, primitive `mount`/`checkServer`, `web.css` tokens.

## Local agent testing

In `nuxt dev` only, the client plugin sets `window.__agent` to the bridge from `createAgent`. Example:

```js
await window.__agent.snapshot()
await window.__agent.act({
  steps: [{ ref: "Kanban board", action: "move", args: ["Playwright tests", "Done", 0] }],
})
```

Production / `nuxt generate` builds do not expose it.

## What the skill or docs got wrong / left unclear

- `createTransfer`’s JSDoc wires `keydown` / `pointerdown` on the card slot; the reorder docs say nested controls should use a separate drag handle. The board path does not spell the handle split for transfer, so this build puts transfer/roving on a handle and `bindItem` on the card.
- Custom primitive roots show up in `agent.snapshot()` (here `kanban-board`), but handle buttons do not appear as their own entries even with unique `aria-label`s. Agents are expected to call board actions (`move` / `grab` / `drop` / `cancel`) instead.
- Root `tsconfig.json` uses project references with `"files": []`; bare `vue-tsc --noEmit` checks nothing until pointed at `.nuxt/tsconfig.app.json` (as `SKILL.md` warns).
- Slot prop kind `"key"` is documented as the right list-item keying kind, but see beta bug below.
- Docs say to render from `transfer.lists(state)` during a move; it is easy to miss and keep rendering the controlled committed lists, which leaves keyboard moves invisible until drop.

## Beta bugs hit

- **Nuxt `generate` / SSR crash with prop kind `"key"`.** Using `props: { value: "key" }` on `createParts` parts blew up prerender with `Cannot read properties of undefined (reading 'keyOf')` inside `@ui-sdk/vue`’s part prop resolution (`(scope?.handle.api).internal.keyOf(...)`). Workaround: use `value: "string"` and pass `:value` explicitly; part keys still resolve from `value` via core `keyOf`.
- `createTransfer` / draft APIs are marked `@experimental` in the installed `.d.ts` files.
- **`act` reports `ok: true` when a custom action returns `false`.** Repro against the first-pass board (before app-side title resolution + throw):

  1. Open the board, create a bridge (`createAgent()` / `window.__agent` in later commits).
  2. Snapshot the `kanban-board` entry: `lists` values are keys like `playwright-tests`, and without `agent.items` there are no title labels for cards.
  3. Run:

     ```js
     await agent.act({
       steps: [{ ref: "Kanban board", action: "move", args: ["Playwright tests", "done", 0] }],
     })
     ```

  4. Result is `{ ok: true, … }` while `lists` are unchanged, because `createTransfer().move` returns `false` for an unknown key and the bridge still treats the step as successful.

  App mitigation now: `agent.items` exposes `{ value, label }` card titles (so the bridge can resolve the first arg), `move` also resolves titles/column names itself, and throws if the move does not apply so `act` fails loudly.

## Generate

`npm run generate` inside `app-sdk/` succeeded after the `"key"` workaround.
