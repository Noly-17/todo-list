'use client';

import { useTasks } from '@/hooks/useTasks';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskStats } from '@/components/TaskStats';
import { ListTodo } from 'lucide-react';

export default function Home() {
  const {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    clearCompleted,
  } = useTasks();

  const { filters, filteredTasks, taskStats, updateFilters } =
    useTaskFilters(tasks);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Todo List</h1>
          </div>
          <p className="text-muted-foreground">
            Organize your tasks with priorities and stay productive
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm font-medium">
              Error: {error}
            </p>
          </div>
        )}

        <div className="grid gap-8">
          <TaskStats stats={taskStats} />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <TaskForm onSubmit={addTask} disabled={loading} />
            </div>

            <div className="lg:col-span-2">
              <TaskList
                tasks={filteredTasks}
                filters={filters}
                onFiltersChange={updateFilters}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onEditTask={editTask}
                onClearCompleted={clearCompleted}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
