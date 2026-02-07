import api from "./client";
import type { Department } from "../types";

export const departmentApi = {
  list: () => api.get<Department[]>("/departments").then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    api.post<Department>("/departments", data).then((r) => r.data),
  delete: (id: string) => api.delete(`/departments/${id}`).then((r) => r.data),
};
