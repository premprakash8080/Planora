import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';

export interface TimelineDay {
  date: string;
  label: string;
  weekday: string;
}

export interface TimelineTask {
  id: string;
  sectionId: string | null;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  startDate: string | null;
  startDateDisplay?: string | null;
  dueDate: string | null;
  dueDateDisplay?: string | null;
  dueDateRelative?: string | null;
  assigneeName?: string | null;
  assigneeInitials?: string | null;
  assigneeColor?: string | null;
  userAvatar?: string | null;
  priorityLabel?: {
    id?: string | null;
    name: string;
    color?: string | null;
  } | null;
  status?: {
    id?: string | null;
    name: string;
    color?: string | null;
  } | null;
}

export interface TimelineGroup {
  id: string;
  title: string;
  order: number;
  taskCount: number;
  tasks: TimelineTask[];
  collapsed?: boolean;
}

export interface TimelineData {
  project?: {
    id: string;
    name: string;
    color?: string | null;
  };
  timeline: {
    startDate: string;
    endDate: string;
    dayCount: number;
    days: TimelineDay[];
  };
  groups: TimelineGroup[];
}

export interface UpdateTimelineTaskPayload {
  start_date?: string | null;
  due_date?: string | null;
  target_section_id?: number | string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TimelineViewService {
  constructor(private httpService: HttpService) {}

  getTimelineViewData(projectId: string): Observable<TimelineData> {
    const endpoint = ENDPOINTS.getTimelineViewData.replace(':projectId', projectId);
    return this.httpService.get(endpoint).pipe(
      map((response: { data: TimelineData }) => response.data),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  updateTask(taskId: string | number, payload: UpdateTimelineTaskPayload): Observable<TimelineTask> {
    const endpoint = ENDPOINTS.updateTimelineViewTask.replace(':taskId', taskId.toString());
    return this.httpService.patch(endpoint, payload).pipe(
      map((response: { data: { task: TimelineTask } }) => response.data.task),
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
    return 'Unexpected error while communicating with the timeline API.';
  }
}


