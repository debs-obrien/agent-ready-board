import type { Card, Column, ColumnId, Person } from '~/types/board'

const columns: Column[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
]

const people: Person[] = [
  { id: 'p1', name: 'Aisha Rahman' },
  { id: 'p2', name: 'Ben Carter' },
  { id: 'p3', name: 'Chloe Nguyen' },
  { id: 'p4', name: 'Diego Alvarez' },
  { id: 'p5', name: 'Elena Petrova' },
  { id: 'p6', name: 'Farid Hassan' },
  { id: 'p7', name: 'Grace Okonkwo' },
  { id: 'p8', name: 'Hiro Tanaka' },
  { id: 'p9', name: 'Ivy Chen' },
  { id: 'p10', name: 'Jamal Wright' },
]

function createInitialCards(): Card[] {
  return [
    {
      id: 'c1',
      title: 'Wire up CI pipeline',
      description: 'Add lint, typecheck, and preview deploy on every PR.',
      columnId: 'todo',
      assigneeId: 'p1',
    },
    {
      id: 'c2',
      title: 'Playwright tests',
      description: 'Cover board drag, keyboard move, and assign picker flows.',
      columnId: 'todo',
      assigneeId: 'p3',
    },
    {
      id: 'c3',
      title: 'Refactor auth middleware',
      description: 'Split session refresh from route guards.',
      columnId: 'todo',
      assigneeId: null,
    },
    {
      id: 'c4',
      title: 'Ship feature-flag SDK',
      description: 'Expose typed helpers for gradual rollouts.',
      columnId: 'doing',
      assigneeId: 'p5',
    },
    {
      id: 'c5',
      title: 'Fix flaky Zod parse',
      description: 'Normalize empty strings before schema validation.',
      columnId: 'doing',
      assigneeId: 'p2',
    },
    {
      id: 'c6',
      title: 'Document API rate limits',
      description: 'Add examples for burst and sustained quotas.',
      columnId: 'doing',
      assigneeId: 'p7',
    },
    {
      id: 'c7',
      title: 'Migrate Redis cache keys',
      description: 'Prefix keys by environment and bump TTL defaults.',
      columnId: 'done',
      assigneeId: 'p4',
    },
    {
      id: 'c8',
      title: 'Tighten TypeScript strictness',
      description: 'Enable noUncheckedIndexedAccess across packages.',
      columnId: 'done',
      assigneeId: 'p9',
    },
  ]
}

const cards = ref<Card[]>(createInitialCards())

export function useBoard() {
  const cardsByColumn = computed(() => {
    const map: Record<ColumnId, Card[]> = {
      todo: [],
      doing: [],
      done: [],
    }
    for (const card of cards.value) {
      map[card.columnId].push(card)
    }
    return map
  })

  function personById(id: string | null): Person | null {
    if (!id) return null
    return people.find(p => p.id === id) ?? null
  }

  function updateCard(id: string, patch: Partial<Pick<Card, 'title' | 'description' | 'assigneeId'>>) {
    const card = cards.value.find(c => c.id === id)
    if (!card) return
    Object.assign(card, patch)
  }

  function deleteCard(id: string) {
    cards.value = cards.value.filter(c => c.id !== id)
  }

  /** Move a card so it ends at `targetIndex` within `targetColumnId`. */
  function moveCard(cardId: string, targetColumnId: ColumnId, targetIndex: number) {
    const source = cards.value.find(c => c.id === cardId)
    if (!source) return

    const without = cards.value.filter(c => c.id !== cardId)
    source.columnId = targetColumnId

    const targetPositions = without
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.columnId === targetColumnId)

    const clamped = Math.max(0, Math.min(targetIndex, targetPositions.length))

    let insertAt: number
    if (targetPositions.length === 0) {
      insertAt = without.length
    } else if (clamped >= targetPositions.length) {
      insertAt = targetPositions[targetPositions.length - 1]!.i + 1
    } else {
      insertAt = targetPositions[clamped]!.i
    }

    without.splice(insertAt, 0, source)
    cards.value = without
  }

  function moveCardRelative(cardId: string, direction: 'up' | 'down' | 'left' | 'right') {
    const card = cards.value.find(c => c.id === cardId)
    if (!card) return

    const columnOrder: ColumnId[] = ['todo', 'doing', 'done']
    const colIndex = columnOrder.indexOf(card.columnId)
    const list = cardsByColumn.value[card.columnId]
    const index = list.findIndex(c => c.id === cardId)
    if (index === -1) return

    if (direction === 'up' && index > 0) {
      moveCard(cardId, card.columnId, index - 1)
      return
    }
    if (direction === 'down' && index < list.length - 1) {
      moveCard(cardId, card.columnId, index + 1)
      return
    }
    if (direction === 'left' && colIndex > 0) {
      const target = columnOrder[colIndex - 1]!
      const targetLen = cardsByColumn.value[target].length
      moveCard(cardId, target, Math.min(index, targetLen))
      return
    }
    if (direction === 'right' && colIndex < columnOrder.length - 1) {
      const target = columnOrder[colIndex + 1]!
      const targetLen = cardsByColumn.value[target].length
      moveCard(cardId, target, Math.min(index, targetLen))
    }
  }

  return {
    columns,
    people,
    cards,
    cardsByColumn,
    personById,
    updateCard,
    deleteCard,
    moveCard,
    moveCardRelative,
  }
}
