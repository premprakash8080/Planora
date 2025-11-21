import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';
import { PriorityLabel } from '../task.model';

@Injectable({
  providedIn: 'root'
})
export class PriorityLabelService {
  constructor(private httpService: HttpService) {}

  /**
   * Get all priority labels (optionally filtered by project)
   */
  getPriorityLabels(projectId?: number | null): Observable<PriorityLabel[]> {
    return this.httpService.post(ENDPOINTS.getPriorityLabels, {
      project_id: projectId || null
    }).pipe(
      map((response: any) => {
        if (response.success && response.data?.priorityLabels) {
          return response.data.priorityLabels;
        }
        return response.data || response || [];
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get priority label by ID
   */
  getPriorityLabelById(labelId: number): Observable<PriorityLabel> {
    return this.httpService.post(ENDPOINTS.getPriorityLabelById, {
      id: labelId
    }).pipe(
      map((response: any) => {
        if (response.success && response.data?.priorityLabel) {
          return response.data.priorityLabel;
        }
        return response.data || response;
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Create a new priority label
   */
  createPriorityLabel(label: Partial<PriorityLabel>): Observable<PriorityLabel> {
    return this.httpService.post(ENDPOINTS.createPriorityLabel, label).pipe(
      map((response: any) => {
        if (response.success && response.data?.priorityLabel) {
          return response.data.priorityLabel;
        }
        return response.data || response;
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update priority label
   */
  updatePriorityLabel(labelId: number, updates: Partial<PriorityLabel>): Observable<PriorityLabel> {
    return this.httpService.put(ENDPOINTS.updatePriorityLabel, {
      id: labelId,
      ...updates
    }).pipe(
      map((response: any) => {
        if (response.success && response.data?.priorityLabel) {
          return response.data.priorityLabel;
        }
        return response.data || response;
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Delete priority label (soft delete)
   */
  deletePriorityLabel(labelId: number): Observable<void> {
    return this.httpService.delete(ENDPOINTS.deletePriorityLabel, {
      id: labelId
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

