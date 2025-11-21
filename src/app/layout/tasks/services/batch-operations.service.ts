import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';
import { Task } from '../task.model';

export interface BatchTaskUpdate {
  id: string;
  [key: string]: any; // Any task property to update
}

export interface BatchSectionUpdate {
  id: string;
  [key: string]: any; // Any section property to update
}

@Injectable({
  providedIn: 'root'
})
export class BatchOperationsService {
  constructor(private httpService: HttpService) {}

  /**
   * Batch update tasks (useful for drag-and-drop reordering)
   */
  batchUpdateTasks(updates: BatchTaskUpdate[]): Observable<{ results: Array<{ id: string; success: boolean; error?: string }> }> {
    return this.httpService.post(ENDPOINTS.batchUpdateTasks, { updates }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to batch update tasks');
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Batch update sections (useful for reordering)
   */
  batchUpdateSections(updates: BatchSectionUpdate[]): Observable<{ results: Array<{ id: string; success: boolean; error?: string }> }> {
    return this.httpService.post(ENDPOINTS.batchUpdateSections, { updates }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to batch update sections');
      }),
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

