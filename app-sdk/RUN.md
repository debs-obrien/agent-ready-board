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

## What the skill or docs got wrong / left unclear

- `createTransfer`’s JSDoc wires `keydown` / `pointerdown` on the card slot; the reorder docs say nested controls should use a separate drag handle. The board path does not spell the handle split for transfer, so this build puts transfer/roving on a handle and `bindItem` on the card.
- Custom primitive roots show up in `agent.snapshot()` (here `kanban-board`), but handle buttons do not appear as their own entries even with unique `aria-label`s. Agents are expected to call board actions (`move` / `grab` / `drop` / `cancel`) instead.
- Root `tsconfig.json` uses project references with `"files": []`; bare `vue-tsc --noEmit` checks nothing until pointed at `.nuxt/tsconfig.app.json` (as `SKILL.md` warns).
- Slot prop kind `"key"` is documented as the right list-item keying kind, but see beta bug below.

## Beta bugs hit

- **Nuxt `generate` / SSR crash with prop kind `"key"`.** Using `props: { value: "key" }` on `createParts` parts blew up prerender with `Cannot read properties of undefined (reading 'keyOf')` inside `@ui-sdk/vue`’s part prop resolution (`(scope?.handle.api).internal.keyOf(...)`). Workaround: use `value: "string"` and pass `:value` explicitly; part keys still resolve from `value` via core `keyOf`.
- `createTransfer` / draft APIs are marked `@experimental` in the installed `.d.ts` files.

## Generate

`npm run generate` inside `app-sdk/` succeeded after the `"key"` workaround.
