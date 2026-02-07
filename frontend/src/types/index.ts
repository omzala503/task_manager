export interface Department {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  department_id: string;
  date: string;
  attendees: string[];
  location: string;
  created_at: string;
}

export interface AgendaItem {
  title: string;
  discussion: string;
  decisions: string;
}

export type MOMStatus = "draft" | "pending_review" | "validated" | "rejected";

export interface MinutesOfMeeting {
  id: string;
  meeting_id: string;
  prepared_by: string;
  agenda_items: AgendaItem[];
  summary: string;
  status: MOMStatus;
  validated_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  description: string;
  department_id: string;
  assigned_to: string;
  mom_id: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  departments: number;
  meetings: number;
  moms: { total: number; by_status: Record<string, number> };
  tasks: { total: number; by_status: Record<string, number> };
}
