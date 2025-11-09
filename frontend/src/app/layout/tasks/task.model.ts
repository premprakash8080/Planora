export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

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
  assignee: string;
  assigneeAvatar?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  description?: string;
  commentsCount?: number;
  completed?: boolean;
  subtasks?: TaskSubtask[];
  comments?: TaskComment[];
}

export interface TaskSection {
  id: string;
  title: string;
  tasks: Task[];
  expanded: boolean;
}
