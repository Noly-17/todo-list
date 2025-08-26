import { useState } from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Clock, AlertCircle, Circle } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    try {
      setIsToggling(true);
      await onToggle(task.id);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await onDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsDeleting(false);
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Circle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card
      className={`border-l-4 transition-all duration-200 hover:shadow-md ${getPriorityColor()} ${task.completed ? 'opacity-75 bg-muted/50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center pt-0.5">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="h-5 w-5"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p
                  className={`text-sm font-medium break-words ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getPriorityIcon()}
                  <span className="text-xs text-muted-foreground capitalize">
                    {task.priority} priority
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(task.createdAt)}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
