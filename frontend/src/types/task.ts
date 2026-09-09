export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  isCompleted: boolean;
  createdAt: string;
  dueDate: string | null;
  completedAt: string | null;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
}
