import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection for Tasks
 */
export const ENDPOINTS = {
  // Task endpoints
  getTaskDashboardCounts: `${environment.apiBaseUrl}/api/tasks/getdashboardtaskcount`,
  getTasksByProject: `${environment.apiBaseUrl}/api/tasks/get-task-by-project/:projectId`,
  getTaskById: `${environment.apiBaseUrl}/api/tasks/gettaskbyid/:taskId`,
  createTask: `${environment.apiBaseUrl}/api/tasks/createtask`,
  updateTask: `${environment.apiBaseUrl}/api/tasks/updatetask`, // Using body for taskId
  updateTaskById: `${environment.apiBaseUrl}/api/tasks/updatetaskbyid/:taskId`, // Using params for taskId
  deleteTask: `${environment.apiBaseUrl}/api/tasks/deletetaskbyid/:taskId`,
  toggleTaskCompletion: `${environment.apiBaseUrl}/api/tasks/:taskId/toggle-completion`,
  
  // Section endpoints (all using POST with req.body)
  getSectionsByProject: `${environment.apiBaseUrl}/api/sections/project`,
  createSection: `${environment.apiBaseUrl}/api/sections`,
  updateSection: `${environment.apiBaseUrl}/api/sections`,
  updateSectionTitle: `${environment.apiBaseUrl}/api/sections/title`,
  deleteSection: `${environment.apiBaseUrl}/api/sections`,
  
  // Task Comment endpoints
  createTaskComment: `${environment.apiBaseUrl}/api/comments`,
  getTaskComments: `${environment.apiBaseUrl}/api/comments/task/:taskId`,
  updateTaskComment: `${environment.apiBaseUrl}/api/comments/:commentId`,
  deleteTaskComment: `${environment.apiBaseUrl}/api/comments/:commentId`,
  
  // Activity Log endpoints
  getTaskActivityLogs: `${environment.apiBaseUrl}/api/activity-logs/task/:taskId`,
  getProjectActivityLogs: `${environment.apiBaseUrl}/api/activity-logs/project/:projectId`,
  getRecentActivityLogs: `${environment.apiBaseUrl}/api/activity-logs/recent`,
  
  // Batch operations
  batchUpdateTasks: `${environment.apiBaseUrl}/api/tasks/batchupdatetask`,
  batchUpdateSections: `${environment.apiBaseUrl}/api/sections/batch`,
  reorderTasksInSection: `${environment.apiBaseUrl}/api/tasks/reorder-tasks`,
  moveTaskToSection: `${environment.apiBaseUrl}/api/tasks/move-task`,
  moveTask: `${environment.apiBaseUrl}/api/tasks/move`,
  
  // Task Status endpoints
  getTaskStatuses: `${environment.apiBaseUrl}/api/task-statuses/get-task-statuses`,
  getTaskStatusById: `${environment.apiBaseUrl}/api/task-statuses/get-task-status-by-id`,
  createTaskStatus: `${environment.apiBaseUrl}/api/task-statuses/create-task-status`,
  updateTaskStatus: `${environment.apiBaseUrl}/api/task-statuses/update-task-status`,
  deleteTaskStatus: `${environment.apiBaseUrl}/api/task-statuses/delete-task-status`,
  
  // Priority Label endpoints
  getPriorityLabels: `${environment.apiBaseUrl}/api/priority-labels/get-priority-labels`,
  getPriorityLabelById: `${environment.apiBaseUrl}/api/priority-labels/get-priority-label-by-id`,
  createPriorityLabel: `${environment.apiBaseUrl}/api/priority-labels/create-priority-label`,
  updatePriorityLabel: `${environment.apiBaseUrl}/api/priority-labels/update-priority-label`,
  deletePriorityLabel: `${environment.apiBaseUrl}/api/priority-labels/delete-priority-label`,

  // Board View endpoints
  getBoardViewData: `${environment.apiBaseUrl}/api/board-view/projects/:projectId/data`,
  updateBoardViewTask: `${environment.apiBaseUrl}/api/board-view/tasks/:taskId`,
  createBoardViewSection: `${environment.apiBaseUrl}/api/board-view/projects/:projectId/sections`,
  updateBoardViewSection: `${environment.apiBaseUrl}/api/board-view/sections/:sectionId`,

  // Calendar View endpoints
  getCalendarViewData: `${environment.apiBaseUrl}/api/projects/:projectId/getCalendarViewData`,
  updateCalendarTask: `${environment.apiBaseUrl}/api/tasks/:taskId/updateCalendarTask`,

  // Dashboard View endpoints
  getProjectDashboardData: `${environment.apiBaseUrl}/api/projects/:projectId/getDashboardData`,
  
  // Timeline View endpoints
  getTimelineViewData: `${environment.apiBaseUrl}/api/timeline-view/projects/:projectId/data`,
  updateTimelineViewTask: `${environment.apiBaseUrl}/api/timeline-view/tasks/:taskId`,
  
  // Project Overview endpoints
  getProjectOverview: `${environment.apiBaseUrl}/api/projects/:projectId/overview`,
  updateProjectOverview: `${environment.apiBaseUrl}/api/projects/:projectId/overview`,
  getProjectActivities: `${environment.apiBaseUrl}/api/projects/:projectId/activities`,
  
  // Project Messages endpoints
  getProjectMessages: `${environment.apiBaseUrl}/api/projects/:projectId/getMessages`,
  createProjectMessage: `${environment.apiBaseUrl}/api/projects/:projectId/messages`,
  updateProjectMessage: `${environment.apiBaseUrl}/api/project-messages/:messageId`,
  pinProjectMessage: `${environment.apiBaseUrl}/api/project-messages/:messageId/pin`,
  deleteProjectMessage: `${environment.apiBaseUrl}/api/project-messages/:messageId`,
};

