import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';
import { TaskStatus } from '../task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskStatusService {
  constructor(private httpService: HttpService) {}

  /**
   * Get all task statuses (optionally filtered by project)
   */
  getTaskStatuses(projectId?: number | null): Observable<TaskStatus[]> {
    return this.httpService.post(ENDPOINTS.getTaskStatuses, {
      project_id: projectId || null
    }).pipe(
      map((response: any) => {
        if (response.success && response.data?.taskStatuses) {
          return response.data.taskStatuses;
        }
        return response.data || response || [];
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get task status by ID
   */
  getTaskStatusById(statusId: number): Observable<TaskStatus> {
    return this.httpService.post(ENDPOINTS.getTaskStatusById, {
      id: statusId
    }).pipe(
      map((response: any) => {
        if (response.success && response.data?.taskStatus) {
          return response.data.taskStatus;
        }
        return response.data || response;
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Create a new task status
   */
  createTaskStatus(status: Partial<TaskStatus>): Observable<TaskStatus> {
    return this.httpService.post(ENDPOINTS.createTaskStatus, status).pipe(
      map((response: any) => {
        if (response.success && response.data?.taskStatus) {
          return response.data.taskStatus;
        }
        return response.data || response;
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update task status
   */
  updateTaskStatus(statusId: number, updates: Partial<TaskStatus>): Observable<TaskStatus> {
    return this.httpService.put(ENDPOINTS.updateTaskStatus, {
      id: statusId,
      ...updates
    }).pipe(
      map((response: any) => {
        if (response.success && response.data?.taskStatus) {
          return response.data.taskStatus;
        }
        return response.data || response;
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Delete task status (soft delete)
   */
  deleteTaskStatus(statusId: number): Observable<void> {
    return this.httpService.delete(ENDPOINTS.deleteTaskStatus, {
      id: statusId
    }).pipe(
      map(() => {}),
      catchError((error) => {
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

