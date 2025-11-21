import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection for Inbox
 */
export const ENDPOINTS = {
  getInboxActivities: `${environment.apiBaseUrl}/api/activity-logs/inbox`,
  getTaskActivities: `${environment.apiBaseUrl}/api/activity-logs/task/:taskId`,
};
