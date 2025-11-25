import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DropdownPopoverComponent, DropdownPopoverItem } from '../../../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { Subject, combineLatest, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Task, TaskPriorityLegacy, TaskSection, TaskStatusLegacy, TaskStatus, PriorityLabel } from '../../../task.model';
import { TaskService } from '../../../task.service';
import { MemberService, Member } from '../../../../members/service/member.service';
import { ProjectService, Project, ProjectMember } from '../../../services/project.service';
import { TaskStatusService } from '../../../services/task-status.service';
import { PriorityLabelService } from '../../../services/priority-label.service';
import { TasksRouteHelperService } from '../../../services/tasks-route-helper.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  avatarColor: string;
  avatarUrl?: string | null;
}

const PROJECT_NAME_LOOKUP: Record<string, string> = {
  '1': 'Website Redesign',
  '2': 'Mobile App Launch',
  '3': 'Growth Experiments',
  '4': 'Customer Success Ops'
};

@Component({
  selector: 'app-tasks-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent implements OnInit, AfterViewInit, OnDestroy {
  statuses: TaskStatus[] = []; // Array of TaskStatus objects
  priorities: PriorityLabel[] = []; // Array of PriorityLabel objects

  searchControl = new FormControl('', { nonNullable: true });
  sections: TaskSection[] = [];

  private readonly destroy$ = new Subject<void>();
  private currentProjectId: string | null = null;
  private selectedSectionId: string | null = null;
  private selectedTaskId: string | null = null;
  private selectedParentTaskId: string | null = null;
  readonly nameDrafts = new Map<string, string>();
  readonly sectionTitleDrafts = new Map<string, string>();
  teamMembers: TeamMember[] = [];
  members: Member[] = [];
  readonly statusOptions: Array<{ value: TaskStatus | string; label: string; color: string }> = [
    { value: 'On Track', label: 'On Track', color: '#22c55e' },
    { value: 'At Risk', label: 'At Risk', color: '#f97316' },
    { value: 'Off Track', label: 'Off Track', color: '#ef4444' },
    { value: 'Done', label: 'Completed', color: '#6366f1' },
    { value: 'In Progress', label: 'In Progress', color: '#0ea5e9' },
    { value: 'To Do', label: 'To Do', color: '#94a3b8' }
  ];
  assigneeItems: DropdownPopoverItem<TeamMember>[] = [];
  priorityItems: DropdownPopoverItem[] = [];
  statusItems: DropdownPopoverItem[] = [];

  selectedTask: Task | null = null;
  selectedSection: TaskSection | null = null;
  currentProject: Project | null = null;

  // Column resize state
  columnWidths: { [key: string]: number } = {
    name: 300,
    assignee: 150,
    dates: 150,
    priority: 100,
    status: 100,
    comments: 80
  };
  private isResizing = false;
  private resizingColumn: string | null = null;
  private startX = 0;
  private startWidth = 0;

  isMyTasksMode = false;

  constructor(
    private readonly taskService: TaskService,
    private readonly route: ActivatedRoute,
    private readonly memberService: MemberService,
    private readonly projectService: ProjectService,
    private readonly taskStatusService: TaskStatusService,
    private readonly priorityLabelService: PriorityLabelService,
    private readonly routeHelper: TasksRouteHelperService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Load column widths from localStorage
    this.loadColumnWidths();
    // Load members for assignee dropdown
    this.loadMembers();

    // Check if we're in my-tasks mode
    this.isMyTasksMode = this.routeHelper.isMyTasksMode(this.route);
    
    if (this.isMyTasksMode) {
      // My Tasks mode - load my tasks
      this.taskService.loadMyTasks().subscribe();
      // Subscribe to my tasks
      this.taskService
        .filterMyTasks(this.searchControl.value ?? '')
        .pipe(take(1))
        .subscribe(sections => {
          this.ngZone.run(() => {
            this.sections = sections;
            this.cdr.detectChanges();
          });
        });

      // Subscribe to search changes for my tasks
      this.searchControl.valueChanges.pipe(
        startWith(this.searchControl.value),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap(query => this.taskService.filterMyTasks(query)),
        takeUntil(this.destroy$)
      )
      .subscribe(sections => {
        this.ngZone.run(() => {
          this.sections = sections;

          if (this.selectedSectionId && this.selectedTaskId) {
            const nextSection = sections.find(section => section.id === this.selectedSectionId);

            if (!nextSection) {
              this.closeDetail();
              this.cdr.detectChanges();
              return;
            }

            if (this.selectedParentTaskId) {
              const parentTask = nextSection.tasks.find(task => task.id === this.selectedParentTaskId);
              const childTask = parentTask?.subtasks?.find(subtask => subtask.id === this.selectedTaskId);

              if (parentTask && childTask) {
                this.selectedSection = nextSection;
                this.selectedTask = childTask;
              } else {
                this.closeDetail();
              }
            } else {
              const nextTask = nextSection.tasks.find(task => task.id === this.selectedTaskId);

              if (nextTask) {
                this.selectedSection = nextSection;
                this.selectedTask = nextTask;
              } else {
                this.closeDetail();
              }
            }
          }
          this.cdr.detectChanges();
        });
      });
    } else {
      // Project mode - existing logic
      const projectRoute = this.routeHelper.findProjectRoute(this.route) ?? this.route;

      const initialProjectId = projectRoute.snapshot.paramMap.get('projectId');
      if (initialProjectId) {
        this.currentProjectId = initialProjectId;
        // Load project data
        this.loadProject(initialProjectId);
        // Load sections from API
        this.taskService.loadSections(initialProjectId).subscribe();
        // Subscribe to sections
        this.taskService
          .filterTasks(initialProjectId, this.searchControl.value ?? '')
          .pipe(take(1))
          .subscribe(sections => {
            this.ngZone.run(() => {
              this.sections = sections;
              this.cdr.detectChanges();
            });
          });
      }

      const projectId$ = projectRoute.paramMap.pipe(
        map(params => params.get('projectId')),
        filter((projectId): projectId is string => Boolean(projectId)),
        distinctUntilChanged(),
        tap(projectId => {
          if (this.currentProjectId !== projectId) {
            this.searchControl.setValue('', { emitEvent: false });
            if (this.currentProjectId) {
              this.closeDetail();
            }
          }
          this.currentProjectId = projectId;
          // Load project data
          this.loadProject(projectId);
        })
      );

      combineLatest([
        projectId$,
        this.searchControl.valueChanges.pipe(
          startWith(this.searchControl.value),
          debounceTime(200),
          distinctUntilChanged()
        )
      ])
        .pipe(
          switchMap(([projectId, query]) => this.taskService.filterTasks(projectId, query)),
          takeUntil(this.destroy$)
        )
        .subscribe(sections => {
          this.ngZone.run(() => {
            this.sections = sections;

            if (this.selectedSectionId && this.selectedTaskId) {
              const nextSection = sections.find(section => section.id === this.selectedSectionId);

              if (!nextSection) {
                this.closeDetail();
                this.cdr.detectChanges();
                return;
              }

              if (this.selectedParentTaskId) {
                const parentTask = nextSection.tasks.find(task => task.id === this.selectedParentTaskId);
                const childTask = parentTask?.subtasks?.find(subtask => subtask.id === this.selectedTaskId);

                if (parentTask && childTask) {
                  this.selectedSection = nextSection;
                  this.selectedTask = childTask;
                } else {
                  this.closeDetail();
                }
              } else {
                const nextTask = nextSection.tasks.find(task => task.id === this.selectedTaskId);

                if (nextTask) {
                  this.selectedSection = nextSection;
                  this.selectedTask = nextTask;
                } else {
                  this.closeDetail();
                }
              }
            }
            this.cdr.detectChanges();
          });
        });
    }
  }

  ngAfterViewInit(): void {
    // Ensure change detection runs after view initialization
    this.cdr.detectChanges();
  }

  /** Toggle the expanded state for a section header */
  toggleSection(section: TaskSection, event?: Event): void {
    if (!this.currentProjectId) {
      return;
    }
    // Don't toggle if clicking on the title input
    if (event) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.classList.contains('section-title-input')) {
        return;
      }
    }
    this.taskService.toggleSection(this.currentProjectId, section.id);
  }

  /** Track section title edits while user is typing */
  onSectionTitleInput(section: TaskSection, value: string): void {
    this.sectionTitleDrafts.set(section.id, value);
  }

  /** Capture initial section title before edit begins for cancel support */
  handleSectionTitleFocus(section: TaskSection): void {
    if (!this.sectionTitleDrafts.has(section.id)) {
      this.sectionTitleDrafts.set(section.id, section.title ?? '');
    }
  }

  /** Commit inline section title changes or revert when left empty */
  handleSectionTitleBlur(section: TaskSection, input: HTMLInputElement): void {
    if (!this.currentProjectId) {
      return;
    }
    const draft = (this.sectionTitleDrafts.get(section.id) ?? input.value ?? '').trim();

    if (!draft) {
      input.value = section.title ?? '';
      this.sectionTitleDrafts.delete(section.id);
      return;
    }

    if (draft !== (section.title ?? '')) {
      this.taskService.updateSectionTitle(this.currentProjectId, section.id, draft);
    }

    this.sectionTitleDrafts.delete(section.id);
  }

  /** Allow saving via Enter without submitting outer forms */
  handleSectionTitleEnter(event: Event, section: TaskSection, input: HTMLInputElement): void {
    event.preventDefault();
    event.stopPropagation();
    this.handleSectionTitleBlur(section, input);
    input.blur();
  }

  /** Restore original section title when user presses Escape */
  handleSectionTitleEscape(section: TaskSection, input: HTMLInputElement): void {
    input.value = section.title ?? '';
    this.sectionTitleDrafts.delete(section.id);
    input.blur();
  }

  /** Get section title draft or fallback to actual title */
  getSectionTitleDraft(section: TaskSection): string {
    return this.sectionTitleDrafts.get(section.id) ?? section.title ?? '';
  }

  /** Approximate width so section title field grows with its content */
  getSectionTitleWidth(section: TaskSection): number {
    const draft = this.sectionTitleDrafts.get(section.id);
    const text = (draft ?? section.title ?? '').trim() || 'New Section';
    const baseLength = Math.max(text.length, 1);
    const padding = 24;
    const minWidth = 100;
    const maxWidth = 400;
    const approximateCharWidth = 8.5;

    return Math.min(Math.max(baseLength * approximateCharWidth + padding, minWidth), maxWidth);
  }

  /** Public wrapper for section header title updates (used by child component) */
  updateSectionTitle(event: { section: TaskSection; title: string }): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.updateSectionTitle(this.currentProjectId, event.section.id, event.title);
  }

  /** Flip completion state and persist the change */
  toggleCompleted(section: TaskSection, task: Task): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { completed: !task.completed }).subscribe({
      next: (updatedTask) => {
        // Task updated successfully
        // The task service already handles optimistic updates
      },
      error: (error) => {
        console.error('Error toggling task completion:', error);
        // Reload sections to revert optimistic update
        this.taskService.loadSections(this.currentProjectId!).subscribe();
      }
    });
  }

  /** Persist status updates triggered by the detail panel */
  statusChanged(section: TaskSection, task: Task, statusId: number | null): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { task_status_id: statusId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
          // The task service already updates the sections observable via BehaviorSubject
          // The sections will be updated automatically through the filterTasks subscription
          // But we can also update locally for immediate feedback if needed
          if (updatedTask) {
            // Update selected task if it's the same task
            if (this.selectedTask?.id === task.id) {
              this.selectedTask = {
                ...this.selectedTask,
                ...updatedTask,
                taskStatus: updatedTask.taskStatus || this.selectedTask.taskStatus,
                priorityLabel: updatedTask.priorityLabel || this.selectedTask.priorityLabel,
                status: (updatedTask.taskStatus?.name || updatedTask.status) as TaskStatusLegacy,
                priority: (updatedTask.priorityLabel?.name || updatedTask.priority) as TaskPriorityLegacy,
              };
              this.cdr.detectChanges();
            }
          }
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          // Revert optimistic update on error
          this.ngZone.run(() => {
            this.loadSections(this.currentProjectId!);
            this.cdr.detectChanges();
          });
        }
      });
  }

  /** Persist priority updates triggered by the detail panel */
  priorityChanged(section: TaskSection, task: Task, priorityId: number | null): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { priority_label_id: priorityId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
          // The task service already updates the sections observable via BehaviorSubject
          // The sections will be updated automatically through the filterTasks subscription
          // But we can also update locally for immediate feedback if needed
          if (updatedTask) {
            // Update selected task if it's the same task
            if (this.selectedTask?.id === task.id) {
              this.selectedTask = {
                ...this.selectedTask,
                ...updatedTask,
                taskStatus: updatedTask.taskStatus || this.selectedTask.taskStatus,
                priorityLabel: updatedTask.priorityLabel || this.selectedTask.priorityLabel,
                status: (updatedTask.taskStatus?.name || updatedTask.status) as TaskStatusLegacy,
                priority: (updatedTask.priorityLabel?.name || updatedTask.priority) as TaskPriorityLegacy,
              };
              this.cdr.detectChanges();
            }
          }
        },
        error: (error) => {
          console.error('Error updating task priority:', error);
          // Revert optimistic update on error
          this.ngZone.run(() => {
            this.loadSections(this.currentProjectId!);
            this.cdr.detectChanges();
          });
        }
      });
  }

  /**
   * Load sections (helper method)
   */
  private loadSections(projectId: string): void {
    this.taskService.loadSections(projectId).subscribe();
  }

  /** Save inline task name edits when the value actually changed */
  inlineNameChanged(section: TaskSection, task: Task, value: string): void {
    if (!this.currentProjectId) {
      return;
    }
    
    // Trim the value and check if it's different from current name
    const trimmedValue = value.trim();
    if (trimmedValue === (task.name ?? '').trim()) {
      // No change, just clear the draft
      this.nameDrafts.delete(task.id);
      return;
    }

    // If empty, don't update
    if (!trimmedValue) {
      this.nameDrafts.delete(task.id);
      return;
    }

    // Subscribe to the update Observable to ensure the HTTP request is made
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { name: trimmedValue })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
          // Update successful - the task service already updates the state
          // Clear the draft
          this.nameDrafts.delete(task.id);
          
          // Update selectedTask if it's the same task
          if (this.selectedTask?.id === updatedTask.id) {
            this.selectedTask = updatedTask;
          }
          
          // Trigger change detection
          this.ngZone.run(() => {
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error updating task name:', error);
          // Revert the draft on error
          this.nameDrafts.delete(task.id);
          this.ngZone.run(() => {
            this.cdr.markForCheck();
          });
        }
      });
  }

  /** Track name edits while user is typing */
  onNameInput(task: Task, value: string): void {
    this.nameDrafts.set(task.id, value);
  }

  /** Capture initial name before edit begins for cancel support */
  handleNameFocus(task: Task): void {
    if (!this.nameDrafts.has(task.id)) {
      this.nameDrafts.set(task.id, task.name ?? '');
    }
  }

  /** Commit inline name changes or revert when left empty */
  handleNameBlur(section: TaskSection, task: Task, input: HTMLInputElement): void {
    const draft = (this.nameDrafts.get(task.id) ?? input.value ?? '').trim();

    if (!draft) {
      input.value = task.name ?? '';
      this.nameDrafts.delete(task.id);
      return;
    }

    if (draft !== (task.name ?? '')) {
      this.inlineNameChanged(section, task, draft);
    }

    this.nameDrafts.delete(task.id);
  }

  /** Allow saving via Enter without submitting outer forms */
  handleNameEnter(event: Event, section: TaskSection, task: Task, input: HTMLInputElement): void {
    event.preventDefault();
    this.handleNameBlur(section, task, input);
    input.blur();
  }

  /** Restore original name when user presses Escape */
  handleNameEscape(task: Task, input: HTMLInputElement): void {
    input.value = task.name ?? '';
    this.nameDrafts.delete(task.id);
    input.blur();
  }

  /** Approximate width so name field grows with its content */
  getTaskNameWidth(task: Task): number {
    const draft = this.nameDrafts.get(task.id);
    const text = (draft ?? task.name ?? '').trim() || 'New Task';
    const baseLength = Math.max(text.length, 1);
    const padding = 28;
    const minWidth = 80;
    const maxWidth = 420;
    const approximateCharWidth = 8.2;

    return Math.min(Math.max(baseLength * approximateCharWidth + padding, minWidth), maxWidth);
  }

  /** Click handler for legacy assignee trigger – kept for compatibility */
  selectAssignee(section: TaskSection, task: Task, member: { id: string; name: string; initials: string }, event: Event): void {
    event.stopPropagation();

    if (!this.currentProjectId) {
      return;
    }

    this.taskService.updateTask(this.currentProjectId, section.id, task.id, {
      assignee: member.name,
      assigneeAvatar: member.initials
    });
  }

  /** Handle date range change from date range picker */
  handleDateRangeChange(section: TaskSection, task: Task, range: { start: Date | null; end: Date | null }): void {
    if (!this.currentProjectId) {
      return;
    }

    // Normalize dates to ISO strings (date only, no time)
    const startNormalized = range.start ? new Date(Date.UTC(
      range.start.getFullYear(),
      range.start.getMonth(),
      range.start.getDate()
    )).toISOString() : null;

    const endNormalized = range.end ? new Date(Date.UTC(
      range.end.getFullYear(),
      range.end.getMonth(),
      range.end.getDate()
    )).toISOString() : null;

    // Update both dates in a single API call
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, {
      startDate: startNormalized,
      dueDate: endNormalized
    }).subscribe({
      next: (updatedTask) => {
        // Task updated successfully
        // The task service already handles optimistic updates
      },
      error: (error) => {
        console.error('Error updating task dates:', error);
        // Reload sections to revert optimistic update
        this.taskService.loadSections(this.currentProjectId!).subscribe();
      }
    });
  }

  /** Update start date and close the menu when a calendar date is picked */
  handleStartDateChange(section: TaskSection, task: Task, date: Date | null, popover?: DropdownPopoverComponent): void {
    if (!this.currentProjectId) {
      popover?.close();
      return;
    }

    const normalized = date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString() : null;
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { startDate: normalized }).subscribe({
      next: (updatedTask) => {
        // Task updated successfully
        popover?.close();
      },
      error: (error) => {
        console.error('Error updating start date:', error);
        popover?.close();
        // Reload sections to revert optimistic update
        this.taskService.loadSections(this.currentProjectId!).subscribe();
      }
    });
  }

  /** Update due date and close the menu when a calendar date is picked */
  handleDueDateChange(section: TaskSection, task: Task, date: Date | null, popover?: DropdownPopoverComponent): void {
    if (!this.currentProjectId) {
      popover?.close();
      return;
    }

    const normalized = date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString() : null;
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { dueDate: normalized }).subscribe({
      next: (updatedTask) => {
        // Task updated successfully
        popover?.close();
      },
      error: (error) => {
        console.error('Error updating due date:', error);
        popover?.close();
        // Reload sections to revert optimistic update
        this.taskService.loadSections(this.currentProjectId!).subscribe();
      }
    });
  }

  /** Handle task drag and drop - Asana-style with beforeTaskId/afterTaskId */
  handleTaskDropped(event: CdkDragDrop<Task[]>): void {
    if (!this.currentProjectId) {
      return;
    }

    // Get the task being moved FIRST (before any array manipulation)
    const task = event.previousContainer.data[event.previousIndex];
    if (!task) {
      console.error('No task found in drag event');
      return;
    }
    
    // Identify sections - prioritize section ID from the event (most reliable)
    const eventWithSection = event as any;
    let targetSection: TaskSection | undefined;
    let previousSection: TaskSection | undefined;
    
    // PRIORITY 1: Find previous section by checking which section currently contains the task
    // This is the most reliable method since the task hasn't been moved yet
    previousSection = this.sections.find(s => s.tasks.some(t => t.id === task.id));
    
    // PRIORITY 2: Use section ID from the event (set by target section component in onTaskDropped)
    // This is the MOST RELIABLE for target section identification
    const targetSectionIdFromEvent = eventWithSection.sectionId || (event.container as any)?.sectionId;
    if (targetSectionIdFromEvent) {
      targetSection = this.sections.find(s => s.id === targetSectionIdFromEvent || String(s.id) === String(targetSectionIdFromEvent));
      if (targetSection) {
        console.log('✓ Using event sectionId for target:', targetSectionIdFromEvent, 'Found section:', targetSection.id);
      }
    }
    
    // PRIORITY 3: Find by comparing data arrays (fallback for target)
    if (!targetSection) {
      targetSection = this.sections.find(s => s.tasks === event.container.data);
      if (targetSection) {
        console.log('✓ Using container data for target, found:', targetSection.id);
      }
    }
    
    // PRIORITY 4: Find by comparing data arrays (fallback for previous)
    if (!previousSection) {
      previousSection = this.sections.find(s => s.tasks === event.previousContainer.data);
      if (previousSection) {
        console.log('✓ Using previousContainer data for previous, found:', previousSection.id);
      }
    }

    if (!previousSection || !targetSection) {
      console.error('Could not identify sections:', {
        taskId: task.id,
        previousSection,
        targetSection,
        previousData: event.previousContainer.data,
        targetData: event.container.data,
        eventSectionId: eventWithSection.sectionId,
        sections: this.sections.map(s => ({ 
          id: s.id, 
          tasksLength: s.tasks.length, 
          taskIds: s.tasks.map(t => t.id),
          hasTask: s.tasks.some(t => t.id === task.id)
        }))
      });
      return;
    }
    
    // Check if moving to a different section by comparing section IDs
    // This is more reliable than comparing container references
    // Also check if containers are different as a fallback
    const isSameSection = targetSection.id === previousSection.id;
    const containersAreDifferent = event.previousContainer !== event.container;
    // If containers are different OR section IDs are different, it's a cross-section move
    const isMovingToDifferentSection = !isSameSection || (containersAreDifferent && eventWithSection.sectionId && eventWithSection.sectionId !== previousSection.id);
    
    // Debug logging
    console.log('Drag drop event:', {
      taskId: task.id,
      isSameSection,
      previousSectionId: previousSection?.id,
      targetSectionId: targetSection?.id,
      eventSectionId: eventWithSection.sectionId,
      isMovingToDifferentSection,
      previousContainer: event.previousContainer,
      container: event.container,
      containerSame: event.previousContainer === event.container,
      previousDataLength: event.previousContainer.data.length,
      targetDataLength: event.container.data.length,
      allSectionIds: this.sections.map(s => s.id)
    });

    // Get tasks in target section BEFORE the transfer (for calculating beforeTaskId/afterTaskId)
    const tasksInTargetBefore = [...event.container.data];
    const insertIndex = event.currentIndex;

    // Determine beforeTaskId and afterTaskId
    // Note: afterTaskId is the task that will be AFTER the dropped task
    // beforeTaskId is the task that will be BEFORE the dropped task
    let beforeTaskId: string | undefined;
    let afterTaskId: string | undefined;

    if (insertIndex > 0 && insertIndex <= tasksInTargetBefore.length) {
      // There's a task before the insertion point
      const taskBefore = tasksInTargetBefore[insertIndex - 1];
      if (taskBefore && taskBefore.id !== task.id) {
        beforeTaskId = taskBefore.id;
      }
    }
    if (insertIndex < tasksInTargetBefore.length) {
      // There's a task at the insertion point (will be after the dropped task)
      const taskAfter = tasksInTargetBefore[insertIndex];
      if (taskAfter && taskAfter.id !== task.id) {
        afterTaskId = taskAfter.id;
      }
    }

    // Optimistic update: move task in UI immediately
    // Use section ID comparison for determining if it's the same section
    const containersAreSame = event.previousContainer === event.container;
    
    if (isSameSection && containersAreSame) {
      // Same section: reorder tasks within the same array
      // Only move if the index actually changed
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        console.log('✓ Same-section reorder: moved from index', event.previousIndex, 'to', event.currentIndex);
      } else {
        console.log('✓ Same-section: no position change, skipping UI update');
        // No position change, but still need to call API to ensure backend is in sync
      }
    } else {
      // Different section: transfer task between arrays
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      console.log('✓ Cross-section move: transferred from section', previousSection.id, 'to section', targetSection.id);
    }

    // Prepare move options
    // ALWAYS include taskId and sectionId (target section where task is being moved to)
    const moveOptions: { taskId?: string; sectionId?: string; beforeTaskId?: string; afterTaskId?: string } = {};

    // Get target section ID - this is the section where the task is being dropped
    // CRITICAL: Always use targetSection.id as the primary source (most reliable)
    // Fallback to eventSectionId only if targetSection is not found
    const targetSectionId = targetSection?.id || eventWithSection.sectionId || (event.container as any)?.sectionId;
    
    if (!targetSectionId || !targetSection) {
      console.error('✗ Cannot move task: targetSection.id is missing', {
        taskId: task.id,
        targetSection,
        targetSectionId,
        previousSection,
        eventSectionId: eventWithSection.sectionId,
        containerSectionId: (event.container as any)?.sectionId,
        allSections: this.sections.map(s => ({ id: s.id, title: s.title }))
      });
      // Revert optimistic update
      if (isSameSection) {
        moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
      } else {
        transferArrayItem(
          event.container.data,
          event.previousContainer.data,
          event.currentIndex,
          event.previousIndex
        );
      }
      return;
    }

    // ALWAYS include taskId so backend knows which task to update
    moveOptions.taskId = String(task.id);
    
    // CRITICAL: ALWAYS include sectionId - this is the target section where the task is being moved to
    // Example: task is in section 3, moved to section 2, then sectionId = 2
    // The backend will handle updating section_id if it's different, or just position if it's the same
    moveOptions.sectionId = String(targetSection.id);

    if (isMovingToDifferentSection || containersAreDifferent) {
      console.log('✓ Moving task to different section:', {
        taskId: task.id,
        fromSection: previousSection.id,
        toSection: targetSectionId,
        sectionId: moveOptions.sectionId,
        beforeTaskId,
        afterTaskId
      });
    } else {
      console.log('✓ Reordering task within same section:', {
        taskId: task.id,
        sectionId: targetSectionId,
        beforeTaskId,
        afterTaskId
      });
    }

    // Include beforeTaskId or afterTaskId for precise positioning
    // Prefer beforeTaskId if available, otherwise use afterTaskId
    if (beforeTaskId) {
      moveOptions.beforeTaskId = String(beforeTaskId);
    } else if (afterTaskId) {
      moveOptions.afterTaskId = String(afterTaskId);
    }

    // Debug: Log the final move options
    console.log('Move options being sent:', moveOptions);

    // Call the new moveTask API with beforeTaskId/afterTaskId
    this.taskService.moveTask(task.id, moveOptions).subscribe({
      next: (updatedTask) => {
        // Update the task in the UI with the response
        const taskIndex = targetSection.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          targetSection.tasks[taskIndex] = updatedTask;
        }
        // Reload sections to ensure consistency and get updated positions
        this.taskService.loadSections(this.currentProjectId!).subscribe();
      },
      error: (err) => {
        console.error('Error moving task:', err);
        // Revert optimistic update on error
        if (isSameSection) {
          moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
        } else {
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        }
        this.taskService.loadSections(this.currentProjectId!).subscribe();
      }
    });
  }

  /** Reusable handler for dropdown-popover selection for assignee */
  handleAssigneeSelect(section: TaskSection, task: Task, item: DropdownPopoverItem<TeamMember>): void {
    if (!this.currentProjectId) {
      return;
    }

    const member = item.data ?? this.teamMembers.find(m => m.name === item.label);
    const assignee = member?.name ?? item.label;
    const initials = member?.initials ?? this.getAvatarInitials(assignee);
    const assigneeId = member?.id ? parseInt(member.id) : undefined;

    const update = {
      assignee,
      assigneeAvatar: initials
    };

    // Update task via API
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, update, assigneeId).subscribe({
      next: (updatedTask) => {
        // Task updated successfully
        // The task service already handles optimistic updates
        // Update local references if needed
        Object.assign(task, update);
        if (this.selectedTask?.id === task.id) {
          this.selectedTask = { ...this.selectedTask, ...update };
        }
      },
      error: (error) => {
        console.error('Error updating assignee:', error);
        // Reload sections to revert optimistic update
        this.taskService.loadSections(this.currentProjectId!).subscribe();
      }
    });
  }

  /** Reusable handler for dropdown-popover selection for priority */
  handlePrioritySelect(section: TaskSection, task: Task, item: DropdownPopoverItem): void {
    if (!this.currentProjectId) {
      return;
    }
    const priorityId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
    const priorityIdValue = priorityId && !isNaN(priorityId) ? priorityId : null;
    
    // Find the priorityLabel object for optimistic update
    const priorityLabel = this.priorities.find(p => p.id === priorityIdValue);
    
    // Optimistically update the task in the sections array for immediate UI feedback
    const sectionIndex = this.sections.findIndex(s => s.id === section.id);
    if (sectionIndex !== -1) {
      const taskIndex = this.sections[sectionIndex].tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        // Create new task object with updated priority
        this.sections[sectionIndex].tasks[taskIndex] = {
          ...this.sections[sectionIndex].tasks[taskIndex],
          priority_label_id: priorityIdValue,
          priorityLabel: priorityLabel,
          priority: priorityLabel?.name as TaskPriorityLegacy
        };
        // Create new sections array for OnPush change detection
        this.sections = [...this.sections];
        this.cdr.detectChanges();
      }
    }
    
    // Call the API to persist the change (will update via observable)
    this.priorityChanged(section, task, priorityIdValue);

    // Update selected task if it's the same task
    if (this.selectedTask?.id === task.id) {
      this.selectedTask = {
        ...this.selectedTask,
        priority_label_id: priorityIdValue,
        priorityLabel: priorityLabel,
        priority: priorityLabel?.name as TaskPriorityLegacy
      };
    }
  }

  /** Reusable handler for dropdown-popover selection for status */
  handleStatusSelect(section: TaskSection, task: Task, item: DropdownPopoverItem): void {
    if (!this.currentProjectId) {
      return;
    }
    const statusId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
    const statusIdValue = statusId && !isNaN(statusId) ? statusId : null;
    
    // Find the taskStatus object for optimistic update
    const taskStatus = this.statuses.find(s => s.id === statusIdValue);
    
    // Optimistically update the task in the sections array for immediate UI feedback
    const sectionIndex = this.sections.findIndex(s => s.id === section.id);
    if (sectionIndex !== -1) {
      const taskIndex = this.sections[sectionIndex].tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        // Create new task object with updated status
        this.sections[sectionIndex].tasks[taskIndex] = {
          ...this.sections[sectionIndex].tasks[taskIndex],
          task_status_id: statusIdValue,
          taskStatus: taskStatus,
          status: taskStatus?.name as TaskStatusLegacy
        };
        // Create new sections array for OnPush change detection
        this.sections = [...this.sections];
        this.cdr.detectChanges();
      }
    }
    
    // Call the API to persist the change (will update via observable)
    this.statusChanged(section, task, statusIdValue);

    // Update selected task if it's the same task
    if (this.selectedTask?.id === task.id) {
      this.selectedTask = {
        ...this.selectedTask,
        task_status_id: statusIdValue,
        taskStatus: taskStatus,
        status: taskStatus?.name as TaskStatusLegacy
      };
    }
  }

  /** Convert stored ISO string to Date for the calendar component */
  getStartDate(task: Task): Date | null {
    if (!task.startDate) {
      return null;
    }
    const parsed = new Date(task.startDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  /** Convert stored ISO string to Date for the calendar component */
  getDueDate(task: Task): Date | null {
    if (!task.dueDate) {
      return null;
    }
    const parsed = new Date(task.dueDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  /** Helper to derive initials for avatar placeholders */
  getAvatarInitials(assignee: string | undefined): string {
    if (!assignee) {
      return 'NA';
    }

    const parts = assignee.split(' ').filter(Boolean);
    if (!parts.length) {
      return assignee.substring(0, 2).toUpperCase();
    }
    return parts.map(part => part.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  getAssigneeInitials(assignee: string | undefined): string {
    const member = this.findTeamMember(assignee);
    return member?.initials ?? this.getAvatarInitials(assignee);
  }

  getAssigneeAvatar(assignee: string | undefined): string | null {
    return this.findTeamMember(assignee)?.avatarUrl ?? null;
  }

  getAssigneeColor(assignee: string | undefined): string | undefined {
    return this.findTeamMember(assignee)?.avatarColor;
  }

  getAssigneeId(assignee: string | undefined): number | undefined {
    const member = this.findMemberByNameOrEmail(assignee);
    return member?.id ? parseInt(member.id.toString()) : undefined;
  }

  private findTeamMember(assignee: string | undefined): TeamMember | undefined {
    if (!assignee) {
      return undefined;
    }
    return this.teamMembers.find(member => 
      member.name === assignee || 
      member.id === assignee ||
      member.email === assignee
    );
  }

  /**
   * Find member by name or email
   */
  findMemberByNameOrEmail(nameOrEmail: string | undefined): Member | undefined {
    if (!nameOrEmail) return undefined;
    return this.members.find(m => 
      m.full_name === nameOrEmail || 
      m.email === nameOrEmail ||
      m.id.toString() === nameOrEmail
    );
  }

  /** Map a status code to its theme color for pills and popover */
  getStatusColor(status: string | undefined, task?: Task): string {
    // If task has taskStatus object, use its color
    if (task?.taskStatus?.color) {
      return task.taskStatus.color;
    }
    // Fallback to legacy statusOptions
    if (!status) {
      return '#94a3b8';
    }
    return this.statusOptions.find(option => option.value === status)?.color ?? '#94a3b8';
  }

  /** Prefer friendly labels when the status is a predefined option */
  getStatusLabel(status: string | undefined, task?: Task): string {
    // If task has taskStatus object, use its name
    if (task?.taskStatus?.name) {
      return task.taskStatus.name;
    }
    // Fallback to legacy statusOptions
    if (!status) {
      return 'Set status';
    }
    return this.statusOptions.find(option => option.value === status)?.label ?? status;
  }

  /** Format ISO dates into human readable strings with relative hints */
  formatStartDate(value: string | undefined): string {
    if (!value) {
      return 'No start date';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'No start date';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 0) {
      return `Today – ${formatDate(target, 'dd MMM', 'en-US')}`;
    }
    if (diff === 1) {
      return `Tomorrow – ${formatDate(target, 'dd MMM', 'en-US')}`;
    }
    if (diff === -1) {
      return `Yesterday – ${formatDate(target, 'dd MMM', 'en-US')}`;
    }

    return formatDate(target, 'dd MMM yyyy', 'en-US');
  }

  /** Format ISO dates into human readable strings with relative hints */
  formatDueDate(value: string | undefined): string {
    if (!value) {
      return 'No due date';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'No due date';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 0) {
      return `Today – ${formatDate(target, 'dd MMM', 'en-US')}`;
    }
    if (diff === 1) {
      return `Tomorrow – ${formatDate(target, 'dd MMM', 'en-US')}`;
    }
    if (diff === -1) {
      return `Yesterday – ${formatDate(target, 'dd MMM', 'en-US')}`;
    }

    return formatDate(target, 'dd MMM yyyy', 'en-US');
  }

  /** Append a boilerplate task to the current section */
  addTask(section: TaskSection): void {
    if (!this.currentProjectId) {
      return;
    }
    // Get default priority and status IDs if available
    const defaultPriority = this.priorities.find(p => p.is_default)?.id || null;
    const defaultStatus = this.statuses.find(s => s.is_default)?.id || null;

    this.taskService.addTask(this.currentProjectId, section.id, {
      id: `temp-${Date.now()}`,
      name: 'New Task',
      assignee: undefined,
      dueDate: undefined,
      priority_label_id: defaultPriority,
      task_status_id: defaultStatus,
      description: '',
      comments: [],
      subtasks: [],
      commentsCount: 0,
      completed: false
    });
  }

  /**
   * Load members for assignee dropdown
   */
  private loadMembers(): void {
    this.memberService.getMembers().subscribe({
      next: (members) => {
        this.ngZone.run(() => {
          this.members = members;
          // Map members to team members format
          this.teamMembers = members.map(member => ({
            id: member.id.toString(),
            name: member.full_name,
            initials: member.initials || this.getAvatarInitials(member.full_name),
            email: member.email,
            avatarColor: member.avatar_color || '#2563eb',
            avatarUrl: member.avatar_url || undefined
          }));

          // Update assignee items
          this.assigneeItems = this.teamMembers.map(member => ({
            id: member.name,
            label: member.name,
            description: member.email,
            avatarText: member.initials,
            avatarUrl: member.avatarUrl ?? undefined,
            avatarColor: member.avatarColor,
            data: member
          }));
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  /** Convenience to add a task into the first section */
  addQuickTask(): void {
    if (!this.currentProjectId) {
      return;
    }
    const firstSection = this.sections[0];
    if (firstSection) {
      this.addTask(firstSection);
    }
  }

  /** Add a new section to the task list */
  addSection(): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.addSection(this.currentProjectId);
  }

  /** Track which section/task is currently selected for detail view */
  openTaskDetail(section: TaskSection, task: Task): void {
    this.selectedSectionId = section.id;
    this.selectedTaskId = task.id;
    this.selectedParentTaskId = null;
    this.selectedSection = section;
    this.selectedTask = task;
  }

  /** Clear current selection and hide the detail pane */
  /**
   * Handle task deletion
   */
  handleTaskDeleted(taskId: string): void {
    if (!this.currentProjectId || !this.selectedSection) {
      return;
    }

    // Remove task from sections using TaskService
    this.taskService.deleteTask(this.currentProjectId, this.selectedSection.id, taskId);
    
    // Close the detail view
    this.closeDetail();
    
    // Reload sections to ensure UI is in sync
    this.taskService.loadSections(this.currentProjectId).subscribe({
      next: (sections) => {
        this.ngZone.run(() => {
          this.sections = sections;
          this.cdr.detectChanges();
        });
      }
    });
  }

  closeDetail(): void {
    this.selectedSectionId = null;
    this.selectedTaskId = null;
    this.selectedParentTaskId = null;
    this.selectedSection = null;
    this.selectedTask = null;
  }

  /** Apply partial updates bubbled up from the detail pane */
  handleTaskUpdated(event: { changes: Partial<Task>; assigneeId?: number }): void {
    if (!this.currentProjectId || !this.selectedSectionId || !this.selectedTaskId) {
      return;
    }

    const { changes, assigneeId: providedAssigneeId } = event;

    // Handle assignee update - use provided assigneeId or find member ID
    let assigneeId: number | undefined = providedAssigneeId;
    if (assigneeId === undefined && changes.assignee !== undefined) {
      const member = this.findMemberByNameOrEmail(changes.assignee);
      assigneeId = member?.id;
    }

    if (this.selectedParentTaskId) {
      this.taskService.updateSubtask(
        this.currentProjectId,
        this.selectedSectionId,
        this.selectedParentTaskId,
        this.selectedTaskId,
        changes
      ).subscribe({
        next: (updatedSubtask) => {
          // Update selected task with full response including taskStatus and priorityLabel
          if (this.selectedTask && updatedSubtask) {
            // Create new object reference for OnPush change detection
            this.selectedTask = {
              ...updatedSubtask,
              // Ensure taskStatus and priorityLabel objects are preserved from response
              taskStatus: updatedSubtask.taskStatus || this.selectedTask.taskStatus,
              priorityLabel: updatedSubtask.priorityLabel || this.selectedTask.priorityLabel,
              // Update legacy fields for backward compatibility
              status: (updatedSubtask.taskStatus?.name || updatedSubtask.status) as TaskStatusLegacy,
              priority: (updatedSubtask.priorityLabel?.name || updatedSubtask.priority) as TaskPriorityLegacy,
              // Preserve comments if not in response
              comments: updatedSubtask.comments || this.selectedTask.comments,
              commentsCount: updatedSubtask.commentsCount ?? this.selectedTask.commentsCount,
            };
            this.cdr.detectChanges();
          }
        }
      });
    } else {
      this.taskService.updateTask(this.currentProjectId, this.selectedSectionId, this.selectedTaskId, changes, assigneeId)
        .subscribe({
          next: (updatedTask) => {
            // Update selected task with full response including taskStatus and priorityLabel
            if (this.selectedTask && updatedTask) {
              // Create new object reference for OnPush change detection
              this.selectedTask = {
                ...updatedTask,
                // Ensure taskStatus and priorityLabel objects are preserved from response
                taskStatus: updatedTask.taskStatus || this.selectedTask.taskStatus,
                priorityLabel: updatedTask.priorityLabel || this.selectedTask.priorityLabel,
                // Update legacy fields for backward compatibility
                status: (updatedTask.taskStatus?.name || updatedTask.status) as TaskStatusLegacy,
                priority: (updatedTask.priorityLabel?.name || updatedTask.priority) as TaskPriorityLegacy,
                // Preserve comments if not in response
                comments: updatedTask.comments || this.selectedTask.comments,
                commentsCount: updatedTask.commentsCount ?? this.selectedTask.commentsCount,
              };
              this.cdr.detectChanges();
            }
          }
        });
    }
  }

  handleSubtaskOpen(event: { parentTaskId: string; subtask: Task }): void {
    if (!this.selectedSectionId) {
      this.selectedSectionId = this.selectedSection?.id ?? null;
    }

    if (!this.selectedSectionId) {
      return;
    }

    this.selectedParentTaskId = event.parentTaskId;
    this.selectedTaskId = event.subtask.id;

    const section = this.sections.find(item => item.id === this.selectedSectionId);
    const parentTask = section?.tasks.find(task => task.id === event.parentTaskId);
    const nextSubtask = parentTask?.subtasks?.find(task => task.id === event.subtask.id);

    if (section && nextSubtask) {
      this.selectedSection = section;
      this.selectedTask = nextSubtask;
    } else {
      this.closeDetail();
    }
  }

  /** Load project data */
  private loadProject(projectId: string): void {
    this.projectService.getProjectById(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          this.ngZone.run(() => {
            this.currentProject = project;
            // Load task statuses and priority labels for this project
            this.loadTaskStatusesAndPriorities(parseInt(projectId));
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error loading project:', error);
        }
      });
  }

  /**
   * Load task statuses and priority labels for the current project
   */
  private loadTaskStatusesAndPriorities(projectId: number): void {
    forkJoin({
      statuses: this.taskStatusService.getTaskStatuses(projectId),
      priorities: this.priorityLabelService.getPriorityLabels(projectId)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ statuses, priorities }) => {
          this.ngZone.run(() => {
            this.statuses = statuses;
            this.priorities = priorities;

            // Update status items for dropdown
            // console.log('statuses', statuses);
            this.statusItems = statuses.map(status => ({
              id: status.id.toString(),
              label: status.name,
              color: status.color || '#6b7280',
              data: status
            }));

            // Update priority items for dropdown
            this.priorityItems = priorities.map(priority => ({
              id: priority.id.toString(),
              label: priority.name,
              color: priority.color || '#2563eb',
              data: priority
            }));

            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error loading task statuses and priority labels:', error);
        }
      });
  }

  /** Provide friendly name for breadcrumbs and title components */
  get currentProjectName(): string {
    // Return "My Tasks" when in my-tasks mode
    if (this.isMyTasksMode) {
      return 'My Tasks';
    }
    if (this.currentProject?.name) {
      return this.currentProject.name;
    }
    if (!this.currentProjectId) {
      return 'Project';
    }
    return PROJECT_NAME_LOOKUP[this.currentProjectId] ?? 'Project';
  }

  /** Tear down subscriptions when list view is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Save column widths to localStorage
    this.saveColumnWidths();
  }

  // Column resize methods
  loadColumnWidths(): void {
    const saved = localStorage.getItem('task-list-column-widths');
    if (saved) {
      try {
        this.columnWidths = { ...this.columnWidths, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Failed to load column widths:', e);
      }
    }
  }

  saveColumnWidths(): void {
    try {
      localStorage.setItem('task-list-column-widths', JSON.stringify(this.columnWidths));
    } catch (e) {
      console.warn('Failed to save column widths:', e);
    }
  }

  getGridTemplateColumns(): string {
    // Include 24px for drag handle column
    return `24px ${this.columnWidths.name}px ${this.columnWidths.assignee}px ${this.columnWidths.dates}px ${this.columnWidths.priority}px ${this.columnWidths.status}px ${this.columnWidths.comments}px`;
  }

  onResizeStart(event: MouseEvent, column: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.resizingColumn = column;
    this.startX = event.clientX;
    this.startWidth = this.columnWidths[column];
    
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  onResizeMove = (event: MouseEvent): void => {
    if (!this.isResizing || !this.resizingColumn) {
      return;
    }
    
    const diff = event.clientX - this.startX;
    const newWidth = Math.max(80, this.startWidth + diff); // Minimum width 80px
    this.columnWidths[this.resizingColumn] = newWidth;
    this.cdr.detectChanges();
  };

  onResizeEnd = (): void => {
    if (this.isResizing) {
      this.isResizing = false;
      this.resizingColumn = null;
      this.saveColumnWidths();
    }
    
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  /** Handle project title change */
  onProjectTitleChange(newTitle: string): void {
    if (this.currentProject && this.currentProjectId) {
      this.projectService.updateProject(this.currentProjectId, { name: newTitle })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedProject) => {
            this.ngZone.run(() => {
              this.currentProject = updatedProject;
              this.cdr.detectChanges();
            });
          }
        });
    }
  }

  /** Handle project favorite change */
  onProjectFavoriteChange(isFavorite: boolean): void {
    if (this.currentProject && this.currentProjectId) {
      this.projectService.toggleFavorite(this.currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (favoriteStatus) => {
            this.ngZone.run(() => {
              if (this.currentProject) {
                this.currentProject.is_favorite = favoriteStatus;
                this.cdr.detectChanges();
              }
            });
          }
        });
    }
  }

  /** Handle project status change */
  onProjectStatusChange(status: string): void {
    if (this.currentProject && this.currentProjectId) {
      this.projectService.updateProject(this.currentProjectId, { status })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedProject) => {
            this.ngZone.run(() => {
              this.currentProject = updatedProject;
              this.cdr.detectChanges();
            });
          }
        });
    }
  }

  /** Handle project members change */
  onProjectMembersChange(members: ProjectMember[]): void {
    if (this.currentProjectId) {
      // Reload project to get fresh data from backend
      this.loadProject(this.currentProjectId);
    }
  }

}

