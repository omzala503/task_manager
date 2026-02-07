import api from "./client";
import type { Meeting } from "../types";

export const meetingApi = {
  list: (departmentId?: string) =>
    api
      .get<Meeting[]>("/meetings", {
        params: departmentId ? { department_id: departmentId } : {},
      })
      .then((r) => r.data),
  get: (id: string) => api.get<Meeting>(`/meetings/${id}`).then((r) => r.data),
  create: (data: {
    title: string;
    department_id: string;
    date: string;
    attendees?: string[];
    location?: string;
  }) => api.post<Meeting>("/meetings", data).then((r) => r.data),
};
