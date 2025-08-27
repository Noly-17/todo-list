import { Task, TaskFilters } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, SortAsc, SortDesc, ListTodo, Trash2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  filters: TaskFilters;
  onFiltersChange: (filters: Partial<TaskFilters>) => void;
  onToggleTask: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onEditTask: (id: string, title: string) => Promise<void>;
  onClearCompleted: () => Promise<void>;
  loading?: boolean;
}

export function TaskList({
  tasks,
  filters,
  onFiltersChange,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onClearCompleted,
  loading = false,
}: TaskListProps) {
  const completedCount = tasks.filter((task) => task.completed).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            Loading tasks...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Sorting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({ status: value as TaskFilters['status'] })
                }
              >
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    priority: value as TaskFilters['priority'],
                  })
                }
              >
                <SelectTrigger id="priority-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-filter">Sort By</Label>
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value) =>
                  onFiltersChange({ sortBy: value as TaskFilters['sortBy'] })
                }
              >
                <SelectTrigger id="sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-filter">Order</Label>
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value) =>
                  onFiltersChange({
                    sortOrder: value as TaskFilters['sortOrder'],
                  })
                }
              >
                <SelectTrigger id="order-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Ascending
                    </div>
                  </SelectItem>
                  <SelectItem value="desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Descending
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {completedCount > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClearCompleted}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear {completedCount} Completed Task
                {completedCount !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tasks found</p>
                <p className="text-sm">
                  {filters.status === 'all'
                    ? 'Add your first task to get started!'
                    : 'No tasks match your current filters.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
