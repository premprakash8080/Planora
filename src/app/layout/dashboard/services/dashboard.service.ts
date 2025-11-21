import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';

export interface DashboardStats {
  upcoming: number;
  overdue: number;
  ongoing: number;
  complete: number;
}

export interface MonthlyStats {
  newJobs: number;
  housesOut: number;
  completed: number;
}

export interface DashboardData {
  stats: DashboardStats;
  monthlyStats: MonthlyStats;
  noticeBoard: string;
}

export interface TaskDashboardResponse {
  upcomingTasks: any[];
  overdueTasks: any[];
  inProgressTasks: any[];
  doneTasks: any[];
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  color?: string;
  status?: string;
  due_date?: string;
  is_archived?: boolean;
  is_favorite?: boolean;
  created_by?: number;
  team_id?: number;
  creator?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    avatar_color?: string;
    initials?: string;
  };
  members?: Array<{
    id: number;
    project_id: number;
    user_id: number;
    role: string;
    user: {
      id: number;
      full_name: string;
      email: string;
      avatar_url?: string;
      avatar_color?: string;
      initials?: string;
    };
  }>;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private httpService: HttpService) {}

  /**
   * Get task dashboard statistics
   */
  getTaskDashboardStats(): Observable<DashboardStats> {
    return this.httpService.get(ENDPOINTS.getDashboardCounts).pipe(
      map((response: { data: { upcomingTasks: number; overdueTasks: number; inProgressTasks: number; doneTasks: number } }) => {
        console.log(response.data.upcomingTasks);
        console.log(response.data.overdueTasks);
        console.log(response.data.inProgressTasks);
        console.log(response.data.doneTasks);
        return {
          upcoming: response.data.upcomingTasks|| 0,
          overdue: response.data.overdueTasks || 0,
          ongoing: response.data.inProgressTasks || 0,
          complete: response.data.doneTasks|| 0
        };
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get monthly statistics
   */
  getMonthlyStats(fiscalYear?: string): Observable<MonthlyStats> {
    const params = fiscalYear ? { fiscalYear } : {};
    return this.httpService.get(ENDPOINTS.getMonthlyStats, params).pipe(
      map((response: MonthlyStats) => response),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get notice board message
   */
  getNoticeBoard(): Observable<string> {
    return this.httpService.get(ENDPOINTS.getNoticeBoard).pipe(
      map((response: { message: string }) => response.message || ''),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update notice board message
   */
  updateNoticeBoard(message: string): Observable<{ success: boolean; message: string }> {
    return this.httpService.post(ENDPOINTS.updateNoticeBoard, { message }).pipe(
      map((response) => response),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get all projects
   */
  getProjects(includeArchived = false): Observable<Project[]> {
    return this.httpService.get(ENDPOINTS.getProjects, { includeArchived }).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.projects) {
          return response.data.projects;
        }
        // Fallback for direct array response (backward compatibility)
        if (Array.isArray(response)) {
          return response;
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

