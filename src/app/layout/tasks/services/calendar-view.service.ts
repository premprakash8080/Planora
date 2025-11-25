import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';

export interface CalendarTaskAssignee {
  id: string;
  name: string;
  initials?: string | null;
  color?: string | null;
}

export interface CalendarTask {
  id: string;
  title: string;
  startDate: string | null;
  dueDate: string | null;
  projectColor?: string | null;
  completed: boolean;
  description?: string;
  sectionId?: string | null;
  assignee?: CalendarTaskAssignee | null;
}

export interface CalendarViewResponse {
  project: {
    id: string;
    name: string;
    color?: string | null;
  };
  tasks: CalendarTask[];
}

@Injectable({
  providedIn: 'root'
})
export class CalendarViewService {
  constructor(private httpService: HttpService) {}

  getCalendarData(projectId: string): Observable<CalendarViewResponse> {
    const endpoint = ENDPOINTS.getCalendarViewData.replace(':projectId', projectId);
    return this.httpService.get(endpoint).pipe(
      map((response: any) => response.data || response),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  getMyTasksCalendarData(): Observable<CalendarViewResponse> {
    const endpoint = ENDPOINTS.getMyTasksCalendarView;
    return this.httpService.get(endpoint).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  updateTaskDates(taskId: string, payload: { startDate?: string | null; dueDate?: string | null }): Observable<CalendarTask> {
    const endpoint = ENDPOINTS.updateCalendarTask.replace(':taskId', taskId);
    return this.httpService.patch(endpoint, payload).pipe(
      map((response: any) => {
        const task = response.data?.task || response;
        return task as CalendarTask;
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  private handleError(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Unexpected error while communicating with calendar API.';
  }
}


