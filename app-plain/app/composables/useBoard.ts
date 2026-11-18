import type { Card, Column, ColumnId, Person } from '~/types/board'

const columns: Column[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
]

const people: Person[] = [
  { id: 'p1', name: 'Ada Lovelace', initials: 'AL' },
  { id: 'p2', name: 'Grace Hopper', initials: 'GH' },
  { id: 'p3', name: 'Alan Turing', initials: 'AT' },
  { id: 'p4', name: 'Linus Torvalds', initials: 'LT' },
  { id: 'p5', name: 'Margaret Hamilton', initials: 'MH' },
  { id: 'p6', name: 'Barbara Liskov', initials: 'BL' },
  { id: 'p7', name: 'Guido van Rossum', initials: 'GR' },
  { id: 'p8', name: 'Brendan Eich', initials: 'BE' },
  { id: 'p9', name: 'Katherine Johnson', initials: 'KJ' },
  { id: 'p10', name: 'Donald Knuth', initials: 'DK' },
]

function createInitialCards(): Card[] {
  return [
    {
      id: 'c1',
      title: 'Playwright tests',
      description: 'Cover the critical happy paths and one failure case for the board.',
      columnId: 'todo',
      assigneeId: 'p1',
    },
    {
      id: 'c2',
      title: 'Fix flaky CI pipeline',
      description: 'Pin the Node version and retry flaky e2e jobs only once.',
      columnId: 'todo',
      assigneeId: 'p4',
    },
    {
      id: 'c3',
      title: 'Refactor auth middleware',
      description: 'Split session checks from route guards and add typed helpers.',
      columnId: 'todo',
      assigneeId: null,
    },
    {
      id: 'c4',
      title: 'Add Redis caching layer',
      description: 'Cache read-heavy API responses with a short TTL.',
      columnId: 'doing',
      assigneeId: 'p7',
    },
    {
      id: 'c5',
      title: 'Document API webhooks',
      description: 'Write payload examples and retry semantics for partners.',
      columnId: 'doing',
      assigneeId: 'p5',
    },
    {
      id: 'c6',
      title: 'Upgrade to Nuxt 4',
      description: 'Bump dependencies and fix breaking app directory changes.',
      columnId: 'doing',
      assigneeId: 'p8',
    },
    {
      id: 'c7',
      title: 'Investigate memory leak',
      description: 'Profile the worker process after long-running generate jobs.',
      columnId: 'done',
      assigneeId: 'p3',
    },
    {
      id: 'c8',
      title: 'Ship dark mode toggle',
      description: 'Persist preference and respect prefers-color-scheme on first visit.',
      columnId: 'done',
      assigneeId: 'p2',
    },
  ]
}

export function useBoard() {
  const cards = useState<Card[]>('kanban-cards', () => createInitialCards())

  const getPerson = (id: string | null) =>
    id ? people.find(person => person.id === id) ?? null : null

  const cardsInColumn = (columnId: ColumnId) =>
    cards.value.filter(card => card.columnId === columnId)

  function moveCard(cardId: string, toColumnId: ColumnId, toIndex?: number) {
    const fromIndex = cards.value.findIndex(card => card.id === cardId)
    if (fromIndex === -1) return

    const card = cards.value[fromIndex]
    const without = [...cards.value]
    without.splice(fromIndex, 1)

    const updated: Card = { ...card, columnId: toColumnId }
    const columnCards = without.filter(c => c.columnId === toColumnId)
    const others = without.filter(c => c.columnId !== toColumnId)

    const insertAt = Math.max(0, Math.min(toIndex ?? columnCards.length, columnCards.length))
    columnCards.splice(insertAt, 0, updated)

    // Preserve relative order of other columns as they appear in the original list
    const next: Card[] = []
    for (const column of columns) {
      if (column.id === toColumnId) {
        next.push(...columnCards)
      } else {
        next.push(...others.filter(c => c.columnId === column.id))
      }
    }
    cards.value = next
  }

  function reorderWithinColumn(cardId: string, toIndex: number) {
    const card = cards.value.find(c => c.id === cardId)
    if (!card) return
    moveCard(cardId, card.columnId, toIndex)
  }

  function updateCard(cardId: string, patch: Partial<Pick<Card, 'title' | 'description' | 'assigneeId'>>) {
    const index = cards.value.findIndex(card => card.id === cardId)
    if (index === -1) return
    cards.value[index] = { ...cards.value[index], ...patch }
  }

  function deleteCard(cardId: string) {
    cards.value = cards.value.filter(card => card.id !== cardId)
  }

  function moveCardByDelta(cardId: string, columnDelta: number, indexDelta: number) {
    const card = cards.value.find(c => c.id === cardId)
    if (!card) return

    const columnIndex = columns.findIndex(c => c.id === card.columnId)
    const targetColumnIndex = Math.max(0, Math.min(columns.length - 1, columnIndex + columnDelta))
    const targetColumnId = columns[targetColumnIndex].id
    const siblings = cardsInColumn(targetColumnId).filter(c => c.id !== cardId)
    const currentIndex = cardsInColumn(card.columnId).findIndex(c => c.id === cardId)

    let targetIndex: number
    if (targetColumnId === card.columnId) {
      targetIndex = Math.max(0, Math.min(siblings.length, currentIndex + indexDelta))
    } else if (indexDelta !== 0) {
      targetIndex = Math.max(0, Math.min(siblings.length, currentIndex + indexDelta))
    } else {
      targetIndex = Math.max(0, Math.min(siblings.length, currentIndex))
    }

    moveCard(cardId, targetColumnId, targetIndex)
  }

  return {
    columns,
    people,
    cards,
    getPerson,
    cardsInColumn,
    moveCard,
    reorderWithinColumn,
    updateCard,
    deleteCard,
    moveCardByDelta,
  }
}
