import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Task, TaskSection } from '../../../../task.model';
import { DropdownPopoverItem } from '../../../../../../shared/ui/dropdown-popover/dropdown-popover.component';

@Component({
  selector: 'app-task-row',
  templateUrl: './task-row.component.html',
  styleUrls: ['./task-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskRowComponent {
  @Input() task!: Task;
  @Input() section!: TaskSection;
  @Input() selected = false;
  @Input() nameDraft?: string;

  @Input() assigneeItems: DropdownPopoverItem[] = [];
  @Input() priorityItems: DropdownPopoverItem[] = [];
  @Input() statusItems: DropdownPopoverItem[] = [];

  // helpers from parent
  @Input() getAssigneeAvatar!: (assignee: string | undefined) => string | null;
  @Input() getAssigneeInitials!: (assignee: string | undefined) => string;
  @Input() getAssigneeColor!: (assignee: string | undefined) => string | undefined;
  @Input() formatDueDate!: (value: string | undefined) => string;
  @Input() getDueDate!: (task: Task) => Date | null;
  @Input() getStatusColor!: (status: string | undefined) => string;
  @Input() getStatusLabel!: (status: string | undefined) => string;

  @Output() rowClick = new EventEmitter<void>();
  @Output() toggleCompleted = new EventEmitter<void>();
  @Output() nameChange = new EventEmitter<string>();
  @Output() assigneeSelect = new EventEmitter<DropdownPopoverItem>();
  @Output() dueDateChange = new EventEmitter<Date | null>();
  @Output() prioritySelect = new EventEmitter<DropdownPopoverItem>();
  @Output() statusSelect = new EventEmitter<DropdownPopoverItem>();
}


