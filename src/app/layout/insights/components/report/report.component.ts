import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { InsightsService, ReportMetric, TaskStatusAnalytic, ProjectPerformance } from '../../service/insights.service';

/**
 * Report Component
 * 
 * This component displays analytics reports including:
 * - Key Metrics: Total Tasks, Completed Tasks, In Progress, Overdue Tasks
 * - Task Status Distribution: Breakdown of tasks by status
 * - Project Performance: Project performance table with completion rates
 */

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, AfterViewInit {

  // Expose Math object to template
  Math = Math;

  /**
   * Report metrics from API
   */
  reportMetrics: ReportMetric[] = [];

  /**
   * Task status analytics from API
   */
  taskStatusAnalytics: TaskStatusAnalytic[] = [];

  /**
   * Project performance from API
   */
  projectPerformance: ProjectPerformance[] = [];

  /**
   * Loading state
   */
  loading = false;

  /**
   * Displayed columns for the project performance table
   */
  displayedColumns: string[] = ['projectName', 'totalTasks', 'completed', 'completionRate', 'status'];

  constructor(
    private insightsService: InsightsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  /**
   * Load report data from API
   */
  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Load all data in parallel
    this.insightsService.getReportMetrics().subscribe({
      next: (metrics) => {
        this.ngZone.run(() => {
          this.reportMetrics = metrics;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading report metrics:', error);
        this.ngZone.run(() => {
          this.reportMetrics = [];
          this.cdr.detectChanges();
        });
      }
    });

    this.insightsService.getTaskStatusAnalytics().subscribe({
      next: (analytics) => {
        this.ngZone.run(() => {
          this.taskStatusAnalytics = analytics;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading task status analytics:', error);
        this.ngZone.run(() => {
          this.taskStatusAnalytics = [];
          this.cdr.detectChanges();
        });
      }
    });

    this.insightsService.getProjectPerformance().subscribe({
      next: (performance) => {
        this.ngZone.run(() => {
          this.projectPerformance = performance;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading project performance:', error);
        this.ngZone.run(() => {
          this.projectPerformance = [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Get the change indicator icon based on change type
   */
  getChangeIcon(changeType: string): string {
    return changeType === 'increase' ? 'trending_up' : 'trending_down';
  }

  /**
   * Get the status badge color class
   */
  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'On Track': 'status-success',
      'At Risk': 'status-warning',
      'Delayed': 'status-error'
    };
    return statusMap[status] || 'status-default';
  }
}
