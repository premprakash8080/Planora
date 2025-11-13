import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DropdownPopoverComponent, DropdownPopoverItem } from '../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Task, TaskPriority, TaskSection, TaskStatus } from '../task.model';
import { TaskService } from '../task.service';

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
export class ListViewComponent implements OnInit, OnDestroy {
  readonly statuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
  readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High'];

  searchControl = new FormControl('', { nonNullable: true });
  sections: TaskSection[] = [];

  private readonly destroy$ = new Subject<void>();
  private currentProjectId: string | null = null;
  private selectedSectionId: string | null = null;
  private selectedTaskId: string | null = null;
  private selectedParentTaskId: string | null = null;
  readonly nameDrafts = new Map<string, string>();
  readonly teamMembers: TeamMember[] = [
    {
      id: 'john-doe',
      name: 'John Doe',
      initials: 'JD',
      email: 'john.doe@planora.com',
      avatarColor: '#2563eb',
      avatarUrl: 'assets/img/avatars/1.jpg'
    },
    {
      id: 'sarah-johnson',
      name: 'Sarah Johnson',
      initials: 'SJ',
      email: 'sarah.johnson@planora.com',
      avatarColor: '#db2777'
    },
    {
      id: 'priya-patel',
      name: 'Priya Patel',
      initials: 'PP',
      email: 'priya.patel@planora.com',
      avatarColor: '#f97316'
    },
    {
      id: 'lucas-nguyen',
      name: 'Lucas Nguyen',
      initials: 'LN',
      email: 'lucas.nguyen@planora.com',
      avatarColor: '#10b981'
    },
    {
      id: 'aisha-khan',
      name: 'Aisha Khan',
      initials: 'AK',
      email: 'aisha.khan@planora.com',
      avatarColor: '#8b5cf6'
    }
  ];
  readonly statusOptions: Array<{ value: TaskStatus | string; label: string; color: string }> = [
    { value: 'On Track', label: 'On Track', color: '#22c55e' },
    { value: 'At Risk', label: 'At Risk', color: '#f97316' },
    { value: 'Off Track', label: 'Off Track', color: '#ef4444' },
    { value: 'Done', label: 'Completed', color: '#6366f1' },
    { value: 'In Progress', label: 'In Progress', color: '#0ea5e9' },
    { value: 'To Do', label: 'To Do', color: '#94a3b8' }
  ];
  readonly assigneeItems: DropdownPopoverItem<TeamMember>[] = this.teamMembers.map(member => ({
    id: member.name,
    label: member.name,
    description: member.email,
    avatarText: member.initials,
    avatarUrl: member.avatarUrl ?? undefined,
    avatarColor: member.avatarColor,
    data: member
  }));
  readonly priorityItems: DropdownPopoverItem[] = [
    { id: 'Low', label: 'Low', color: '#2563eb', data: 'Low' },
    { id: 'Medium', label: 'Medium', color: '#b45309', data: 'Medium' },
    { id: 'High', label: 'High', color: '#be185d', data: 'High' }
  ];
  readonly statusItems: DropdownPopoverItem[] = this.statusOptions.map(option => ({
    id: option.value as string,
    label: option.label,
    color: option.color,
    data: option.value
  }));

  selectedTask: Task | null = null;
  selectedSection: TaskSection | null = null;

  constructor(
    private readonly taskService: TaskService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const projectRoute = this.findProjectRoute() ?? this.route;

    const initialProjectId = projectRoute.snapshot.paramMap.get('projectId');
    if (initialProjectId) {
      this.currentProjectId = initialProjectId;
      this.taskService
        .filterTasks(initialProjectId, this.searchControl.value ?? '')
        .pipe(take(1))
        .subscribe(sections => (this.sections = sections));
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
        this.sections = sections;

        if (this.selectedSectionId && this.selectedTaskId) {
          const nextSection = sections.find(section => section.id === this.selectedSectionId);

          if (!nextSection) {
            this.closeDetail();
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
      });
  }

  /** Toggle the expanded state for a section header */
  toggleSection(section: TaskSection): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.toggleSection(this.currentProjectId, section.id);
  }

  /** Flip completion state and persist the change */
  toggleCompleted(section: TaskSection, task: Task): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { completed: !task.completed });
  }

  /** Persist status updates triggered by the detail panel */
  statusChanged(section: TaskSection, task: Task, status: TaskStatus): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { status });
  }

  /** Persist priority updates triggered by the detail panel */
  priorityChanged(section: TaskSection, task: Task, priority: TaskPriority): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { priority });
  }

  /** Save inline task name edits when the value actually changed */
  inlineNameChanged(section: TaskSection, task: Task, value: string): void {
    if (!this.currentProjectId) {
      return;
    }
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { name: value });
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

  /** Update due date and close the menu when a calendar date is picked */
  handleDueDateChange(section: TaskSection, task: Task, date: Date | null, popover?: DropdownPopoverComponent): void {
    if (!this.currentProjectId || !date) {
      popover?.close();
      return;
    }

    const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
    this.taskService.updateTask(this.currentProjectId, section.id, task.id, { dueDate: normalized });
    popover?.close();
  }

  /** Reusable handler for dropdown-popover selection for assignee */
  handleAssigneeSelect(section: TaskSection, task: Task, item: DropdownPopoverItem<TeamMember>): void {
    if (!this.currentProjectId) {
      return;
    }

    const member = item.data ?? this.teamMembers.find(m => m.name === item.label);
    const assignee = member?.name ?? item.label;
    const initials = member?.initials ?? this.getAvatarInitials(assignee);

    const update = {
      assignee,
      assigneeAvatar: initials
    };

    this.taskService.updateTask(this.currentProjectId, section.id, task.id, update);
    Object.assign(task, update);

    if (this.selectedTask?.id === task.id) {
      this.selectedTask = { ...this.selectedTask, ...update };
    }
  }

  /** Reusable handler for dropdown-popover selection for priority */
  handlePrioritySelect(section: TaskSection, task: Task, item: DropdownPopoverItem): void {
    if (!this.currentProjectId) {
      return;
    }
    const value = item.id as TaskPriority;
    this.priorityChanged(section, task, value);
    task.priority = value;

    if (this.selectedTask?.id === task.id) {
      this.selectedTask = { ...this.selectedTask, priority: value };
    }
  }

  /** Reusable handler for dropdown-popover selection for status */
  handleStatusSelect(section: TaskSection, task: Task, item: DropdownPopoverItem): void {
    if (!this.currentProjectId) {
      return;
    }
    const value = item.id as TaskStatus;
    this.statusChanged(section, task, value);
    task.status = value;

    if (this.selectedTask?.id === task.id) {
      this.selectedTask = { ...this.selectedTask, status: value };
    }
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

  private findTeamMember(assignee: string | undefined): TeamMember | undefined {
    if (!assignee) {
      return undefined;
    }
    return this.teamMembers.find(member => member.name === assignee || member.id === assignee);
  }

  /** Map a status code to its theme color for pills and popover */
  getStatusColor(status: string | undefined): string {
    if (!status) {
      return '#94a3b8';
    }
    return this.statusOptions.find(option => option.value === status)?.color ?? '#94a3b8';
  }

  /** Prefer friendly labels when the status is a predefined option */
  getStatusLabel(status: string | undefined): string {
    if (!status) {
      return 'Set status';
    }
    return this.statusOptions.find(option => option.value === status)?.label ?? status;
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
    this.taskService.addTask(this.currentProjectId, section.id, {
      id: `task-${Date.now()}`,
      name: 'New Task',
      assignee: 'Unassigned',
      dueDate: new Date().toISOString(),
      priority: 'Medium',
      status: 'To Do',
      description: '',
      comments: [],
      subtasks: [],
      commentsCount: 0,
      completed: false
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

  /** Track which section/task is currently selected for detail view */
  openTaskDetail(section: TaskSection, task: Task): void {
    this.selectedSectionId = section.id;
    this.selectedTaskId = task.id;
    this.selectedParentTaskId = null;
    this.selectedSection = section;
    this.selectedTask = task;
  }

  /** Clear current selection and hide the detail pane */
  closeDetail(): void {
    this.selectedSectionId = null;
    this.selectedTaskId = null;
    this.selectedParentTaskId = null;
    this.selectedSection = null;
    this.selectedTask = null;
  }

  /** Apply partial updates bubbled up from the detail pane */
  handleTaskUpdated(changes: Partial<Task>): void {
    if (!this.currentProjectId || !this.selectedSectionId || !this.selectedTaskId) {
      return;
    }

    if (this.selectedParentTaskId) {
      this.taskService.updateSubtask(
        this.currentProjectId,
        this.selectedSectionId,
        this.selectedParentTaskId,
        this.selectedTaskId,
        changes
      );
    } else {
      this.taskService.updateTask(this.currentProjectId, this.selectedSectionId, this.selectedTaskId, changes);
    }

    if (this.selectedTask) {
      const next: Task = {
        ...this.selectedTask,
        ...changes
      };

      if (changes.subtasks) {
        next.subtasks = changes.subtasks;
      }

      if (changes.comments) {
        next.comments = changes.comments;
        next.commentsCount = changes.comments.length;
      }

      this.selectedTask = next;
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

  /** Provide friendly name for breadcrumbs and title components */
  get currentProjectName(): string {
    if (!this.currentProjectId) {
      return 'Project';
    }
    return PROJECT_NAME_LOOKUP[this.currentProjectId] ?? 'Project';
  }

  /** Tear down subscriptions when list view is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Walk up the route tree to locate the ancestor holding :projectId */
  private findProjectRoute(): ActivatedRoute | null {
    let current: ActivatedRoute | null = this.route;
    while (current) {
      if (current.snapshot.paramMap.has('projectId')) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }
}

