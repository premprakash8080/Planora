import { environment } from "src/environments/environment";

/**
 * API Endpoints Collection for Mails
 */
export const ENDPOINTS = {
  getInboxMails: `${environment.apiBaseUrl}/api/mails/inbox`,
  getUnreadMails: `${environment.apiBaseUrl}/api/mails/unread`,
  getStarredMails: `${environment.apiBaseUrl}/api/mails/starred`,
  getArchivedMails: `${environment.apiBaseUrl}/api/mails/archived`,
  getSentMails: `${environment.apiBaseUrl}/api/mails/sent`,
  getMailById: `${environment.apiBaseUrl}/api/mails/:mailId`,
  sendMail: `${environment.apiBaseUrl}/api/mails`,
  updateMail: `${environment.apiBaseUrl}/api/mails/:mailId`,
  deleteMail: `${environment.apiBaseUrl}/api/mails/:mailId`,
};

