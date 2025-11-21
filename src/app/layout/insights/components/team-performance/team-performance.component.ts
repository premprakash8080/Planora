import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { InsightsService, TeamMetric, TeamMemberPerformance } from '../../service/insights.service';

/**
 * Team Performance Component
 * 
 * Displays team performance metrics including:
 * - Team member performance
 * - Task completion rates by team member
 * - Team productivity stats
 * - Collaboration metrics
 */

@Component({
  selector: 'app-team-performance',
  templateUrl: './team-performance.component.html',
  styleUrls: ['./team-performance.component.scss']
})
export class TeamPerformanceComponent implements OnInit, AfterViewInit {

  Math = Math;

  /**
   * Team metrics from API
   */
  teamMetrics: TeamMetric[] = [];

  /**
   * Team members from API
   */
  teamMembers: TeamMemberPerformance[] = [];

  /**
   * Loading state
   */
  loading = false;

  /**
   * Displayed columns for team members table
   */
  displayedColumns: string[] = ['member', 'role', 'tasksAssigned', 'tasksCompleted', 'completionRate', 'productivityScore', 'status'];

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
   * Load team performance data from API
   */
  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Load metrics and members in parallel
    this.insightsService.getTeamMetrics().subscribe({
      next: (metrics) => {
        this.ngZone.run(() => {
          this.teamMetrics = metrics;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading team metrics:', error);
        this.ngZone.run(() => {
          this.teamMetrics = [];
          this.cdr.detectChanges();
        });
      }
    });

    this.insightsService.getTeamMemberPerformance().subscribe({
      next: (members) => {
        this.ngZone.run(() => {
          this.teamMembers = members;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading team member performance:', error);
        this.ngZone.run(() => {
          this.teamMembers = [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Get status badge color class
   */
  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'status-active',
      'away': 'status-away',
      'offline': 'status-offline'
    };
    return statusMap[status] || 'status-offline';
  }

  /**
   * Get productivity score color
   */
  getProductivityColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 75) return '#2196f3';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }
}

