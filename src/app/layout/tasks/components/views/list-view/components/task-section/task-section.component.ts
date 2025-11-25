import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Task, TaskSection } from '../../../../../task.model';
import { DropdownPopoverItem } from '../../../../../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { DropdownPopoverComponent } from '../../../../../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-section',
  templateUrl: './task-section.component.html',
  styleUrls: ['./task-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskSectionComponent {
  @Input() section!: TaskSection;
  @Input() selectedTask: Task | null = null;
  @Input() nameDrafts!: Map<string, string>;
  @Input() sectionTitleDrafts!: Map<string, string>;

  // Helper fns from parent for display
  @Input() getAssigneeAvatar!: (assignee: string | undefined) => string | null;
  @Input() getAssigneeInitials!: (assignee: string | undefined) => string;
  @Input() getAssigneeColor!: (assignee: string | undefined) => string | undefined;
  @Input() formatStartDate!: (value: string | undefined) => string;
  @Input() getStartDate!: (task: Task) => Date | null;
  @Input() formatDueDate!: (value: string | undefined) => string;
  @Input() getDueDate!: (task: Task) => Date | null;
  @Input() getStatusColor!: (status: string | undefined) => string;
  @Input() getStatusLabel!: (status: string | undefined) => string;

  @Input() assigneeItems: DropdownPopoverItem[] = [];
  @Input() priorityItems: DropdownPopoverItem[] = [];
  @Input() statusItems: DropdownPopoverItem[] = [];
  @Input() gridTemplateColumns: string = '';

  @Output() toggleSection = new EventEmitter<TaskSection>();
  @Output() openTaskDetail = new EventEmitter<{ section: TaskSection; task: Task }>();
  @Output() addTask = new EventEmitter<TaskSection>();
  @Output() updateSectionTitle = new EventEmitter<{ section: TaskSection; title: string }>();
  @Output() updateTaskName = new EventEmitter<{ section: TaskSection; task: Task; name: string }>();
  @Output() toggleCompleted = new EventEmitter<{ section: TaskSection; task: Task }>();
  @Output() assigneeSelect = new EventEmitter<{ section: TaskSection; task: Task; item: DropdownPopoverItem }>();
  @Output() startDateChange = new EventEmitter<{ section: TaskSection; task: Task; date: Date | null }>();
  @Output() dueDateChange = new EventEmitter<{ section: TaskSection; task: Task; date: Date | null }>();
  @Output() dateRangeChange = new EventEmitter<{ section: TaskSection; task: Task; range: { start: Date | null; end: Date | null } }>();
  @Output() prioritySelect = new EventEmitter<{ section: TaskSection; task: Task; item: DropdownPopoverItem }>();
  @Output() statusSelect = new EventEmitter<{ section: TaskSection; task: Task; item: DropdownPopoverItem }>();
  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();

  isDropZoneActive = false;
  private localTitleDraft: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  trackTask = (_: number, t: Task) => t.id;

  /**
   * Get tasks sorted by position to ensure correct ordering
   * This is a safety measure in case the backend order isn't preserved
   */
  getSortedTasks(): Task[] {
    if (!this.section?.tasks) {
      return [];
    }
    return [...this.section.tasks].sort((a, b) => {
      // Sort by position (ascending), with fallback for tasks without position
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;
      return posA - posB;
    });
  }

  onTitleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.localTitleDraft = value;
    // Update the draft in the parent's map
    this.sectionTitleDrafts.set(this.section.id, value);
    // Manually trigger change detection to update the view
    this.cdr.markForCheck();
  }

  onTitleFocus(): void {
    if (!this.localTitleDraft) {
      this.localTitleDraft = this.section.title ?? '';
      if (!this.sectionTitleDrafts.has(this.section.id)) {
        this.sectionTitleDrafts.set(this.section.id, this.localTitleDraft);
      }
    }
  }

  onTitleBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const draft = (this.localTitleDraft ?? input.value ?? '').trim();
    
    if (!draft) {
      input.value = this.section.title ?? '';
      this.localTitleDraft = null;
      this.sectionTitleDrafts.delete(this.section.id);
      this.cdr.markForCheck();
      return;
    }

    if (draft !== (this.section.title ?? '')) {
      this.updateSectionTitle.emit({ section: this.section, title: draft });
    }

    this.localTitleDraft = null;
    this.sectionTitleDrafts.delete(this.section.id);
    this.cdr.markForCheck();
  }

  onTitleEnter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    this.onTitleBlur(event);
    input.blur();
  }

  onTitleEscape(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.section.title ?? '';
    this.localTitleDraft = null;
    this.sectionTitleDrafts.delete(this.section.id);
    input.blur();
    this.cdr.markForCheck();
  }

  getSectionTitleWidth(): number {
    const draft = this.localTitleDraft ?? this.sectionTitleDrafts.get(this.section.id) ?? this.section.title ?? '';
    const text = draft.trim() || 'New Section';
    const baseLength = Math.max(text.length, 1);
    const padding = 24;
    const minWidth = 100;
    const maxWidth = 400;
    const approximateCharWidth = 8.5;
    return Math.min(Math.max(baseLength * approximateCharWidth + padding, minWidth), maxWidth);
  }

  onNameChange(task: Task, name: string) {
    this.updateTaskName.emit({ section: this.section, task, name });
  }

  onAssigneeSelect(task: Task, item: DropdownPopoverItem) {
    this.assigneeSelect.emit({ section: this.section, task, item });
  }

  onStartDateChange(task: Task, date: Date | null, _popover?: DropdownPopoverComponent) {
    this.startDateChange.emit({ section: this.section, task, date });
  }

  onDueDateChange(task: Task, date: Date | null, _popover?: DropdownPopoverComponent) {
    this.dueDateChange.emit({ section: this.section, task, date });
  }

  onDateRangeChange(task: Task, range: { start: Date | null; end: Date | null }) {
    this.dateRangeChange.emit({ section: this.section, task, range });
  }

  onPrioritySelect(task: Task, item: DropdownPopoverItem) {
    this.prioritySelect.emit({ section: this.section, task, item });
  }

  onStatusSelect(task: Task, item: DropdownPopoverItem) {
    this.statusSelect.emit({ section: this.section, task, item });
  }

  onTaskDropped(event: CdkDragDrop<Task[]>): void {
    this.isDropZoneActive = false;
    // CRITICAL: Add section information to the event for reliable section identification
    // This ensures the parent component knows which section the task was dropped into
    (event as any).sectionId = this.section.id;
    // Also add it to the container for extra reliability
    (event.container as any).sectionId = this.section.id;
    this.taskDropped.emit(event);
  }

  onDropZoneEntered(): void {
    this.isDropZoneActive = true;
    this.cdr.markForCheck();
  }

  onDropZoneExited(): void {
    this.isDropZoneActive = false;
    this.cdr.markForCheck();
  }
}


