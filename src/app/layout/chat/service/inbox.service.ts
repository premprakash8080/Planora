import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';

export interface ActivityLog {
  id: number;
  task_id: number;
  project_id: number;
  activity_type: string;
  description: string;
  old_value?: any;
  new_value?: any;
  updated_by: number;
  created_at: string;
  task?: {
    id: number;
    title: string;
    status?: string;
    priority?: string;
  };
  project?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    avatar_color?: string;
    initials?: string;
  };
}

export interface InboxUpdate {
  id: string;
  taskName: string;
  projectName: string;
  updateType: 'created' | 'updated' | 'completed' | 'assigned' | 'comment';
  updateDescription: string;
  time: string | null;
  timeAgo: string | null;
  userAvatar?: string | null;
  userInitials?: string;
  userName: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
}

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  constructor(private httpService: HttpService) {}

  /**
   * Get inbox activities
   */
  getInboxActivities(limit: number = 50, offset: number = 0): Observable<InboxUpdate[]> {
    const params = { limit: limit.toString(), offset: offset.toString() };
    return this.httpService.get(ENDPOINTS.getInboxActivities, params).pipe(
      map((response: any) => {
        if (response.success && response.data?.activities) {
          return response.data.activities as InboxUpdate[];
        }
        if (Array.isArray(response)) {
          return response as InboxUpdate[];
        }
        return [];
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get task activities
   */
  getTaskActivities(taskId: number): Observable<ActivityLog[]> {
    return this.httpService.get(ENDPOINTS.getTaskActivities.replace(':taskId', taskId.toString())).pipe(
      map((response: { success: boolean; data: { activities: ActivityLog[] } }) => {
        if (response.success && response.data) {
          return response.data.activities;
        }
        return [];
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
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

