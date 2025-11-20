import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, filter, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardViewService, BoardViewColumn, BoardViewTask } from '../../../services/board-view.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-tasks-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardViewComponent implements OnInit, OnDestroy {
  columns: BoardViewColumn[] = [];
  projectTitle = 'Board view';
  loading = false;
  error: string | null = null;

  private currentProjectId: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly boardViewService: BoardViewService,
    private readonly route: ActivatedRoute,
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
        this.loadBoardData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  drop(event: CdkDragDrop<BoardViewTask[]>): void {
    if (this.loading) {
      return;
    }

    const previousColumn = this.columns.find(column => column.tasks === event.previousContainer.data);
    const targetColumn = this.columns.find(column => column.tasks === event.container.data);

    if (!previousColumn || !targetColumn) {
      return;
    }

    const snapshot = JSON.parse(JSON.stringify(this.columns)) as BoardViewColumn[];

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const movedTask = targetColumn.tasks[event.currentIndex];
      if (movedTask) {
        movedTask.sectionId = targetColumn.id;
      }
    }

    this.updateTaskCounts();

    const movedTask = targetColumn.tasks[event.currentIndex];
    if (!movedTask) {
      return;
    }

    this.persistTaskPosition(movedTask, targetColumn.id, event.currentIndex, snapshot);
  }

  reload(): void {
    this.loadBoardData();
  }

  trackByTaskId = (_: number, task: BoardViewTask) => task.id;
  trackByColumnId = (_: number, column: BoardViewColumn) => column.id;

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

  private loadBoardData(): void {
    if (!this.currentProjectId) {
      this.error = 'Project ID is missing.';
      this.columns = [];
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.boardViewService
      .getBoardViewData(this.currentProjectId)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.projectTitle = response.project?.name || 'Board view';
            this.columns = (response.columns || []).map(column => ({
              ...column,
              taskCount: column.tasks?.length ?? 0,
              tasks: column.tasks ?? [],
            }));
            this.error = null;
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            this.loading = false;
            this.columns = [];
            this.error = typeof error === 'string'
              ? error
              : 'Failed to load board view data.';
            this.cdr.detectChanges();
          });
        },
      });
  }

  private persistTaskPosition(task: BoardViewTask, sectionId: string, position: number, snapshot: BoardViewColumn[]): void {
    const sectionIdentifier = Number.isNaN(Number(sectionId)) ? sectionId : Number(sectionId);

    this.boardViewService
      .updateTaskPosition(task.id, {
        target_section_id: sectionIdentifier,
        target_position: position,
      })
      .pipe(take(1))
      .subscribe({
        next: (updatedTask) => {
          this.applyUpdatedTask(updatedTask);
        },
        error: (error) => {
          this.restoreSnapshot(snapshot, error);
        },
      });
  }

  private applyUpdatedTask(updatedTask: BoardViewTask): void {
    this.ngZone.run(() => {
      const column = this.columns.find(col => col.id === updatedTask.sectionId);
      if (!column) {
        this.loadBoardData();
        return;
      }
      const taskIndex = column.tasks.findIndex(task => task.id === updatedTask.id);
      if (taskIndex > -1) {
        column.tasks[taskIndex] = updatedTask;
      } else {
        column.tasks.splice(column.tasks.length, 0, updatedTask);
      }
      column.taskCount = column.tasks.length;
      this.cdr.detectChanges();
    });
  }

  private restoreSnapshot(snapshot: BoardViewColumn[], error: any): void {
    this.ngZone.run(() => {
      this.columns = snapshot;
      this.updateTaskCounts();
      const message = typeof error === 'string' ? error : 'Unable to update task position.';
      this.snackBarService.showError(message);
      this.cdr.detectChanges();
    });
  }

  private updateTaskCounts(): void {
    this.columns = this.columns.map(column => ({
      ...column,
      taskCount: column.tasks.length,
    }));
    this.cdr.markForCheck();
  }
}