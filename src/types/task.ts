export type Priority = "low" | "medium" | "high"

export type TaskStatus = "pending" | "completed"

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: Priority
  createdAt: Date
  updatedAt: Date
}

export interface TaskFilters {
  status?: TaskStatus | "all"
  priority?: Priority | "all"
  sortBy?: "name" | "priority" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  byPriority: {
    high: number
    medium: number
    low: number
  }
}