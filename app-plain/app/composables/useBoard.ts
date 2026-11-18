export type ColumnId = 'todo' | 'doing' | 'done'

export interface Person {
  id: string
  name: string
}

export interface Card {
  id: string
  title: string
  description: string
  columnId: ColumnId
  assigneeId: string | null
}

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
]

export const PEOPLE: Person[] = [
  { id: 'p1', name: 'Alex Chen' },
  { id: 'p2', name: 'Sam Rivera' },
  { id: 'p3', name: 'Jordan Lee' },
  { id: 'p4', name: 'Taylor Brooks' },
  { id: 'p5', name: 'Morgan Blake' },
  { id: 'p6', name: 'Casey Nguyen' },
  { id: 'p7', name: 'Riley Patel' },
  { id: 'p8', name: 'Avery Kim' },
  { id: 'p9', name: 'Quinn Morales' },
  { id: 'p10', name: 'Jamie Foster' },
]

const INITIAL_CARDS: Card[] = [
  {
    id: 'c1',
    title: 'Playwright tests',
    description: 'Cover the critical auth and board flows with end-to-end tests.',
    columnId: 'todo',
    assigneeId: 'p1',
  },
  {
    id: 'c2',
    title: 'Fix flaky CI pipeline',
    description: 'Investigate intermittent failures on the lint job.',
    columnId: 'todo',
    assigneeId: 'p3',
  },
  {
    id: 'c3',
    title: 'Upgrade to Nuxt 4',
    description: 'Bump dependencies and migrate any breaking config.',
    columnId: 'todo',
    assigneeId: null,
  },
  {
    id: 'c4',
    title: 'Refactor auth middleware',
    description: 'Simplify session refresh and redirect handling.',
    columnId: 'doing',
    assigneeId: 'p2',
  },
  {
    id: 'c5',
    title: 'Wire up feature flags',
    description: 'Gate the new board filters behind a remote flag.',
    columnId: 'doing',
    assigneeId: 'p6',
  },
  {
    id: 'c6',
    title: 'Optimize image loading',
    description: 'Add lazy loading and proper sizes for hero assets.',
    columnId: 'doing',
    assigneeId: 'p8',
  },
  {
    id: 'c7',
    title: 'Document API endpoints',
    description: 'Write OpenAPI notes for the public task routes.',
    columnId: 'done',
    assigneeId: 'p4',
  },
  {
    id: 'c8',
    title: 'Add dark mode toggle',
    description: 'Persist preference and respect system setting.',
    columnId: 'done',
    assigneeId: 'p10',
  },
]

export function useBoard() {
  const cards = useState<Card[]>('kanban-cards', () =>
    INITIAL_CARDS.map(card => ({ ...card })),
  )

  const announcement = useState('kanban-announcement', () => '')

  function announce(message: string) {
    announcement.value = ''
    nextTick(() => {
      announcement.value = message
    })
  }

  function cardsInColumn(columnId: ColumnId) {
    return cards.value.filter(card => card.columnId === columnId)
  }

  function getCard(cardId: string) {
    return cards.value.find(card => card.id === cardId)
  }

  function getPerson(personId: string | null) {
    if (!personId) return null
    return PEOPLE.find(person => person.id === personId) ?? null
  }

  function updateCard(cardId: string, patch: Partial<Pick<Card, 'title' | 'description' | 'assigneeId'>>) {
    const card = getCard(cardId)
    if (!card) return
    Object.assign(card, patch)
  }

  function deleteCard(cardId: string) {
    const card = getCard(cardId)
    cards.value = cards.value.filter(c => c.id !== cardId)
    if (card) announce(`Deleted “${card.title}”.`)
  }

  function moveCard(cardId: string, toColumnId: ColumnId, toIndex?: number) {
    const card = getCard(cardId)
    if (!card) return

    const fromColumnId = card.columnId
    const remaining = cards.value.filter(c => c.id !== cardId)
    card.columnId = toColumnId

    const byColumn: Record<ColumnId, Card[]> = {
      todo: [],
      doing: [],
      done: [],
    }
    for (const c of remaining) {
      byColumn[c.columnId].push(c)
    }

    const insertAt = Math.max(
      0,
      Math.min(toIndex ?? byColumn[toColumnId].length, byColumn[toColumnId].length),
    )
    byColumn[toColumnId].splice(insertAt, 0, card)
    cards.value = COLUMNS.flatMap(column => byColumn[column.id])

    const columnTitle = COLUMNS.find(c => c.id === toColumnId)?.title ?? toColumnId
    if (fromColumnId !== toColumnId) {
      announce(`Moved “${card.title}” to ${columnTitle}.`)
    } else {
      announce(`Reordered “${card.title}” in ${columnTitle}.`)
    }
  }

  function moveCardRelative(cardId: string, direction: 'up' | 'down' | 'left' | 'right') {
    const card = getCard(cardId)
    if (!card) return

    const columnIndex = COLUMNS.findIndex(c => c.id === card.columnId)
    const columnCards = cardsInColumn(card.columnId)
    const indexInColumn = columnCards.findIndex(c => c.id === cardId)

    if (direction === 'up' && indexInColumn > 0) {
      moveCard(cardId, card.columnId, indexInColumn - 1)
      return
    }

    if (direction === 'down' && indexInColumn < columnCards.length - 1) {
      moveCard(cardId, card.columnId, indexInColumn + 1)
      return
    }

    if (direction === 'left' && columnIndex > 0) {
      const target = COLUMNS[columnIndex - 1]!
      const targetLen = cardsInColumn(target.id).length
      moveCard(cardId, target.id, Math.min(indexInColumn, targetLen))
      return
    }

    if (direction === 'right' && columnIndex < COLUMNS.length - 1) {
      const target = COLUMNS[columnIndex + 1]!
      const targetLen = cardsInColumn(target.id).length
      moveCard(cardId, target.id, Math.min(indexInColumn, targetLen))
    }
  }

  return {
    cards,
    announcement,
    columns: COLUMNS,
    people: PEOPLE,
    cardsInColumn,
    getCard,
    getPerson,
    updateCard,
    deleteCard,
    moveCard,
    moveCardRelative,
    announce,
  }
}
