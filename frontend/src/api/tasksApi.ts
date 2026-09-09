import type { Task, TaskInput } from '../types/task';

const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5050/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (!response.ok) {
    let message = 'Unable to complete the request.';
    try {
      const body = await response.json() as { message?: string; title?: string };
      message = body.message ?? body.title ?? message;
    } catch {
      // Keep the useful generic message when the server returns no JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const tasksApi = {
  list: () => request<Task[]>('/tasks'),
  create: (input: TaskInput) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: TaskInput) => request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  toggleComplete: (id: number) => request<Task>(`/tasks/${id}/complete`, { method: 'PATCH' }),
};
