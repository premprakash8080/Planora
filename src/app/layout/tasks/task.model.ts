// TaskStatus and PriorityLabel models (from backend)
export interface TaskStatus {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  order: number;
  is_default: boolean;
  is_active: boolean;
  project_id?: number | null;
}

export interface PriorityLabel {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  order: number;
  is_default: boolean;
  is_active: boolean;
  project_id?: number | null;
}

// Legacy types for backward compatibility (deprecated, use TaskStatus and PriorityLabel objects)
export type TaskStatusLegacy = 'To Do' | 'In Progress' | 'Done' | 'On Track' | 'At Risk' | 'Off Track';
export type TaskPriorityLegacy = 'Low' | 'Medium' | 'High';

export interface TaskComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  avatar?: string;
}

export interface Task {
  id: string;
  name: string;
  assignee?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  // New: Use IDs and objects instead of string values
  priority_label_id?: number | null;
  task_status_id?: number | null;
  priorityLabel?: PriorityLabel; // Full priority label object
  taskStatus?: TaskStatus; // Full task status object
  // Legacy: Keep for backward compatibility during migration
  priority?: TaskPriorityLegacy;
  status?: TaskStatusLegacy;
  description?: string;
  commentsCount?: number;
  completed?: boolean;
  parentId?: string;
  subtasks?: Task[];
  comments?: TaskComment[];
}

export interface TaskSection {
  id: string;
  title: string;
  tasks: Task[];
  expanded: boolean;
}
