# Plain attempt 1 — run notes

## Model

Cursor Grok 4.5 (language model jointly trained and owned by SpaceXAI and Cursor).

## Packages chosen

- **nuxt** (`^4.6.4`) — required Nuxt 4 app runtime / `nuxt generate` static build
- **vue** / **vue-router** — pulled in by the Nuxt minimal template; used for components and in-memory UI state

No extra UI or drag-and-drop libraries. Drag-and-drop uses the HTML5 Drag and Drop API; keyboard moving, menus, dialogs, and the searchable assignee picker are custom Vue components with scoped CSS.

## Uncertainties

- Whether a DnD library (e.g. SortableJS / vuedraggable) would have been preferred over native HTML5 drag-and-drop for smoother within-column reordering.
- Exact keyboard UX expected for card moving (implemented as: Tab to focus a card, then Arrow keys to reorder within a column or move across columns; also “Move to…” in the actions menu).
- How much polish vs. minimal chrome was desired for a “plain” baseline (kept a light custom stylesheet, no component library).
