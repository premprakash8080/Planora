export type MemberRole = 'Developer' | 'Designer' | 'Manager' | 'QA' | 'DevOps';
export type MemberStatus = 'Active' | 'Inactive';
export type MemberAvailability = 'Full-time' | 'Part-time' | 'Contract';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  projectsAssigned: number;
  status: MemberStatus;
  avatarUrl?: string;
  avatarColor: string;
  initials: string;
  team: string;
  email: string;
  phone: string;
  location: string;
  availability: MemberAvailability;
  bio: string;
  skills: string[];
  lastActive: string;
}


