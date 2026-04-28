export type TaskCategory = "school" | "job_application" | "general";

export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: string;
  user_id: string;
  email_id: string;
  email_subject: string;
  email_from: string;
  email_date: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
}
