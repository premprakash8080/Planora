import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { InsightsService, ProductivityMetric, ProductivityTrend } from '../../service/insights.service';

/**
 * Productivity Overview Component
 * 
 * Displays productivity metrics and insights including:
 * - Productivity trends
 * - Task completion rates
 * - Work efficiency metrics
 * - Daily/weekly productivity stats
 */

@Component({
  selector: 'app-productivity-overview',
  templateUrl: './productivity-overview.component.html',
  styleUrls: ['./productivity-overview.component.scss']
})
export class ProductivityOverviewComponent implements OnInit, AfterViewInit {

  Math = Math;

  /**
   * Productivity metrics from API
   */
  productivityMetrics: ProductivityMetric[] = [];

  /**
   * Productivity trends from API
   */
  productivityTrends: ProductivityTrend[] = [];

  /**
   * Selected time period for filtering
   */
  selectedPeriod: 'week' | 'month' | 'quarter' = 'week';

  /**
   * Loading state
   */
  loading = false;

  /**
   * Pre-calculated max values for chart scaling
   */
  maxTasksCompleted: number = 0;
  maxHoursWorked: number = 0;
  maxEfficiency: number = 0;

  /**
   * Pre-calculated summary values
   */
  totalTasksThisWeek: number = 0;
  totalHoursWorked: number = 0;
  averageEfficiency: number = 0;
  bestDay: string = '';

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
   * Load productivity data from API
   */
  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Load metrics and trends in parallel
    this.insightsService.getProductivityMetrics(this.selectedPeriod).subscribe({
      next: (metrics) => {
        this.ngZone.run(() => {
          this.productivityMetrics = metrics;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading productivity metrics:', error);
        this.ngZone.run(() => {
          this.productivityMetrics = [];
          this.cdr.detectChanges();
        });
      }
    });

    this.insightsService.getProductivityTrends(this.selectedPeriod).subscribe({
      next: (trends) => {
        this.ngZone.run(() => {
          this.productivityTrends = trends;
          this.calculateDerivedValues();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading productivity trends:', error);
        this.ngZone.run(() => {
          this.productivityTrends = [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Calculate derived values from trends
   */
  private calculateDerivedValues(): void {
    if (this.productivityTrends.length === 0) {
      this.maxTasksCompleted = 0;
      this.maxHoursWorked = 0;
      this.maxEfficiency = 0;
      this.totalTasksThisWeek = 0;
      this.totalHoursWorked = 0;
      this.averageEfficiency = 0;
      this.bestDay = '';
      return;
    }

    // Calculate max values for chart scaling
    this.maxTasksCompleted = Math.max(...this.productivityTrends.map(t => t.tasksCompleted)) * 1.2;
    this.maxHoursWorked = Math.max(...this.productivityTrends.map(t => t.hoursWorked)) * 1.2;
    this.maxEfficiency = Math.max(...this.productivityTrends.map(t => t.efficiency)) * 1.2;
    
    // Calculate summary values
    this.totalTasksThisWeek = this.productivityTrends.reduce((sum, t) => sum + t.tasksCompleted, 0);
    this.totalHoursWorked = this.productivityTrends.reduce((sum, t) => sum + t.hoursWorked, 0);
    this.averageEfficiency = this.productivityTrends.reduce((sum, t) => sum + t.efficiency, 0) / this.productivityTrends.length;
    this.bestDay = this.productivityTrends.reduce((max, t) => t.tasksCompleted > max.tasksCompleted ? t : max, this.productivityTrends[0]).day;
  }

  /**
   * Handle period change
   */
  onPeriodChange(): void {
    this.loadData();
  }

  /**
   * Get the change indicator icon based on change type
   */
  getChangeIcon(changeType: string): string {
    return changeType === 'increase' ? 'trending_up' : 'trending_down';
  }

  /**
   * Get percentage height for tasks completed chart
   */
  getTasksCompletedHeight(tasksCompleted: number): number {
    return (tasksCompleted / this.maxTasksCompleted) * 100;
  }

  /**
   * Get percentage height for hours worked chart
   */
  getHoursWorkedHeight(hoursWorked: number): number {
    return (hoursWorked / this.maxHoursWorked) * 100;
  }

  /**
   * Get percentage height for efficiency chart
   */
  getEfficiencyHeight(efficiency: number): number {
    return (efficiency / this.maxEfficiency) * 100;
  }
}

