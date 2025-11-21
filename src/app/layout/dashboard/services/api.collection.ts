import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection
 * Centralized endpoint definitions matching backend API structure
 */
export const ENDPOINTS = {
  // Authentication endpoints
  getProfile: `${environment.apiBaseUrl}/api/users/profile`,
  verifyToken: `${environment.apiBaseUrl}/api/users/validate/token`,
  
  // Dashboard endpoints
  getTaskDashboard: `${environment.apiBaseUrl}/api/tasks/dashboard`,
  getMonthlyStats: `${environment.apiBaseUrl}/api/dashboard/monthly-stats`,
  getNoticeBoard: `${environment.apiBaseUrl}/api/dashboard/notice-board`,
  updateNoticeBoard: `${environment.apiBaseUrl}/api/dashboard/notice-board`,
  getDashboardCounts: `${environment.apiBaseUrl}/api/dashboard/task-dashboard-counts`,
  
  // Projects endpoints
  getProjects: `${environment.apiBaseUrl}/api/projects`,
};
