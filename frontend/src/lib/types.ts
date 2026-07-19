export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  settings: UserSettings;
}

export interface UserSettings {
  voice?: string;
  theme?: string;
  orb_color?: string;
  animation_speed?: number;
  wake_word?: string;
  ai_provider?: string;
  memory_enabled?: boolean;
  automation_permissions?: Record<string, boolean>;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_name?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ChatResponse {
  conversation_id: string;
  message: Message;
  action_taken?: string | null;
  pending_confirmation_token?: string | null;
}

export interface MemoryRecord {
  id: string;
  kind: string;
  content: string;
  source: string;
  importance: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  event_type: string;
  recurrence: string;
  recurrence_end: string | null;
  reminder_minutes_before: number;
}

export interface Note {
  id: string;
  title: string;
  content_markdown: string;
  folder: string;
  tags: string[];
  ai_summary: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  size_bytes: number;
  extension: string;
  category: string;
  modified_at: number;
}

export interface Plugin {
  slug: string;
  name: string;
  description: string;
  version: string;
  permissions: string[];
  entry_point: string;
  enabled: boolean;
}

export interface SystemStats {
  cpu_percent: number;
  cpu_per_core: number[];
  ram_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  disk_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
  net_sent_mb: number;
  net_recv_mb: number;
  gpu: Array<{ name: string; utilization_percent: number; memory_used_gb: number; memory_total_gb: number }>;
  top_processes: Array<{ pid: number; name: string; cpu_percent: number; memory_percent: number }>;
}

export type OrbState = "idle" | "listening" | "speaking" | "thinking";
