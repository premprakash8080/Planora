import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Task, TaskSection } from '../../../../../task.model';
import { DropdownPopoverItem } from '../../../../../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-row',
  templateUrl: './task-row.component.html',
  styleUrls: ['./task-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskRowComponent {
  @Input() set task(value: Task) {
    this._task = value;
    // Sync localNameDraft when task changes (if not currently being edited)
    if (value && !this.localNameDraft) {
      this.localNameDraft = value.name ?? '';
    }
    // Debug: Log task data to verify objects are present
    // if (value) {
    //   console.log('TaskRow - Task received:', {
    //     id: value.id,
    //     name: value.name,
    //     priority_label_id: value.priority_label_id,
    //     task_status_id: value.task_status_id,
    //     priorityLabel: value.priorityLabel,
    //     taskStatus: value.taskStatus,
    //     priority: value.priority,
    //     status: value.status
    //   });
    // }
  }
  get task(): Task {
    return this._task;
  }
  private _task!: Task;
  @Input() section!: TaskSection;
  @Input() selected = false;
  @Input() set nameDraft(value: string | undefined) {
    this.localNameDraft = value ?? this.task?.name ?? '';
  }
  get nameDraft(): string {
    return this.localNameDraft ?? this.task?.name ?? '';
  }
  localNameDraft: string = '';

  @Input() assigneeItems: DropdownPopoverItem[] = [];
  @Input() priorityItems: DropdownPopoverItem[] = [];
  @Input() statusItems: DropdownPopoverItem[] = [];
  @Input() gridTemplateColumns: string = '';

  // helpers from parent
  @Input() getAssigneeAvatar!: (assignee: string | undefined) => string | null;
  @Input() getAssigneeInitials!: (assignee: string | undefined) => string;
  @Input() getAssigneeColor!: (assignee: string | undefined) => string | undefined;
  @Input() formatStartDate!: (value: string | undefined) => string;
  @Input() getStartDate!: (task: Task) => Date | null;
  @Input() formatDueDate!: (value: string | undefined) => string;
  @Input() getDueDate!: (task: Task) => Date | null;
  @Input() getStatusColor!: (status: string | undefined, task?: Task) => string;
  @Input() getStatusLabel!: (status: string | undefined, task?: Task) => string;

  @Output() rowClick = new EventEmitter<void>();
  @Output() toggleCompleted = new EventEmitter<void>();
  @Output() nameChange = new EventEmitter<string>();
  @Output() assigneeSelect = new EventEmitter<DropdownPopoverItem>();
  @Output() startDateChange = new EventEmitter<Date | null>();
  @Output() dueDateChange = new EventEmitter<Date | null>();
  @Output() dateRangeChange = new EventEmitter<{ start: Date | null; end: Date | null }>();
  @Output() prioritySelect = new EventEmitter<DropdownPopoverItem>();
  @Output() statusSelect = new EventEmitter<DropdownPopoverItem>();

  isDragging = false;

  /**
   * Get priority ID for dropdown selection
   */
  getPriorityId(): string | null {
    // First check if priority_label_id exists
    if (this.task.priority_label_id !== undefined && this.task.priority_label_id !== null) {
      return this.task.priority_label_id.toString();
    }
    // If priorityLabel object exists, use its ID
    if (this.task.priorityLabel?.id) {
      return this.task.priorityLabel.id.toString();
    }
    // Fallback to legacy priority if available
    if (this.task.priority) {
      const priorityItem = this.priorityItems.find(item => item.label === this.task.priority);
      return priorityItem?.id?.toString() || null;
    }
    return null;
  }

  /**
   * Get priority name for display
   */
  getPriorityName(): string {
    // Priority 1: Use priorityLabel object if available (most reliable)
    if (this.task.priorityLabel?.name) {
      return this.task.priorityLabel.name;
    }
    // Priority 2: Try to find in priorityItems by ID
    if (this.task.priority_label_id !== undefined && this.task.priority_label_id !== null) {
      const priorityItem = this.priorityItems.find(item => {
        const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
        return itemId === this.task.priority_label_id;
      });
      if (priorityItem?.label) {
        return priorityItem.label;
      }
    }
    // Priority 3: Fallback to legacy priority field
    if (this.task.priority) {
      return this.task.priority;
    }
    // Default fallback
    return 'Low';
  }

  /**
   * Get status ID for dropdown selection
   */
  getStatusId(): string | null {
    // First check if task_status_id exists
    if (this.task.task_status_id !== undefined && this.task.task_status_id !== null) {
      return this.task.task_status_id.toString();
    }
    // If taskStatus object exists, use its ID
    if (this.task.taskStatus?.id) {
      return this.task.taskStatus.id.toString();
    }
    // Fallback to legacy status if available
    if (this.task.status) {
      const statusItem = this.statusItems.find(item => item.label === this.task.status);
      return statusItem?.id?.toString() || null;
    }
    return null;
  }

  /**
   * Get status name for display
   */
  getStatusName(): string | undefined {
    // Priority 1: Use taskStatus object if available (most reliable)
    if (this.task.taskStatus?.name) {
      return this.task.taskStatus.name;
    }
    // Priority 2: Try to find in statusItems by ID
    if (this.task.task_status_id !== undefined && this.task.task_status_id !== null) {
      const statusItem = this.statusItems.find(item => {
        const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
        return itemId === this.task.task_status_id;
      });
      if (statusItem?.label) {
        return statusItem.label;
      }
    }
    // Priority 3: Fallback to legacy status field
    if (this.task.status) {
      return this.task.status;
    }
    // Default fallback
    return undefined;
  }

  /**
   * Get status color for display
   */
  getStatusColorValue(): string {
    // Use taskStatus object color if available
    if (this.task.taskStatus?.color) {
      return this.task.taskStatus.color;
    }
    // Fallback to helper function with legacy status
    return this.getStatusColor(this.task.status, this.task);
  }

  /**
   * Get priority color for display
   * This function should ONLY depend on priority data, never on status
   */
  getPriorityColorValue(): string {
    // Priority 1: Use priorityLabel object color if available (most reliable)
    if (this.task.priorityLabel?.color) {
      return this.task.priorityLabel.color;
    }
    // Priority 2: Try to find in priorityItems by ID
    if (this.task.priority_label_id !== undefined && this.task.priority_label_id !== null) {
      const priorityItem = this.priorityItems.find(item => {
        const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
        return itemId === this.task.priority_label_id;
      });
      if (priorityItem?.color) {
        return priorityItem.color;
      }
    }
    // Priority 3: Fallback to default based on priority name
    const priorityName = this.getPriorityName().toLowerCase();
    if (priorityName === 'high' || priorityName === 'critical' || priorityName === 'urgent') {
      return '#ef4444';
    } else if (priorityName === 'medium') {
      return '#3b82f6';
    }
    return '#10b981'; // Low
  }

  /**
   * Get priority text color (white for dark backgrounds, dark for light)
   */
  getPriorityTextColor(): string {
    const bgColor = this.getPriorityColorValue();
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
   * Check if task has any date (start or due)
   */
  hasDate(): boolean {
    return !!(this.task.startDate || this.task.dueDate);
  }

  /**
   * Check if it's a single date (only dueDate, or startDate === dueDate)
   */
  isSingleDate(): boolean {
    if (!this.task.dueDate) return false;
    if (!this.task.startDate) return true;
    return this.task.startDate === this.task.dueDate;
  }

  /**
   * Check if it's a date range (startDate !== dueDate)
   */
  isDateRange(): boolean {
    return !!(this.task.startDate && this.task.dueDate && this.task.startDate !== this.task.dueDate);
  }

  /**
   * Check if due date is today
   */
  isToday(): boolean {
    if (!this.task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }

  /**
   * Check if due date is in the past
   */
  isOverdue(): boolean {
    if (!this.task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() < today.getTime() && !this.isToday();
  }

  /**
   * Handle date range change from picker
   */
  onDateRangeChange(range: { start: Date | null; end: Date | null }, popover?: any): void {
    // Emit the date range change event
    this.dateRangeChange.emit(range);
    
    if (popover) {
      popover.close();
    }
  }

  /**
   * Format date for display based on rules
   */
  getFormattedDate(): string {
    if (!this.task.dueDate) return '';

    const dueDate = new Date(this.task.dueDate);
    const startDate = this.task.startDate ? new Date(this.task.startDate) : null;

    // If only dueDate or startDate === dueDate, show single date
    if (!startDate || this.isSameDay(startDate, dueDate)) {
      if (this.isToday()) {
        return 'Today';
      }
      return this.formatShortDate(dueDate);
    }

    // If range, show "Nov 25 – 28" or "Nov 25 – Dec 5"
    const startFormatted = this.formatShortDate(startDate);
    const dueFormatted = this.formatShortDate(dueDate);

    // If same month, show "Nov 25 – 28"
    if (startDate.getMonth() === dueDate.getMonth() && startDate.getFullYear() === dueDate.getFullYear()) {
      return `${startFormatted} – ${dueDate.getDate()}`;
    }

    // Different months or years, show "Nov 25 – Dec 5"
    return `${startFormatted} – ${dueFormatted}`;
  }

  /**
   * Format date as "Nov 25" or "Nov 25, 2024" if different year
   */
  private formatShortDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    if (year !== currentYear) {
      return `${month} ${day}, ${year}`;
    }
    return `${month} ${day}`;
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Handle drag start
   */
  onDragStarted(): void {
    this.isDragging = true;
  }

  /**
   * Handle drag end
   */
  onDragEnded(_event: CdkDragEnd): void {
    this.isDragging = false;
    // Event is handled by parent via cdkDropListDropped
  }

}


