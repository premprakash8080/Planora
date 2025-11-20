import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  NgZone,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardViewService, DashboardStatCard, DashboardCharts, CompletionTrendPoint } from '../../../services/dashboard-view.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-tasks-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardViewComponent implements OnInit, OnDestroy {
  projectTitle = 'Dashboard';
  statCards: DashboardStatCard[] = [];
  charts: DashboardCharts | null = null;
  loading = false;
  error: string | null = null;

  donutStyle = 'conic-gradient(#ede9fe 0 100%)';
  completionTotal = 0;
  maxIncompleteValue = 0;
  maxUpcomingValue = 0;
  completionTrendGraph: { width: number; height: number; areaPath: string; linePath: string; viewBox: string } = {
    width: 320,
    height: 140,
    areaPath: '',
    linePath: '',
    viewBox: '0 0 320 140',
  };
  completionTrendRangeStart = '';
  completionTrendRangeEnd = '';

  private projectId: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dashboardViewService: DashboardViewService,
    private readonly snackBar: SnackBarService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.projectId = params['projectId'] || null;
      if (this.projectId) {
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    if (!this.projectId) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.dashboardViewService.getProjectDashboardData(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.ngZone.run(() => {
            this.projectTitle = data.project?.name || 'Dashboard';
            this.statCards = data.stats?.cards || [];
            this.charts = data.charts || null;
            this.prepareVisuals();
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Failed to load dashboard data', err);
          this.ngZone.run(() => {
            this.error = typeof err === 'string' ? err : 'Failed to load dashboard data.';
            this.loading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  onCardClick(card: DashboardStatCard): void {
    this.snackBar.showSuccess(`Applied filters for ${card.title}`);
  }

  onSeeAll(widget: string): void {
    this.snackBar.showSuccess(`Opening ${widget} insights`);
  }

  getSectionBarWidth(value: number): number {
    if (!this.maxIncompleteValue) {
      return 0;
    }
    return Math.max(6, (value / this.maxIncompleteValue) * 100);
  }

  getDots(count: number): number[] {
    const visible = Math.min(count, 8);
    return Array.from({ length: visible });
  }

  getRemainingDots(count: number): number {
    return count > 8 ? count - 8 : 0;
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private prepareVisuals(): void {
    if (!this.charts) {
      this.maxIncompleteValue = 0;
      this.maxUpcomingValue = 0;
      this.donutStyle = 'conic-gradient(#ede9fe 0 100%)';
      this.completionTotal = 0;
      this.completionTrendGraph = { width: 320, height: 140, areaPath: '', linePath: '', viewBox: '0 0 320 140' };
      this.completionTrendRangeStart = '';
      this.completionTrendRangeEnd = '';
      return;
    }

    const incompleteData = this.charts.incompleteBySection?.data || [];
    this.maxIncompleteValue = incompleteData.reduce((max, item) => Math.max(max, item.value), 0);

    const upcomingData = this.charts.upcomingByAssignee?.data || [];
    this.maxUpcomingValue = upcomingData.reduce((max, item) => Math.max(max, item.count), 0);

    const completionData = this.charts.completionStatus;
    this.completionTotal = completionData?.total || 0;
    const completedSegment = completionData?.data?.find(segment => segment.label.toLowerCase() === 'completed');
    const completedValue = completedSegment?.value || 0;
    const completedPercent = this.completionTotal ? (completedValue / this.completionTotal) * 100 : 0;
    this.donutStyle = this.completionTotal
      ? `conic-gradient(#8b5cf6 0 ${completedPercent}%, #e0d4fd ${completedPercent}% 100%)`
      : 'conic-gradient(#ede9fe 0 100%)';

    const trend = this.charts.completionTrend?.data;
    if (trend && trend.data.length) {
      this.completionTrendRangeStart = trend.start;
      this.completionTrendRangeEnd = trend.end;
      this.completionTrendGraph = this.buildCompletionTrendGraph(trend.data);
    } else {
      this.completionTrendGraph = { width: 320, height: 140, areaPath: '', linePath: '', viewBox: '0 0 320 140' };
      this.completionTrendRangeStart = '';
      this.completionTrendRangeEnd = '';
    }
  }

  private buildCompletionTrendGraph(points: CompletionTrendPoint[]): { width: number; height: number; areaPath: string; linePath: string; viewBox: string } {
    if (!points.length) {
      return { width: 320, height: 140, areaPath: '', linePath: '', viewBox: '0 0 320 140' };
    }

    const height = 140;
    const width = Math.max(320, points.length * 48);
    const maxValue = points.reduce((max, point) => Math.max(max, point.total, point.completed), 1);

    const areaPath = this.buildAreaPath(points, width, height, maxValue, 'completed');
    const linePath = this.buildLinePath(points, width, height, maxValue, 'total');
    return {
      width,
      height,
      areaPath,
      linePath,
      viewBox: `0 0 ${width} ${height}`,
    };
  }

  private buildAreaPath(points: CompletionTrendPoint[], width: number, height: number, maxValue: number, key: 'completed' | 'total'): string {
    const step = points.length > 1 ? width / (points.length - 1) : width;
    let path = '';
    points.forEach((point, index) => {
      const x = index * step;
      const value = point[key];
      const percent = maxValue ? value / maxValue : 0;
      const y = height - percent * (height - 16);
      path += `${index === 0 ? 'M' : 'L'}${x},${y}`;
    });
    path += `L${(points.length - 1) * step},${height} L0,${height} Z`;
    return path;
  }

  private buildLinePath(points: CompletionTrendPoint[], width: number, height: number, maxValue: number, key: 'completed' | 'total'): string {
    const step = points.length > 1 ? width / (points.length - 1) : width;
    let path = '';
    points.forEach((point, index) => {
      const x = index * step;
      const value = point[key];
      const percent = maxValue ? value / maxValue : 0;
      const y = height - percent * (height - 16);
      path += `${index === 0 ? 'M' : 'L'}${x},${y}`;
    });
    return path;
  }
}

