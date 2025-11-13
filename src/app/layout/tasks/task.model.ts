export type TaskStatus = 'To Do' | 'In Progress' | 'Done' | 'On Track' | 'At Risk' | 'Off Track';
export type TaskPriority = 'Low' | 'Medium' | 'High';

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
  priority?: TaskPriority;
  status?: TaskStatus;
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
