import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Task, TaskSection } from '../../../../task.model';
import { DropdownPopoverItem } from '../../../../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { DropdownPopoverComponent } from '../../../../../../shared/ui/dropdown-popover/dropdown-popover.component';

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
  @Input() formatDueDate!: (value: string | undefined) => string;
  @Input() getDueDate!: (task: Task) => Date | null;
  @Input() getStatusColor!: (status: string | undefined) => string;
  @Input() getStatusLabel!: (status: string | undefined) => string;

  @Input() assigneeItems: DropdownPopoverItem[] = [];
  @Input() priorityItems: DropdownPopoverItem[] = [];
  @Input() statusItems: DropdownPopoverItem[] = [];

  @Output() toggleSection = new EventEmitter<TaskSection>();
  @Output() openTaskDetail = new EventEmitter<{ section: TaskSection; task: Task }>();
  @Output() addTask = new EventEmitter<TaskSection>();
  @Output() updateSectionTitle = new EventEmitter<{ section: TaskSection; title: string }>();
  @Output() updateTaskName = new EventEmitter<{ section: TaskSection; task: Task; name: string }>();
  @Output() toggleCompleted = new EventEmitter<{ section: TaskSection; task: Task }>();
  @Output() assigneeSelect = new EventEmitter<{ section: TaskSection; task: Task; item: DropdownPopoverItem }>();
  @Output() dueDateChange = new EventEmitter<{ section: TaskSection; task: Task; date: Date | null }>();
  @Output() prioritySelect = new EventEmitter<{ section: TaskSection; task: Task; item: DropdownPopoverItem }>();
  @Output() statusSelect = new EventEmitter<{ section: TaskSection; task: Task; item: DropdownPopoverItem }>();

  trackTask = (_: number, t: Task) => t.id;

  onTitleChange(title: string) {
    this.updateSectionTitle.emit({ section: this.section, title });
  }

  onNameChange(task: Task, name: string) {
    this.updateTaskName.emit({ section: this.section, task, name });
  }

  onAssigneeSelect(task: Task, item: DropdownPopoverItem) {
    this.assigneeSelect.emit({ section: this.section, task, item });
  }

  onDueDateChange(task: Task, date: Date | null, _popover?: DropdownPopoverComponent) {
    this.dueDateChange.emit({ section: this.section, task, date });
  }

  onPrioritySelect(task: Task, item: DropdownPopoverItem) {
    this.prioritySelect.emit({ section: this.section, task, item });
  }

  onStatusSelect(task: Task, item: DropdownPopoverItem) {
    this.statusSelect.emit({ section: this.section, task, item });
  }
}


