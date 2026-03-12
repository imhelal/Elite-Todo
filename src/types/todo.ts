export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: number;
  isSyncing?: boolean; // For optimistic UI feedback
}
