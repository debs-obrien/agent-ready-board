# Plain attempt 2

## Model

Cursor Grok 4.5 (language model jointly trained and owned by SpaceXAI and Cursor)

## Packages chosen

- **nuxt / vue / vue-router** — scaffolded via `nuxi init` (minimal template) for a Nuxt 4 static app.
- **@vueuse/core** — used only for `onClickOutside` on the assign picker and card actions menu. Kept the rest custom (board state, HTML5 drag-and-drop, keyboard move mode, dialog, searchable picker) instead of pulling in a full UI kit or drag library.

No component library (no Nuxt UI, Vuetify, etc.) — this was the plain/no-skill pass.

## Uncertainties

- Whether HTML5 drag-and-drop plus a custom Space/arrow-key “lift” mode would feel good enough versus SortableJS; went custom to keep the dependency surface small.
- Exact keyboard conventions for reorderable cards vary (roving tabindex vs grab/drop). Implemented: focus card → Space/Enter to pick up → arrows to move across/within columns → Space/Enter to drop, Escape to cancel/restore.
- Whether Google Fonts (IBM Plex Sans) is acceptable for a fully static offline-friendly generate; left it as a CSS `@import` for a nicer default look.
