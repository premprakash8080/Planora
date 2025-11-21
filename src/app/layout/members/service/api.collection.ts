import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection for Members
 * Note: Members are managed through the /api/members endpoint
 */
export const ENDPOINTS = {
  getMembers: `${environment.apiBaseUrl}/api/members`,
  getMemberById: `${environment.apiBaseUrl}/api/members/:id`,
  getTeamMembers: `${environment.apiBaseUrl}/api/teams/:teamId/members`,
  createMember: `${environment.apiBaseUrl}/api/members`,
  updateMember: `${environment.apiBaseUrl}/api/members/:id`,
  deleteMember: `${environment.apiBaseUrl}/api/members/:id`,
  getMemberProjectsCount: `${environment.apiBaseUrl}/api/members/:id/projects/count`,
  getAvailableMembersForProject: `${environment.apiBaseUrl}/api/members/available-for-project`,
};

