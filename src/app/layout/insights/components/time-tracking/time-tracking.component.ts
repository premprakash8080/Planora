import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { InsightsService, TimeEntry, ProjectTimeSummary, DailyTimeBreakdown } from '../../service/insights.service';

/**
 * Time Tracking Component
 * 
 * Displays time tracking metrics including:
 * - Time logged by project
 * - Daily/weekly time breakdown
 * - Time tracking trends
 * - Billable vs non-billable hours
 */

@Component({
  selector: 'app-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss']
})
export class TimeTrackingComponent implements OnInit, AfterViewInit {

  Math = Math;

  /**
   * Time entries from API
   */
  timeEntries: TimeEntry[] = [];

  /**
   * Project time summary from API
   */
  projectTimeSummary: ProjectTimeSummary[] = [];

  /**
   * Daily time breakdown from API
   */
  dailyTimeBreakdown: DailyTimeBreakdown[] = [];

  /**
   * Loading state
   */
  loading = false;

  /**
   * Displayed columns for time entries table
   */
  displayedColumns: string[] = ['date', 'project', 'task', 'time', 'billable', 'actions'];

  /**
   * Total hours this week
   */
  get totalHoursThisWeek(): number {
    return this.dailyTimeBreakdown.reduce((sum, day) => sum + day.hours, 0);
  }

  /**
   * Total billable hours this week
   */
  get totalBillableHours(): number {
    return this.dailyTimeBreakdown.reduce((sum, day) => sum + day.billableHours, 0);
  }

  /**
   * Total non-billable hours this week
   */
  get totalNonBillableHours(): number {
    return this.dailyTimeBreakdown.reduce((sum, day) => sum + day.nonBillableHours, 0);
  }

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
   * Load time tracking data from API
   */
  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Load all data in parallel
    this.insightsService.getTimeTrackingSummary('week').subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.projectTimeSummary = data.summary;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading time tracking summary:', error);
        this.ngZone.run(() => {
          this.projectTimeSummary = [];
          this.cdr.detectChanges();
        });
      }
    });

    this.insightsService.getDailyTimeBreakdown().subscribe({
      next: (breakdown) => {
        this.ngZone.run(() => {
          this.dailyTimeBreakdown = breakdown;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading daily time breakdown:', error);
        this.ngZone.run(() => {
          this.dailyTimeBreakdown = [];
          this.cdr.detectChanges();
        });
      }
    });

    this.insightsService.getTimeEntries(50).subscribe({
      next: (entries) => {
        this.ngZone.run(() => {
          this.timeEntries = entries;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading time entries:', error);
        this.ngZone.run(() => {
          this.timeEntries = [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Format time (hours and minutes)
   */
  formatTime(hours: number, minutes: number): string {
    const totalMinutes = hours * 60 + minutes;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  /**
   * Get billable badge color
   */
  getBillableColor(billable: boolean): string {
    return billable ? 'billable-yes' : 'billable-no';
  }

  /**
   * Get maximum hours for chart scaling
   */
  getMaxHours(): number {
    return Math.max(...this.dailyTimeBreakdown.map(d => d.hours)) * 1.2;
  }
}

