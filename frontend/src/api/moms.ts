import api from "./client";
import type { MinutesOfMeeting } from "../types";

export const momApi = {
  list: (status?: string) =>
    api
      .get<MinutesOfMeeting[]>("/moms", {
        params: status ? { status } : {},
      })
      .then((r) => r.data),
  get: (id: string) =>
    api.get<MinutesOfMeeting>(`/moms/${id}`).then((r) => r.data),
  create: (data: {
    meeting_id: string;
    prepared_by: string;
    summary?: string;
  }) => api.post<MinutesOfMeeting>("/moms", data).then((r) => r.data),
  addAgendaItem: (
    momId: string,
    data: { title: string; discussion?: string; decisions?: string }
  ) =>
    api
      .post<MinutesOfMeeting>(`/moms/${momId}/agenda-items`, data)
      .then((r) => r.data),
  submit: (momId: string) =>
    api.post<MinutesOfMeeting>(`/moms/${momId}/submit`).then((r) => r.data),
  validate: (momId: string, validated_by: string) =>
    api
      .post<MinutesOfMeeting>(`/moms/${momId}/validate`, { validated_by })
      .then((r) => r.data),
  reject: (momId: string, rejected_by: string, reason: string) =>
    api
      .post<MinutesOfMeeting>(`/moms/${momId}/reject`, {
        rejected_by,
        reason,
      })
      .then((r) => r.data),
  revise: (momId: string) =>
    api.post<MinutesOfMeeting>(`/moms/${momId}/revise`).then((r) => r.data),
};
