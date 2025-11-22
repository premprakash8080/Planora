import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CalendarViewService, CalendarTask } from '../../../services/calendar-view.service';
import { TaskApiService } from '../../../services/task-api.service';
import { TasksRouteHelperService } from '../../../services/tasks-route-helper.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

interface CalendarDay {
  date: Date;
  iso: string;
  label: string;
  weekday: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  tasks: CalendarTask[];
  visibleTasks: CalendarTask[];
  hiddenCount: number;
}

interface CalendarTaskSegment {
  task: CalendarTask;
  startColumn: number;
  span: number;
  row: number;
  weekIndex: number;
  isStart: boolean;
  isEnd: boolean;
}

interface CalendarWeek {
  index: number;
  days: CalendarDay[];
  segments: CalendarTaskSegment[];
  maxRows: number;
}

const MAX_DAY_VISIBLE = 3;
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-tasks-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  @ViewChildren('weekGrid') weekGridRefs!: QueryList<ElementRef<HTMLElement>>;

  projectTitle = 'Calendar View';
  projectId: string | null = null;
  isMyTasksMode = false;

  loading = false;
  error: string | null = null;

  weeks: CalendarWeek[] = [];
  tasks: CalendarTask[] = [];
  filteredTaskIds = new Set<string>();
  today = this.stripTime(new Date());
  viewDate = this.stripTime(new Date());

  monthLabel = '';
  syncEnabled = false;
  activeDayDetail: CalendarDay | null = null;
  addingDay: CalendarDay | null = null;
  newTaskTitle = '';

  viewMode: 'month' | 'week' | 'agenda' = 'month';

  searchControl = new FormControl('', { nonNullable: true });

  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly calendarService: CalendarViewService,
    private readonly taskApiService: TaskApiService,
    private readonly routeHelper: TasksRouteHelperService,
    private readonly snackBar: SnackBarService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Check if we're in my-tasks mode
    this.isMyTasksMode = this.routeHelper.isMyTasksMode(this.route);
    
    if (this.isMyTasksMode) {
      // My Tasks mode - load my tasks calendar data
      this.projectTitle = 'My Tasks';
      this.loadMyTasksCalendarData();
    } else {
      // Project mode - existing logic
      const projectRoute = this.routeHelper.findProjectRoute(this.route) ?? this.route;
      projectRoute.paramMap
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
          const projectId = params.get('projectId');
          if (projectId && projectId !== this.projectId) {
            this.projectId = projectId;
            this.loadCalendarData();
          }
        });
    }

    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applySearchFilter();
      });

    this.buildCalendarGrid();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get weekdayLabels(): string[] {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  get isEmptyState(): boolean {
    return !this.tasks.length;
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }

  goToToday(): void {
    this.viewDate = this.stripTime(new Date());
    this.buildCalendarGrid();
    this.cdr.markForCheck();
  }

  previousMonth(): void {
    const date = new Date(this.viewDate);
    date.setMonth(date.getMonth() - 1);
    this.viewDate = this.stripTime(date);
    this.buildCalendarGrid();
  }

  nextMonth(): void {
    const date = new Date(this.viewDate);
    date.setMonth(date.getMonth() + 1);
    this.viewDate = this.stripTime(date);
    this.buildCalendarGrid();
  }

  refresh(): void {
    if (this.isMyTasksMode) {
      this.loadMyTasksCalendarData();
    } else {
      this.loadCalendarData();
    }
  }

  toggleSync(value: boolean): void {
    this.syncEnabled = value;
    this.snackBar.showSuccess(value ? 'Calendar sync enabled' : 'Calendar sync disabled');
  }

  showDayDetails(day: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();
    this.activeDayDetail = day;
  }

  closeDayDetails(): void {
    this.activeDayDetail = null;
  }

  startQuickAdd(day: CalendarDay | undefined | null, event: MouseEvent): void {
    event.stopPropagation();
    if (!day) {
      return;
    }
    this.addingDay = day;
    this.newTaskTitle = '';
    this.closeDayDetails();
  }

  cancelQuickAdd(): void {
    this.addingDay = null;
    this.newTaskTitle = '';
  }

  saveQuickAdd(): void {
    if (!this.addingDay || !this.newTaskTitle.trim()) {
      return;
    }
    
    // In my-tasks mode, we can't create tasks without a projectId
    if (this.isMyTasksMode) {
      this.snackBar.showError('Please create tasks from a project view');
      this.cancelQuickAdd();
      return;
    }
    
    if (!this.projectId) {
      return;
    }
    
    const payload = {
      name: this.newTaskTitle.trim(),
      dueDate: this.addingDay.iso,
    };
    this.taskApiService.createTask(this.projectId, '', payload).subscribe({
      next: () => {
        this.snackBar.showSuccess('Task added to calendar');
        this.addingDay = null;
        this.newTaskTitle = '';
        this.loadCalendarData();
      },
      error: (error) => {
        this.snackBar.showError(error || 'Unable to add task');
      },
    });
  }

  onTaskClick(task: CalendarTask): void {
    if (!this.route || !this.router) {
      return;
    }
    this.router.navigate(['../list', task.id], { relativeTo: this.route });
  }

  onSegmentDragEnded(event: CdkDragEnd, segment: CalendarTaskSegment): void {
    event.source.reset();
    const weekRef = this.weekGridRefs?.toArray()[segment.weekIndex];
    if (!weekRef) {
      return;
    }
    const width = weekRef.nativeElement.clientWidth;
    const columnWidth = width / 7;
    if (!columnWidth) {
      return;
    }
    const deltaColumns = Math.round(event.distance.x / columnWidth);
    if (!deltaColumns) {
      return;
    }
    this.shiftTaskDates(segment.task, deltaColumns);
  }

  onResizeDragEnded(event: CdkDragEnd, segment: CalendarTaskSegment, edge: 'start' | 'end'): void {
    event.source.reset();
    const weekRef = this.weekGridRefs?.toArray()[segment.weekIndex];
    if (!weekRef) {
      return;
    }
    const width = weekRef.nativeElement.clientWidth;
    const columnWidth = width / 7;
    if (!columnWidth) {
      return;
    }
    const deltaColumns = Math.round(event.distance.x / columnWidth);
    if (!deltaColumns) {
      return;
    }

    const range = this.getTaskRange(segment.task);
    if (!range) {
      return;
    }

    if (edge === 'start') {
      const newStart = this.addDays(range.start, deltaColumns);
      if (newStart > range.end) {
        return;
      }
      this.updateTaskDates(segment.task, newStart, range.end);
    } else {
      const newEnd = this.addDays(range.end, deltaColumns);
      if (newEnd < range.start) {
        return;
      }
      this.updateTaskDates(segment.task, range.start, newEnd);
    }
  }

  trackByWeek = (_: number, week: CalendarWeek) => week.index;
  trackByDay = (_: number, day: CalendarDay) => day.iso;
  trackBySegment = (_: number, segment: CalendarTaskSegment) => `${segment.task.id}-${segment.weekIndex}-${segment.row}-${segment.startColumn}`;

  private loadMyTasksCalendarData(): void {
    this.loading = true;
    this.error = null;
    this.calendarService.getMyTasksCalendarData().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.projectTitle = response.project?.name || 'My Tasks';
          this.tasks = response.tasks || [];
          this.applySearchFilter();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.error = typeof error === 'string' ? error : 'Failed to load my tasks calendar';
          this.cdr.detectChanges();
        });
      },
    });
  }

  private loadCalendarData(): void {
    if (!this.projectId) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.calendarService.getCalendarData(this.projectId).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.projectTitle = response.project?.name || 'Calendar View';
          this.tasks = response.tasks || [];
          this.applySearchFilter();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.error = typeof error === 'string' ? error : 'Failed to load calendar';
          this.cdr.detectChanges();
        });
      },
    });
  }

  private applySearchFilter(): void {
    const term = this.searchControl.value.trim().toLowerCase();
    this.filteredTaskIds.clear();
    if (!term) {
      this.tasks.forEach(task => this.filteredTaskIds.add(task.id));
    } else {
      this.tasks.forEach(task => {
        const text = `${task.title || ''} ${task.assignee?.name || ''}`.toLowerCase();
        if (text.includes(term)) {
          this.filteredTaskIds.add(task.id);
        }
      });
    }
    this.buildCalendarGrid();
  }

  private buildCalendarGrid(): void {
    const start = this.getCalendarStart(this.viewDate);
    const weeks: CalendarWeek[] = [];
    const currentMonth = this.viewDate.getMonth();

    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      const days: CalendarDay[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayDate = this.addDays(start, weekIndex * 7 + dayIndex);
        const iso = this.toIso(dayDate);
        const tasksForDay = this.getTasksForDay(dayDate);
        days.push({
          date: dayDate,
          iso,
          label: dayDate.getDate().toString(),
          weekday: this.weekdayLabels[dayIndex],
          inCurrentMonth: dayDate.getMonth() === currentMonth,
          isToday: this.isSameDay(dayDate, this.today),
          tasks: tasksForDay,
          visibleTasks: tasksForDay.slice(0, MAX_DAY_VISIBLE),
          hiddenCount: Math.max(0, tasksForDay.length - MAX_DAY_VISIBLE),
        });
      }
      weeks.push({ index: weekIndex, days, segments: [], maxRows: 0 });
    }

    this.weeks = weeks.map(week => ({
      ...week,
      segments: this.computeWeekSegments(week),
      maxRows: Math.max(week.segments.reduce((max, seg) => Math.max(max, seg.row + 1), 0), 0),
    }));

    this.monthLabel = this.viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    this.cdr.markForCheck();
  }

  private computeWeekSegments(week: CalendarWeek): CalendarTaskSegment[] {
    const segments: CalendarTaskSegment[] = [];
    const rowOccupancy: boolean[][] = [];
    const weekStart = week.days[0].date;
    const weekEnd = week.days[6].date;

    const overlappingTasks = this.tasks
      .filter(task => this.filteredTaskIds.has(task.id))
      .filter(task => this.taskOverlapsWeek(task, weekStart, weekEnd))
      .sort((a, b) => {
        const rangeA = this.getTaskRange(a);
        const rangeB = this.getTaskRange(b);
        if (!rangeA || !rangeB) {
          return 0;
        }
        return rangeA.start.getTime() - rangeB.start.getTime();
      });

    overlappingTasks.forEach(task => {
      const range = this.getTaskRange(task);
      if (!range) {
        return;
      }
      const startColumn = Math.max(0, this.dateDiffInDays(weekStart, range.start));
      const endColumn = Math.min(6, this.dateDiffInDays(weekStart, range.end));
      const span = Math.max(1, endColumn - startColumn + 1);

      let row = 0;
      while (true) {
        if (!rowOccupancy[row]) {
          rowOccupancy[row] = Array(7).fill(false);
        }
        if (this.canPlace(rowOccupancy[row], startColumn, span)) {
          for (let i = startColumn; i < startColumn + span; i++) {
            rowOccupancy[row][i] = true;
          }
          break;
        }
        row++;
      }

      segments.push({
        task,
        startColumn: startColumn + 1,
        span,
        row,
        weekIndex: week.index,
        isStart: range.start >= weekStart,
        isEnd: range.end <= weekEnd,
      });
    });

    return segments;
  }

  private shiftTaskDates(task: CalendarTask, delta: number): void {
    const range = this.getTaskRange(task);
    if (!range) {
      return;
    }
    const newStart = this.addDays(range.start, delta);
    const newEnd = this.addDays(range.end, delta);
    this.updateTaskDates(task, newStart, newEnd);
  }

  private updateTaskDates(task: CalendarTask, start: Date, end: Date): void {
    const startIso = this.toIso(start);
    const endIso = this.toIso(end);
    const payload = {
      startDate: startIso,
      dueDate: endIso,
    };

    this.tasks = this.tasks.map(existing =>
      existing.id === task.id
        ? {
            ...existing,
            startDate: startIso,
            dueDate: endIso,
          }
        : existing
    );
    this.buildCalendarGrid();

    this.calendarService.updateTaskDates(task.id, payload).subscribe({
      next: () => {
        this.snackBar.showSuccess('Task updated');
      },
      error: (error) => {
        this.snackBar.showError(error || 'Unable to update task dates');
        if (this.isMyTasksMode) {
          this.loadMyTasksCalendarData();
        } else {
          this.loadCalendarData();
        }
      },
    });
  }

  private getTasksForDay(day: Date): CalendarTask[] {
    return this.tasks
      .filter(task => this.filteredTaskIds.has(task.id))
      .filter(task => {
        const range = this.getTaskRange(task);
        if (!range) {
          return false;
        }
        return day >= range.start && day <= range.end;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  private taskOverlapsWeek(task: CalendarTask, weekStart: Date, weekEnd: Date): boolean {
    const range = this.getTaskRange(task);
    if (!range) {
      return false;
    }
    return !(range.end < weekStart || range.start > weekEnd);
  }

  private getTaskRange(task: CalendarTask): { start: Date; end: Date } | null {
    const start = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : null;
    const end = task.dueDate ? new Date(task.dueDate) : start;
    if (!start || !end) {
      return null;
    }
    return { start: this.stripTime(start), end: this.stripTime(end) };
  }

  private canPlace(row: boolean[], start: number, span: number): boolean {
    for (let i = start; i < start + span; i++) {
      if (row[i]) {
        return false;
      }
    }
    return true;
  }

  private getCalendarStart(date: Date): Date {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstOfMonth.getDay();
    const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return this.addDays(firstOfMonth, -mondayIndex);
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * MILLISECONDS_IN_DAY);
  }

  private dateDiffInDays(from: Date, to: Date): number {
    const diff = this.stripTime(to).getTime() - this.stripTime(from).getTime();
    return Math.floor(diff / MILLISECONDS_IN_DAY);
  }

  private toIso(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

}

