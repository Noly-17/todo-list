import { useState, useEffect, useCallback } from 'react';
import { Task, Priority } from '@/types/task';
import { taskDB } from '@/lib/db';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allTasks = await taskDB.getAllTasks();
      setTasks(allTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (title: string, priority: Priority) => {
    try {
      setError(null);
      const newTask = await taskDB.addTask({
        title: title.trim(),
        completed: false,
        priority,
      });
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const updatedTask = await taskDB.updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  }, []);

  const editTask = useCallback(async (id: string, title: string) => {
    await updateTask(id, { title });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null);
      await taskDB.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  }, []);

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        await updateTask(id, { completed: !task.completed });
      }
    },
    [tasks, updateTask]
  );

  const clearCompleted = useCallback(async () => {
    const completedTasks = tasks.filter((task) => task.completed);
    try {
      setError(null);
      await Promise.all(
        completedTasks.map((task) => taskDB.deleteTask(task.id))
      );
      setTasks((prev) => prev.filter((task) => !task.completed));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to clear completed tasks'
      );
      throw err;
    }
  }, [tasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    editTask,
    deleteTask,
    toggleTask,
    clearCompleted,
    refetch: loadTasks,
  };
}
