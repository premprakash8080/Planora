import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

export interface Mail {
  id: string;
  sender: string;
  senderEmail: string;
  senderAvatarUrl?: string;
  senderAvatarColor?: string;
  recipient?: string;
  recipientEmail?: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
}

export interface ComposeMail {
  to: string;
  subject: string;
  body: string;
}

export interface MailResponse {
  success: boolean;
  data: {
    mails?: Mail[];
    mail?: Mail;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MailService {
  constructor(
    private httpService: HttpService,
    private snackBarService: SnackBarService
  ) {}

  /**
   * Get inbox mails (received mails) - All mails
   */
  getMails(filters?: { is_read?: boolean; is_starred?: boolean; is_archived?: boolean }): Observable<Mail[]> {
    // For backward compatibility, use inbox endpoint with filters
    const params: any = {};
    if (filters?.is_read !== undefined) params.is_read = filters.is_read.toString();
    if (filters?.is_starred !== undefined) params.is_starred = filters.is_starred.toString();
    if (filters?.is_archived !== undefined) params.is_archived = filters.is_archived.toString();

    return this.httpService.get(ENDPOINTS.getInboxMails, params).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.mails) {
          return response.data.mails.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        // Fallback for direct array
        if (Array.isArray(response)) {
          return response.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        return [];
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load mails');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get all inbox mails
   */
  getAllMails(): Observable<Mail[]> {
    return this.httpService.get(ENDPOINTS.getInboxMails).pipe(
      map((response: any) => {
        if (response.success && response.data?.mails) {
          return response.data.mails.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        if (Array.isArray(response)) {
          return response.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        return [];
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load mails');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get unread mails
   */
  getUnreadMails(): Observable<Mail[]> {
    return this.httpService.get(ENDPOINTS.getUnreadMails).pipe(
      map((response: any) => {
        if (response.success && response.data?.mails) {
          return response.data.mails.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        if (Array.isArray(response)) {
          return response.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        return [];
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load unread mails');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get starred mails
   */
  getStarredMails(): Observable<Mail[]> {
    return this.httpService.get(ENDPOINTS.getStarredMails).pipe(
      map((response: any) => {
        if (response.success && response.data?.mails) {
          return response.data.mails.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        if (Array.isArray(response)) {
          return response.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        return [];
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load starred mails');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get archived mails
   */
  getArchivedMails(): Observable<Mail[]> {
    return this.httpService.get(ENDPOINTS.getArchivedMails).pipe(
      map((response: any) => {
        if (response.success && response.data?.mails) {
          return response.data.mails.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        if (Array.isArray(response)) {
          return response.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        return [];
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load archived mails');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get sent mails
   */
  getSentMails(): Observable<Mail[]> {
    return this.httpService.get(ENDPOINTS.getSentMails).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.mails) {
          return response.data.mails.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        // Fallback for direct array
        if (Array.isArray(response)) {
          return response.map((mail: any) => this.mapBackendMailToMail(mail));
        }
        return [];
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load sent mails');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get mail by ID
   */
  getMailById(id: string): Observable<Mail> {
    return this.httpService.get(ENDPOINTS.getMailById.replace(':mailId', id)).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.mail) {
          return this.mapBackendMailToMail(response.data.mail);
        }
        // Fallback for direct object
        if (response.id) {
          return this.mapBackendMailToMail(response);
        }
        throw new Error('Mail not found');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load mail');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Send mail
   */
  sendMail(mail: ComposeMail): Observable<Mail> {
    return this.httpService.post(ENDPOINTS.sendMail, {
      recipient_email: mail.to,
      subject: mail.subject,
      body: mail.body
    }).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.mail) {
          this.snackBarService.showSuccess(response.message || 'Mail sent successfully');
          return this.mapBackendMailToMail(response.data.mail);
        }
        // Fallback for direct object
        if (response.id) {
          this.snackBarService.showSuccess('Mail sent successfully');
          return this.mapBackendMailToMail(response);
        }
        throw new Error('Failed to send mail');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to send mail');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update mail (mark as read, star, archive, etc.)
   */
  updateMail(mailId: string, updates: { is_read?: boolean; is_starred?: boolean; is_archived?: boolean }): Observable<void> {
    return this.httpService.put(ENDPOINTS.updateMail.replace(':mailId', mailId), updates).pipe(
      map(() => {
        // Success handled by specific actions
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to update mail');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Delete mail
   */
  deleteMail(mailId: string): Observable<void> {
    return this.httpService.delete(ENDPOINTS.deleteMail.replace(':mailId', mailId)).pipe(
      map(() => {
        this.snackBarService.showSuccess('Mail deleted successfully');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to delete mail');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Mark mail as read
   */
  markAsRead(mailId: string): Observable<void> {
    return this.updateMail(mailId, { is_read: true });
  }

  /**
   * Toggle star
   */
  toggleStar(mailId: string, isStarred: boolean): Observable<void> {
    return this.updateMail(mailId, { is_starred: isStarred });
  }

  /**
   * Archive mail
   */
  archiveMail(mailId: string): Observable<void> {
    return this.updateMail(mailId, { is_archived: true });
  }

  /**
   * Unarchive mail
   */
  unarchiveMail(mailId: string): Observable<void> {
    return this.updateMail(mailId, { is_archived: false });
  }

  /**
   * Map backend mail format to frontend Mail interface
   */
  private mapBackendMailToMail(backendMail: any): Mail {
    return {
      id: backendMail.id?.toString() || '',
      sender: backendMail.sender || 'Unknown',
      senderEmail: backendMail.senderEmail || '',
      senderAvatarUrl: backendMail.senderAvatarUrl,
      senderAvatarColor: backendMail.senderAvatarColor,
      recipient: backendMail.recipient,
      recipientEmail: backendMail.recipientEmail,
      subject: backendMail.subject || '',
      preview: backendMail.preview || '',
      body: backendMail.body || '',
      timestamp: backendMail.timestamp || backendMail.created_at || new Date().toISOString(),
      isRead: backendMail.isRead !== undefined ? backendMail.isRead : backendMail.is_read || false,
      isStarred: backendMail.isStarred !== undefined ? backendMail.isStarred : backendMail.is_starred || false,
      isArchived: backendMail.isArchived !== undefined ? backendMail.isArchived : backendMail.is_archived || false
    };
  }

  private handleError(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
