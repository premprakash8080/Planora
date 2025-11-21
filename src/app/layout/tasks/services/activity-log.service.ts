import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

export interface ActivityLog {
  id: number;
  task_id?: number;
  project_id: number;
  activity_type: string;
  description: string;
  old_value?: any;
  new_value?: any;
  updated_by: number;
  user?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    avatar_color?: string;
    initials?: string;
  };
  task?: {
    id: number;
    title: string;
  };
  project?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface ActivityLogResponse {
  success: boolean;
  data: {
    logs: ActivityLog[];
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  constructor(
    private httpService: HttpService,
    private snackBarService: SnackBarService
  ) {}

  /**
   * Get activity logs for a task
   */
  getTaskActivityLogs(taskId: string, page = 1, limit = 50): Observable<{ logs: ActivityLog[]; pagination?: any }> {
    const url = ENDPOINTS.getTaskActivityLogs.replace(':taskId', taskId);
    return this.httpService.get(url, { page, limit }).pipe(
      map((response: ActivityLogResponse) => {
        if (response.success && response.data.logs) {
          return {
            logs: response.data.logs,
            pagination: response.meta?.pagination
          };
        }
        return { logs: [] };
      }),
      catchError((error) => {
        console.error('Error loading activity logs:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get activity logs for a project
   */
  getProjectActivityLogs(projectId: string, page = 1, limit = 50): Observable<{ logs: ActivityLog[]; pagination?: any }> {
    const url = ENDPOINTS.getProjectActivityLogs.replace(':projectId', projectId);
    return this.httpService.get(url, { page, limit }).pipe(
      map((response: ActivityLogResponse) => {
        if (response.success && response.data.logs) {
          return {
            logs: response.data.logs,
            pagination: response.meta?.pagination
          };
        }
        return { logs: [] };
      }),
      catchError((error) => {
        console.error('Error loading activity logs:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get recent activity logs for current user
   */
  getRecentActivityLogs(limit = 20): Observable<ActivityLog[]> {
    return this.httpService.get(ENDPOINTS.getRecentActivityLogs, { limit }).pipe(
      map((response: ActivityLogResponse) => {
        if (response.success && response.data.logs) {
          return response.data.logs;
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error loading recent activity logs:', error);
        return throwError(() => this.handleError(error));
      })
    );
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

