# Plain attempt 3 — run notes

## Model

Cursor Grok 4.5 (language model jointly trained and owned by SpaceXAI and Cursor).

## Packages chosen

- **nuxt ^4.6.4**, **vue**, **vue-router** — from the official Nuxt minimal scaffold (`nuxi init -t minimal`). Needed for a Nuxt 4 static app with `nuxt generate`.
- **@vueuse/core** — used for `onClickOutside` (assign picker + actions menu) and `onKeyStroke` (Escape to close the edit dialog). Avoided heavier UI kits so the board UI stays hand-rolled Vue SFCs.

No drag-and-drop library (e.g. SortableJS / vuedraggable): mouse moves use HTML5 drag-and-drop; keyboard moves are custom so both paths stay in sync with the same in-memory `moveCard` helpers.

## Uncertainties

- Whether a grab/move/drop keyboard model (Space to lift, arrows to move, Space to drop, Esc to cancel) is preferred over always-on arrow shortcuts or only “Move to…” menu actions. I shipped the lift/drop model plus the actions menu.
- How aggressive focus management should be after menu/dialog actions; cards are refocused by `data-card-id` after moves/edits.
- Exact insert index when dropping onto another card mid-column (treated as “take that card’s slot,” adjusting when dragging downward in the same column).
