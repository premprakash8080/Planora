import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Task, TaskPriorityLegacy, TaskStatusLegacy, TaskComment, TaskStatus, PriorityLabel } from '../../../task.model';
import { TaskService } from '../../../task.service';
import { TaskApiService } from '../../../services/task-api.service';
import { TaskStatusService } from '../../../services/task-status.service';
import { PriorityLabelService } from '../../../services/priority-label.service';
import { DropdownPopoverItem } from '../../../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent implements OnInit, OnChanges {
  @Input() task: Task | null = null;
  @Input() projectName = '';
  @Input() sectionTitle = '';
  @Input() open = false;
  @Input() statuses: TaskStatus[] = []; // Array of TaskStatus objects
  @Input() priorities: PriorityLabel[] = []; // Array of PriorityLabel objects
  @Input() assigneeItems: DropdownPopoverItem[] = [];
  @Input() getAssigneeAvatar: (assignee: string | undefined) => string | null = () => null;
  @Input() getAssigneeInitials: (assignee: string | undefined) => string = () => 'NA';
  @Input() getAssigneeColor: (assignee: string | undefined) => string | undefined = () => undefined;
  @Input() getAssigneeId: (assignee: string | undefined) => number | undefined = () => undefined;

  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<{ changes: Partial<Task>; assigneeId?: number }>();
  @Output() subtaskOpen = new EventEmitter<{ parentTaskId: string; subtask: Task }>();
  @Output() taskDeleted = new EventEmitter<string>();

  readonly titleControl = new FormControl<string>('', { nonNullable: true });
  readonly descriptionControl = new FormControl<string>('', { nonNullable: true });
  readonly commentControl = new FormControl<string>('', { nonNullable: true });
  loading = false;
  deleting = false;

  // Task action menu items
  taskActionItems: DropdownPopoverItem[] = [
    {
      id: 'delete',
      label: 'Delete task',
      // description: 'Permanently delete this task',
      color: '#ef4444'
    }
  ];

  constructor(
    private taskService: TaskService,
    private taskApiService: TaskApiService,
    private taskStatusService: TaskStatusService,
    private priorityLabelService: PriorityLabelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // If statuses or priorities are not provided, try to load them
    // This is a fallback in case the parent component hasn't loaded them yet
    if (this.statuses.length === 0 || this.priorities.length === 0) {
      this.loadStatusesAndPriorities();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.titleControl.setValue(this.task.name ?? '', { emitEvent: false });
      this.descriptionControl.setValue(this.task.description ?? '', { emitEvent: false });
      this.commentControl.setValue('', { emitEvent: false });
      
      // Load full task details including comments if not already loaded
      if (this.task.id && (!this.task.comments || this.task.comments.length === 0)) {
        this.loadTaskComments();
      }
      
      // If statuses/priorities are not loaded, try to load them (will load global ones)
      if (this.statuses.length === 0 || this.priorities.length === 0) {
        this.loadStatusesAndPriorities();
      }
    }
    
    // Statuses and priorities are now properly handled
  }

  /**
   * Load task statuses and priority labels (fallback if not provided by parent)
   */
  private loadStatusesAndPriorities(projectId?: number): void {
    forkJoin({
      statuses: this.taskStatusService.getTaskStatuses(projectId || null),
      priorities: this.priorityLabelService.getPriorityLabels(projectId || null)
    })
      .pipe(take(1))
      .subscribe({
        next: ({ statuses, priorities }) => {
          // Only update if arrays are still empty (don't override parent-provided data)
          if (this.statuses.length === 0) {
            this.statuses = statuses;
          }
          if (this.priorities.length === 0) {
            this.priorities = priorities;
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading task statuses and priority labels in task-detail:', error);
        }
      });
  }

  /**
   * Load task comments from API
   */
  private loadTaskComments(): void {
    if (!this.task?.id) return;
    
    this.loading = true;
    this.taskService.getTaskComments(this.task.id).subscribe({
      next: (comments) => {
        if (this.task) {
          this.task = {
            ...this.task,
            comments,
            commentsCount: comments.length
          };
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.loading = false;
      }
    });
  }

  onTitleBlur(): void {
    if (!this.task) {
      return;
    }
    const value = this.titleControl.value.trim();
    if (value && value !== this.task.name) {
      this.taskUpdated.emit({ changes: { name: value } });
    } else {
      this.titleControl.setValue(this.task.name, { emitEvent: false });
    }
  }

  updateDueDate(rawValue: string): void {
    if (!this.task || !rawValue) {
      return;
    }

    const formatted = this.normalizeDate(rawValue);
    if (!formatted) {
      return;
    }

    const current = this.normalizeDate(this.task.dueDate);
    if (formatted === current) {
      return;
    }

    const iso = this.toIsoDate(formatted);
    this.taskUpdated.emit({ changes: { dueDate: iso } });
  }

  updatePriority(priorityId: number | string | null): void {
    if (!this.task) {
      return;
    }
    
    // Handle null, string, or number input
    let priorityIdNum: number | null = null;
    if (priorityId === null || priorityId === 'null' || priorityId === '') {
      priorityIdNum = null;
    } else {
      priorityIdNum = typeof priorityId === 'string' ? parseInt(priorityId) : priorityId;
      if (isNaN(priorityIdNum)) {
        priorityIdNum = null;
      }
    }
    
    // Only update if the value actually changed
    if (priorityIdNum === this.task.priority_label_id) {
      return;
    }
    
    // Update local task optimistically with full priorityLabel object
    const updatedPriorityLabel = this.priorities.find(p => p.id === priorityIdNum);
    if (updatedPriorityLabel) {
      this.task = {
        ...this.task,
        priority_label_id: priorityIdNum,
        priorityLabel: updatedPriorityLabel,
        priority: updatedPriorityLabel.name as TaskPriorityLegacy
      };
    } else if (priorityIdNum === null) {
      // Handle null case (removing priority)
      this.task = {
        ...this.task,
        priority_label_id: null,
        priorityLabel: undefined,
        priority: undefined
      };
    }
    this.cdr.markForCheck();
    
    // Emit ONLY priority_label_id change - do not include task_status_id
    this.taskUpdated.emit({ 
      changes: { 
        priority_label_id: priorityIdNum
        // Explicitly NOT including task_status_id here
      } 
    });
  }

  updateStatus(statusId: number | string | null): void {
    if (!this.task) {
      return;
    }
    
    // Handle null, string, or number input
    let statusIdNum: number | null = null;
    if (statusId === null || statusId === 'null' || statusId === '') {
      statusIdNum = null;
    } else {
      statusIdNum = typeof statusId === 'string' ? parseInt(statusId) : statusId;
      if (isNaN(statusIdNum)) {
        statusIdNum = null;
      }
    }
    
    // Only update if the value actually changed
    if (statusIdNum === this.task.task_status_id) {
      return;
    }
    
    // Update local task optimistically with full taskStatus object
    const updatedTaskStatus = this.statuses.find(s => s.id === statusIdNum);
    if (updatedTaskStatus) {
      this.task = {
        ...this.task,
        task_status_id: statusIdNum,
        taskStatus: updatedTaskStatus,
        status: updatedTaskStatus.name as TaskStatusLegacy
      };
    } else if (statusIdNum === null) {
      // Handle null case (removing status)
      this.task = {
        ...this.task,
        task_status_id: null,
        taskStatus: undefined,
        status: undefined
      };
    }
    this.cdr.markForCheck();
    
    // Emit ONLY task_status_id change - do not include priority_label_id
    this.taskUpdated.emit({ 
      changes: { 
        task_status_id: statusIdNum
        // Explicitly NOT including priority_label_id here
      } 
    });
  }

  /**
   * Get current priority label ID for display
   */
  getCurrentPriorityId(): number | null {
    return this.task?.priority_label_id ?? null;
  }

  /**
   * Get current task status ID for display
   */
  getCurrentStatusId(): number | null {
    return this.task?.task_status_id ?? null;
  }

  /**
   * Get current priority name for display
   */
  getCurrentPriorityName(): string | undefined {
    if (this.task?.priorityLabel?.name) {
      return this.task.priorityLabel.name;
    }
    if (this.task?.priority_label_id !== undefined && this.task.priority_label_id !== null) {
      const priority = this.priorities.find(p => p.id === this.task!.priority_label_id);
      if (priority?.name) {
        return priority.name;
      }
    }
    return this.task?.priority;
  }

  /**
   * Get current priority color for display
   */
  getCurrentPriorityColor(): string {
    if (this.task?.priorityLabel?.color) {
      return this.task.priorityLabel.color;
    }
    if (this.task?.priority_label_id !== undefined && this.task.priority_label_id !== null) {
      const priority = this.priorities.find(p => p.id === this.task!.priority_label_id);
      if (priority?.color) {
        return priority.color;
      }
    }
    // Fallback based on priority name
    const priorityName = this.getCurrentPriorityName()?.toLowerCase() || '';
    if (priorityName === 'high' || priorityName === 'critical' || priorityName === 'urgent') {
      return '#ef4444';
    } else if (priorityName === 'medium') {
      return '#3b82f6';
    }
    return '#10b981'; // Low
  }

  /**
   * Get current status name for display
   */
  getCurrentStatusName(): string | undefined {
    if (this.task?.taskStatus?.name) {
      return this.task.taskStatus.name;
    }
    if (this.task?.task_status_id !== undefined && this.task.task_status_id !== null) {
      const status = this.statuses.find(s => s.id === this.task!.task_status_id);
      if (status?.name) {
        return status.name;
      }
    }
    return this.task?.status;
  }

  /**
   * Get current status color for display
   */
  getCurrentStatusColor(): string {
    if (this.task?.taskStatus?.color) {
      return this.task.taskStatus.color;
    }
    if (this.task?.task_status_id !== undefined && this.task.task_status_id !== null) {
      const status = this.statuses.find(s => s.id === this.task!.task_status_id);
      if (status?.color) {
        return status.color;
      }
    }
    return '#6b7280'; // Default gray
  }

  /**
   * Get priority text color based on background color (for contrast)
   */
  getPriorityTextColor(bgColor: string): string {
    if (!bgColor) return '#000000';
    
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, dark for light
    return luminance < 0.5 ? '#ffffff' : '#000000';
  }

  /**
   * Track by function for status options
   */
  trackByStatusId(index: number, status: TaskStatus): number {
    return status.id;
  }

  /**
   * Track by function for priority options
   */
  trackByPriorityId(index: number, priority: PriorityLabel): number {
    return priority.id;
  }

  handleAssigneeSelect(item: DropdownPopoverItem): void {
    if (!this.task) {
      return;
    }
    const assignee = item.label;
    if (assignee === this.task.assignee) {
      return;
    }

    // Extract assigneeId from item data or use getAssigneeId function
    let assigneeId: number | undefined = undefined;
    if (item.data && typeof item.data === 'object' && 'id' in item.data) {
      assigneeId = (item.data as any).id;
    } else if (item.id) {
      // Try to parse ID from item.id (could be email or ID)
      const parsedId = parseInt(item.id);
      if (!isNaN(parsedId)) {
        assigneeId = parsedId;
      }
    }
    
    // Fallback to getAssigneeId function if available
    if (assigneeId === undefined && this.getAssigneeId) {
      assigneeId = this.getAssigneeId(assignee);
    }

    const update: Partial<Task> = {
      assignee
    };

    const initials = item.avatarText ?? this.getAssigneeInitials(assignee);
    if (initials) {
      (update as any).assigneeAvatar = initials;
    }

    this.taskUpdated.emit({ changes: update, assigneeId });
    this.task = {
      ...this.task,
      ...update
    };
  }

  handleSubtaskToggle(id: string): void {
    if (!this.task) {
      return;
    }
    const subtasks = (this.task.subtasks ?? []).map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    this.taskUpdated.emit({ changes: { subtasks } });
  }

  handleSubtaskNameChange(change: { id: string; name: string }): void {
    if (!this.task) {
      return;
    }
    const subtasks = (this.task.subtasks ?? []).map(item =>
      item.id === change.id ? { ...item, name: change.name } : item
    );
    this.taskUpdated.emit({ changes: { subtasks } });
  }

  handleSubtaskRemove(id: string): void {
    if (!this.task) {
      return;
    }
    const next = (this.task.subtasks ?? []).filter(item => item.id !== id);
    this.taskUpdated.emit({ changes: { subtasks: next } });
  }

  handleSubtaskCreate(name: string): void {
    if (!this.task) {
      return;
    }
    const next: Task[] = [
      ...(this.task.subtasks ?? []),
      {
        id: `subtask-${Date.now()}`,
        name,
        assignee: '',
        dueDate: undefined,
        priority_label_id: null,
        task_status_id: null,
        completed: false,
        subtasks: [],
        parentId: this.task.id
      }
    ];
    this.taskUpdated.emit({ changes: { subtasks: next } });
  }

  handleSubtaskOpen(subtask: Task): void {
    if (!this.task) {
      return;
    }
    this.subtaskOpen.emit({ parentTaskId: this.task.id, subtask });
  }

  handleDescriptionSave(value: string): void {
    if (!this.task) {
      return;
    }
    const normalized = (value ?? '').trim();
    const current = (this.task.description ?? '').trim();
    if (normalized === current) {
      return;
    }
    this.descriptionControl.setValue(normalized, { emitEvent: false });
    this.taskUpdated.emit({ changes: { description: normalized } });
  }

  get descriptionMeta(): string | null {
    if (!this.task) {
      return null;
    }
    return this.task.description ? 'Edited just now' : 'No description yet';
  }

  addComment(): void {
    if (!this.task) {
      return;
    }
    const value = this.commentControl.value.trim();
    if (!value) {
      return;
    }

    this.loading = true;
    this.taskService.createTaskComment(this.task.id, value).subscribe({
      next: (newComment) => {
        const nextComments = [
          ...(this.task?.comments ?? []),
          newComment
        ];

        if (this.task) {
          this.task = {
            ...this.task,
            comments: nextComments,
            commentsCount: nextComments.length
          };
        }

        this.taskUpdated.emit({ changes: { comments: nextComments } });
        this.commentControl.setValue('', { emitEvent: false });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.loading = false;
      }
    });
  }

  toDateInputValue(dateString: string | undefined): string {
    if (!dateString) {
      return '';
    }
    const normalized = this.normalizeDate(dateString);
    return normalized ?? '';
  }

  private normalizeDate(value: string): string | null {
    if (!value) {
      return null;
    }
    if (value.length >= 10) {
      return value.substring(0, 10);
    }
    return null;
  }

  private toIsoDate(normalized: string): string {
    return `${normalized}T00:00:00.000Z`;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }

  getAssigneeDescription(assignee: string | undefined): string | undefined {
    if (!assignee) {
      return undefined;
    }
    const match = this.assigneeItems.find(item => item.label === assignee || item.id === assignee);
    return match?.description;
  }

  /**
   * Handle task action selection from dropdown menu
   */
  handleTaskAction(item: DropdownPopoverItem): void {
    if (!this.task) {
      return;
    }

    switch (item.id) {
      case 'delete':
        this.deleteTask();
        break;
      // Add more actions here in the future
      default:
        console.warn('Unknown task action:', item.id);
    }
  }

  /**
   * Delete task
   */
  deleteTask(): void {
    if (!this.task) {
      return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    this.deleting = true;
    this.cdr.markForCheck();
    
    this.taskApiService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.taskDeleted.emit(this.task!.id);
        this.close.emit();
        this.deleting = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
        this.deleting = false;
        this.cdr.markForCheck();
      }
    });
  }
}

