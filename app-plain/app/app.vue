<template>
  <div class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">In-memory board</p>
        <h1>Kanban</h1>
        <p class="lede">
          Drag cards between columns, or focus a card and use the arrow keys.
          Assign people, edit details, or move via the card menu.
        </p>
      </div>
    </header>

    <main>
      <KanbanBoard />
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 1.75rem clamp(1rem, 3vw, 2rem) 2.5rem;
  background:
    radial-gradient(1200px 400px at 10% -10%, #dbe7ff 0%, transparent 55%),
    radial-gradient(900px 360px at 90% 0%, #e8eef8 0%, transparent 50%),
    var(--bg);
}

.page-header {
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  font-weight: 750;
  letter-spacing: -0.02em;
}

.lede {
  max-width: 42rem;
  margin: 0.55rem 0 0;
  color: var(--text-muted);
}
</style>
