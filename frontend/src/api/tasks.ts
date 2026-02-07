import api from "./client";
import type { Task, DashboardData } from "../types";

export const taskApi = {
  list: (filters?: {
    department_id?: string;
    assigned_to?: string;
    status?: string;
    mom_id?: string;
  }) => api.get<Task[]>("/tasks", { params: filters }).then((r) => r.data),
  get: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (data: {
    title: string;
    department_id: string;
    assigned_to: string;
    description?: string;
    mom_id?: string;
    due_date?: string;
    priority?: string;
  }) => api.post<Task>("/tasks", data).then((r) => r.data),
  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      assigned_to?: string;
      due_date?: string;
      priority?: string;
    }
  ) => api.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),
  start: (id: string) =>
    api.post<Task>(`/tasks/${id}/start`).then((r) => r.data),
  complete: (id: string) =>
    api.post<Task>(`/tasks/${id}/complete`).then((r) => r.data),
  cancel: (id: string) =>
    api.post<Task>(`/tasks/${id}/cancel`).then((r) => r.data),
};

export const dashboardApi = {
  get: () => api.get<DashboardData>("/dashboard").then((r) => r.data),
};
