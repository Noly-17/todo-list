import { useMemo, useState } from "react"
import { Task, TaskFilters, TaskStats } from "@/types/task"

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks

    if (filters.status === "completed") {
      filtered = filtered.filter(task => task.completed)
    } else if (filters.status === "pending") {
      filtered = filtered.filter(task => !task.completed)
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title)
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case "createdAt":
          comparison = b.createdAt.getTime() - a.createdAt.getTime()
          break
        default:
          break
      }

      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    return sorted
  }, [tasks, filters])

  const taskStats = useMemo((): TaskStats => {
    const total = tasks.length
    const completed = tasks.filter(task => task.completed).length
    const pending = total - completed

    const byPriority = tasks.reduce(
      (acc, task) => {
        acc[task.priority]++
        return acc
      },
      { high: 0, medium: 0, low: 0 }
    )

    return {
      total,
      completed,
      pending,
      byPriority,
    }
  }, [tasks])

  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
  }

  return {
    filters,
    filteredTasks: filteredAndSortedTasks,
    taskStats,
    updateFilters,
    resetFilters,
  }
}