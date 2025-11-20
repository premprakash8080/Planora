import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';

export interface ProjectMessage {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    avatarColor: string | null;
    initials: string | null;
  } | null;
}

export interface ProjectMessagesResponse {
  messages: ProjectMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProjectMessagesService {
  constructor(private httpService: HttpService) {}

  /**
   * Get project messages (paginated)
   */
  getMessages(projectId: string, page: number = 1, limit: number = 50): Observable<ProjectMessagesResponse> {
    const url = ENDPOINTS.getProjectMessages.replace(':projectId', projectId);
    return this.httpService.get(url, { page, limit }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return {
            messages: (response.data.messages || []).map((msg: any) => this.mapBackendMessage(msg)),
            pagination: response.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
          };
        }
        return { messages: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Create a new project message
   */
  createMessage(projectId: string, content: string): Observable<ProjectMessage> {
    const url = ENDPOINTS.createProjectMessage.replace(':projectId', projectId);
    return this.httpService.post(url, { content }).pipe(
      map((response: any) => {
        if (response.success && response.data?.message) {
          return this.mapBackendMessage(response.data.message);
        }
        throw new Error('Invalid response format');
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update a project message
   */
  updateMessage(messageId: string, content: string): Observable<ProjectMessage> {
    const url = ENDPOINTS.updateProjectMessage.replace(':messageId', messageId);
    return this.httpService.patch(url, { content }).pipe(
      map((response: any) => {
        if (response.success && response.data?.message) {
          return this.mapBackendMessage(response.data.message);
        }
        throw new Error('Invalid response format');
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Pin/unpin a project message
   */
  pinMessage(messageId: string): Observable<ProjectMessage> {
    const url = ENDPOINTS.pinProjectMessage.replace(':messageId', messageId);
    return this.httpService.patch(url, {}).pipe(
      map((response: any) => {
        if (response.success && response.data?.message) {
          return this.mapBackendMessage(response.data.message);
        }
        throw new Error('Invalid response format');
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Delete a project message
   */
  deleteMessage(messageId: string): Observable<void> {
    const url = ENDPOINTS.deleteProjectMessage.replace(':messageId', messageId);
    return this.httpService.delete(url).pipe(
      map(() => {}),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Map backend message to frontend format
   */
  private mapBackendMessage(backend: any): ProjectMessage {
    return {
      id: backend.id?.toString() || '',
      content: backend.content || '',
      pinned: !!backend.pinned,
      createdAt: backend.createdAt || backend.created_at || '',
      updatedAt: backend.updatedAt || backend.updated_at || '',
      author: backend.author ? {
        id: backend.author.id?.toString() || '',
        fullName: backend.author.fullName || backend.author.full_name || '',
        email: backend.author.email || '',
        avatarUrl: backend.author.avatarUrl || backend.author.avatar_url || null,
        avatarColor: backend.author.avatarColor || backend.author.avatar_color || null,
        initials: backend.author.initials || null,
      } : null,
    };
  }

  /**
   * Handle API errors
   */
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

