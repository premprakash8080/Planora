import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';

// Productivity Overview Interfaces
export interface ProductivityMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

export interface ProductivityTrend {
  day: string;
  tasksCompleted: number;
  hoursWorked: number;
  efficiency: number;
}

// Report Interfaces
export interface ReportMetric {
  id: string;
  metric: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

export interface TaskStatusAnalytic {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ProjectPerformance {
  projectName: string;
  totalTasks: number;
  completed: number;
  completionRate: number;
  status: string;
}

// Team Performance Interfaces
export interface TeamMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
}

export interface TeamMemberPerformance {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor?: string;
  avatarUrl?: string;
  role: string;
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
  productivityScore: number;
  status: 'active' | 'away' | 'offline';
}

// Time Tracking Interfaces
export interface ProjectTimeSummary {
  projectName: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  tasksCount: number;
  color: string;
}

export interface DailyTimeBreakdown {
  day: string;
  hours: number;
  billableHours: number;
  nonBillableHours: number;
}

export interface TimeEntry {
  id: string;
  projectName: string;
  taskName: string;
  date: string;
  hours: number;
  minutes: number;
  billable: boolean;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InsightsService {
  constructor(private httpService: HttpService) {}

  /**
   * Get productivity metrics
   */
  getProductivityMetrics(period: 'week' | 'month' | 'quarter' = 'week'): Observable<ProductivityMetric[]> {
    const params = { period };
    return this.httpService.get(ENDPOINTS.getProductivityMetrics, params).pipe(
      map((response: any) => {
        if (response.success && response.data?.metrics) {
          return response.data.metrics;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get productivity trends
   */
  getProductivityTrends(period: 'week' | 'month' | 'quarter' = 'week'): Observable<ProductivityTrend[]> {
    const params = { period };
    return this.httpService.get(ENDPOINTS.getProductivityTrends, params).pipe(
      map((response: any) => {
        if (response.success && response.data?.trends) {
          return response.data.trends;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get report metrics
   */
  getReportMetrics(): Observable<ReportMetric[]> {
    return this.httpService.get(ENDPOINTS.getReportMetrics).pipe(
      map((response: any) => {
        if (response.success && response.data?.metrics) {
          return response.data.metrics;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get task status analytics
   */
  getTaskStatusAnalytics(): Observable<TaskStatusAnalytic[]> {
    return this.httpService.get(ENDPOINTS.getTaskStatusAnalytics).pipe(
      map((response: any) => {
        if (response.success && response.data?.analytics) {
          return response.data.analytics;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get project performance
   */
  getProjectPerformance(): Observable<ProjectPerformance[]> {
    return this.httpService.get(ENDPOINTS.getProjectPerformance).pipe(
      map((response: any) => {
        if (response.success && response.data?.performance) {
          return response.data.performance;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get team metrics
   */
  getTeamMetrics(): Observable<TeamMetric[]> {
    return this.httpService.get(ENDPOINTS.getTeamMetrics).pipe(
      map((response: any) => {
        if (response.success && response.data?.metrics) {
          return response.data.metrics;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get team member performance
   */
  getTeamMemberPerformance(): Observable<TeamMemberPerformance[]> {
    return this.httpService.get(ENDPOINTS.getTeamMemberPerformance).pipe(
      map((response: any) => {
        if (response.success && response.data?.members) {
          return response.data.members;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get time tracking summary
   */
  getTimeTrackingSummary(period: 'week' | 'month' = 'week'): Observable<{ summary: ProjectTimeSummary[]; totals: { totalHours: number; billableHours: number; nonBillableHours: number } }> {
    const params = { period };
    return this.httpService.get(ENDPOINTS.getTimeTrackingSummary, params).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return {
            summary: response.data.summary || [],
            totals: response.data.totals || { totalHours: 0, billableHours: 0, nonBillableHours: 0 }
          };
        }
        return { summary: [], totals: { totalHours: 0, billableHours: 0, nonBillableHours: 0 } };
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get daily time breakdown
   */
  getDailyTimeBreakdown(): Observable<DailyTimeBreakdown[]> {
    return this.httpService.get(ENDPOINTS.getDailyTimeBreakdown).pipe(
      map((response: any) => {
        if (response.success && response.data?.breakdown) {
          return response.data.breakdown;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get time entries
   */
  getTimeEntries(limit: number = 50): Observable<TimeEntry[]> {
    const params = { limit: limit.toString() };
    return this.httpService.get(ENDPOINTS.getTimeEntries, params).pipe(
      map((response: any) => {
        if (response.success && response.data?.entries) {
          return response.data.entries;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
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

