/**
 * Project Overview Data Models
 */

export interface ProjectOverviewMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  role?: string;
}

export interface ProjectOverviewActivity {
  id: string;
  type: 'status' | 'join' | 'create' | 'due' | 'update' | 'comment' | 'assign';
  icon: string;
  message: string;
  userInitials?: string;
  userColor?: string;
  time: string;
}

export interface ProjectOverviewData {
  description: string;
  members: ProjectOverviewMember[];
  status: 'on-track' | 'at-risk' | 'off-track';
  dueDate: string | null;
  activities: ProjectOverviewActivity[];
}

