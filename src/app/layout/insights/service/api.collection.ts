import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection
 * Centralized endpoint definitions matching backend API structure
 */
export const ENDPOINTS = {
  // Authentication endpoints
  getProfile: `${environment.apiBaseUrl}/api/users/profile`,
  verifyToken: `${environment.apiBaseUrl}/api/users/validate/token`,
  
  // Insights endpoints
  // Productivity Overview
  getProductivityMetrics: `${environment.apiBaseUrl}/api/insights/productivity/metrics`,
  getProductivityTrends: `${environment.apiBaseUrl}/api/insights/productivity/trends`,
  
  // Reports
  getReportMetrics: `${environment.apiBaseUrl}/api/insights/reports/metrics`,
  getTaskStatusAnalytics: `${environment.apiBaseUrl}/api/insights/reports/task-status`,
  getProjectPerformance: `${environment.apiBaseUrl}/api/insights/reports/project-performance`,
  
  // Team Performance
  getTeamMetrics: `${environment.apiBaseUrl}/api/insights/team/metrics`,
  getTeamMemberPerformance: `${environment.apiBaseUrl}/api/insights/team/members`,
  
  // Time Tracking
  getTimeTrackingSummary: `${environment.apiBaseUrl}/api/insights/time-tracking/summary`,
  getDailyTimeBreakdown: `${environment.apiBaseUrl}/api/insights/time-tracking/daily-breakdown`,
  getTimeEntries: `${environment.apiBaseUrl}/api/insights/time-tracking/entries`,
};
