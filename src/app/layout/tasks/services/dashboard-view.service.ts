import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';

export interface DashboardStatCard {
  id: string;
  title: string;
  value: number;
  helperText: string;
}

export interface IncompleteSectionDatum {
  label: string;
  value: number;
}

export interface CompletionStatusDatum {
  label: string;
  value: number;
  color: string;
}

export interface UpcomingAssigneeDatum {
  id: string;
  name: string;
  initials: string;
  color: string;
  count: number;
}

export interface CompletionTrendPoint {
  date: string;
  label: string;
  total: number;
  completed: number;
}

export interface DashboardCharts {
  incompleteBySection: {
    title: string;
    filtersLabel: string;
    seeAll?: boolean;
    data: IncompleteSectionDatum[];
  };
  completionStatus: {
    title: string;
    filtersLabel: string;
    seeAll?: boolean;
    total: number;
    data: CompletionStatusDatum[];
  };
  upcomingByAssignee: {
    title: string;
    filtersLabel: string;
    data: UpcomingAssigneeDatum[];
  };
  completionTrend: {
    title: string;
    filtersLabel: string;
    seeAll?: boolean;
    data: {
      start: string;
      end: string;
      data: CompletionTrendPoint[];
    };
  };
}

export interface DashboardDataResponse {
  project: {
    id: string;
    name: string;
    color?: string | null;
  };
  stats: {
    cards: DashboardStatCard[];
  };
  charts: DashboardCharts;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardViewService {
  constructor(private httpService: HttpService) {}

  getProjectDashboardData(projectId: string): Observable<DashboardDataResponse> {
    const endpoint = ENDPOINTS.getProjectDashboardData.replace(':projectId', projectId);
    return this.httpService.get(endpoint).pipe(
      map((response: any) => response.data || response),
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
    return 'Failed to load dashboard data.';
  }
}


