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

export interface Column {
  id: ColumnId
  title: string
}
