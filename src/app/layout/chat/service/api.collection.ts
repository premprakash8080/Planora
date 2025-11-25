import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection for Chat Module
 */
export const CHAT_ENDPOINTS = {
  // Channels
  getChannels: `${environment.apiBaseUrl}/api/channels`,
  getChannelById: `${environment.apiBaseUrl}/api/channels/:channelId`,
  createChannel: `${environment.apiBaseUrl}/api/channels`,
  updateChannel: `${environment.apiBaseUrl}/api/channels/:channelId`,
  deleteChannel: `${environment.apiBaseUrl}/api/channels/:channelId`,
  
  // Direct Messages
  startDirectMessage: `${environment.apiBaseUrl}/api/channels/direct`,
  getDirectMessages: `${environment.apiBaseUrl}/api/channels/direct`,
  
  // Members
  addMember: `${environment.apiBaseUrl}/api/channels/:channelId/members`,
  removeMember: `${environment.apiBaseUrl}/api/channels/:channelId/members/:memberId`,
  updateMemberRole: `${environment.apiBaseUrl}/api/channels/:channelId/members/:memberId/role`,
  
  // Messages
  sendMessage: `${environment.apiBaseUrl}/api/channels/:channelId/messages`,
  getMessages: `${environment.apiBaseUrl}/api/channels/:channelId/messages`,
  
  // Read tracking
  markMessagesAsRead: `${environment.apiBaseUrl}/api/channels/:channelId/mark-read`,
  getUnreadCounts: `${environment.apiBaseUrl}/api/channels/unread-counts`,
  
  // Users
  getAllUsers: `${environment.apiBaseUrl}/api/users`,
  getFirebaseToken: `${environment.apiBaseUrl}/api/users/firebase-token`,
};

