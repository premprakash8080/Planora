import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { map, filter, distinctUntilChanged, takeUntil, take } from 'rxjs/operators';
import { TimelineViewService, TimelineData, TimelineGroup, TimelineTask, TimelineDay } from '../../../services/timeline-view.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-tasks-timeline-view',
  templateUrl: './timeline-view.component.html',
  styleUrls: ['./timeline-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineViewComponent implements OnInit, OnDestroy {
  projectTitle = 'Timeline View';
  loading = false;
  error: string | null = null;

  timelineDays: TimelineDay[] = [];
  groups: TimelineGroup[] = [];
  timelineStartDate: string | null = null;
  timelineEndDate: string | null = null;
  monthBlocks: Array<{ label: string; span: number }> = [];

  dayWidthPx = 64;
  zoomLevel: 'day' | 'week' | 'month' = 'day';
  todayOffsetPx: number | null = null;
  groupColumnWidth = 260;

  @ViewChild('timelineScroll', { static: false }) timelineScroll?: ElementRef<HTMLDivElement>;

  private currentProjectId: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly timelineService: TimelineViewService,
    private readonly snackBarService: SnackBarService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const projectRoute = this.findProjectRoute();
    projectRoute.paramMap
      .pipe(
        map(params => params.get('projectId')),
        filter((projectId): projectId is string => Boolean(projectId)),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(projectId => {
        this.currentProjectId = projectId;
        this.loadTimelineData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get timelineWidthPx(): number {
    return this.timelineDays.length * this.dayWidthPx;
  }

  onTaskDragEnded(event: CdkDragEnd, task: TimelineTask, group: TimelineGroup): void {
    event.source.reset();

    if (this.loading || !this.timelineStartDate) {
      return;
    }

    const deltaDays = Math.round(event.distance.x / this.dayWidthPx);
    if (deltaDays === 0) {
      return;
    }

    const originalStart = task.startDate;
    const originalDue = task.dueDate;

    const newStart = this.shiftDate(task.startDate || this.timelineStartDate, deltaDays);
    const newDue = this.shiftDate(task.dueDate || task.startDate || this.timelineStartDate, deltaDays);

    task.startDate = newStart;
    task.dueDate = newDue;
    this.cdr.markForCheck();

    this.timelineService
      .updateTask(task.id, {
        start_date: newStart,
        due_date: newDue,
        target_section_id: group.id,
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.refreshTimeline();
        },
        error: (error) => {
          this.ngZone.run(() => {
            task.startDate = originalStart;
            task.dueDate = originalDue;
            const message = typeof error === 'string' ? error : 'Failed to reschedule task.';
            this.snackBarService.showError(message);
            this.cdr.detectChanges();
          });
        },
      });
  }

  reload(): void {
    this.loadTimelineData();
  }

  trackByGroupId = (_: number, group: TimelineGroup) => group.id;
  trackByMonth = (_: number, block: { label: string }) => block.label;

  toggleGroupCollapse(group: TimelineGroup): void {
    group.collapsed = !group.collapsed;
    this.cdr.markForCheck();
  }

  setZoom(level: 'day' | 'week' | 'month'): void {
    if (this.zoomLevel === level) {
      return;
    }
    this.zoomLevel = level;
    this.dayWidthPx = level === 'day' ? 64 : level === 'week' ? 40 : 24;
    this.todayOffsetPx = this.computeTodayOffsetPx();
    this.monthBlocks = this.buildMonthBlocks(this.timelineDays);
    this.cdr.markForCheck();
  }

  scrollToToday(): void {
    if (!this.timelineScroll || this.todayOffsetPx === null) {
      return;
    }
    const scrollLeft = Math.max(this.todayOffsetPx - 200, 0);
    this.timelineScroll.nativeElement.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  }

  isWeekend(day: TimelineDay): boolean {
    const date = new Date(day.date);
    const dayIndex = date.getDay();
    return dayIndex === 0 || dayIndex === 6;
  }

  private findProjectRoute(): ActivatedRoute {
    let projectRoute: ActivatedRoute | null = this.route;
    while (projectRoute) {
      if (projectRoute.snapshot.paramMap.has('projectId')) {
        return projectRoute;
      }
      projectRoute = projectRoute.parent;
    }
    return this.route;
  }

  private loadTimelineData(): void {
    if (!this.currentProjectId) {
      this.error = 'Project ID is missing.';
      this.timelineDays = [];
      this.groups = [];
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.timelineService
      .getTimelineViewData(this.currentProjectId)
      .pipe(take(1))
      .subscribe({
        next: (data: TimelineData) => {
          this.ngZone.run(() => {
            this.projectTitle = data.project?.name || 'Timeline View';
            this.timelineDays = data.timeline.days || [];
            this.timelineStartDate = data.timeline.startDate;
            this.timelineEndDate = data.timeline.endDate;
            this.groups = (data.groups || []).map(group => ({
              ...group,
              collapsed: group.collapsed ?? false,
              tasks: group.tasks || [],
            }));
            this.monthBlocks = this.buildMonthBlocks(this.timelineDays);
            this.todayOffsetPx = this.computeTodayOffsetPx();
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            this.loading = false;
            this.timelineDays = [];
            this.groups = [];
            this.error = typeof error === 'string'
              ? error
              : 'Failed to load timeline data.';
            this.cdr.detectChanges();
          });
        },
      });
  }

  private refreshTimeline(): void {
    // Reload timeline to ensure range and ordering stay consistent
    this.loadTimelineData();
  }

  private shiftDate(dateString: string, deltaDays: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + deltaDays);
    return date.toISOString().slice(0, 10);
  }

  private dateDiffInDays(from: string, to: string | Date): number {
    const fromDate = new Date(from);
    const toDate = typeof to === 'string' ? new Date(to) : to;
    const diffMs = toDate.getTime() - fromDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private computeTodayOffsetPx(): number | null {
    if (!this.timelineStartDate || !this.timelineEndDate) {
      return null;
    }
    const today = new Date();
    const start = new Date(this.timelineStartDate);
    const end = new Date(this.timelineEndDate);
    if (today < start || today > end) {
      return null;
    }
    const diff = this.dateDiffInDays(this.timelineStartDate, today);
    return diff * this.dayWidthPx;
  }

  private buildMonthBlocks(days: TimelineDay[]): Array<{ label: string; span: number }> {
    if (!days.length) {
      return [];
    }
    const blocks: Array<{ label: string; span: number }> = [];
    let currentLabel: string | null = null;
    let span = 0;

    days.forEach(day => {
      const date = new Date(day.date);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (label === currentLabel) {
        span += 1;
      } else {
        if (currentLabel) {
          blocks.push({ label: currentLabel, span });
        }
        currentLabel = label;
        span = 1;
      }
    });

    if (currentLabel) {
      blocks.push({ label: currentLabel, span });
    }
    return blocks;
  }
}

