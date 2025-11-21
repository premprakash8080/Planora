import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';

export interface BoardViewTask {
  id: string;
  sectionId: string | null;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  startDate?: string | null;
  startDateDisplay?: string | null;
  dueDate?: string | null;
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
  attachmentCount?: number | null;
}

export interface BoardViewColumn {
  id: string;
  title: string;
  order: number;
  taskCount: number;
  tasks: BoardViewTask[];
}

export interface BoardViewResponse {
  project?: {
    id: string;
    name: string;
    color?: string | null;
  };
  columns: BoardViewColumn[];
}

export interface UpdateBoardViewTaskPayload {
  target_section_id: number | string;
  target_position?: number;
}

export interface CreateBoardViewSectionPayload {
  name: string;
}

export interface UpdateBoardViewSectionPayload {
  name?: string;
  order?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BoardViewService {
  constructor(private httpService: HttpService) {}

  getBoardViewData(projectId: string): Observable<BoardViewResponse> {
    const endpoint = ENDPOINTS.getBoardViewData.replace(':projectId', projectId);
    return this.httpService.get(endpoint).pipe(
      map((response: { data: BoardViewResponse }) => response.data),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  updateTaskPosition(taskId: string | number, payload: UpdateBoardViewTaskPayload): Observable<BoardViewTask> {
    const endpoint = ENDPOINTS.updateBoardViewTask.replace(':taskId', taskId.toString());
    return this.httpService.patch(endpoint, payload).pipe(
      map((response: { data: { task: BoardViewTask } }) => response.data.task),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  createSection(projectId: string | number, payload: CreateBoardViewSectionPayload): Observable<BoardViewColumn> {
    const endpoint = ENDPOINTS.createBoardViewSection.replace(':projectId', projectId.toString());
    return this.httpService.post(endpoint, payload).pipe(
      map((response: { data: { section: BoardViewColumn } }) => response.data.section),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  updateSection(sectionId: string | number, payload: UpdateBoardViewSectionPayload): Observable<BoardViewColumn> {
    const endpoint = ENDPOINTS.updateBoardViewSection.replace(':sectionId', sectionId.toString());
    return this.httpService.patch(endpoint, payload).pipe(
      map((response: { data: { section: BoardViewColumn } }) => response.data.section),
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
    return 'Unexpected error occurred while communicating with board view API.';
  }
}


