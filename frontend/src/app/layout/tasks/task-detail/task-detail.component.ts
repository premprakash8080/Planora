import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Task, TaskPriority, TaskStatus, TaskSubtask } from '../task.model';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent implements OnChanges {
  @Input() task: Task | null = null;
  @Input() projectName = '';
  @Input() sectionTitle = '';
  @Input() open = false;
  @Input() statuses: TaskStatus[] = [];
  @Input() priorities: TaskPriority[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Partial<Task>>();

  readonly titleControl = new FormControl<string>('', { nonNullable: true });
  readonly descriptionControl = new FormControl<string>('', { nonNullable: true });
  readonly newSubtaskControl = new FormControl<string>('', { nonNullable: true });
  readonly commentControl = new FormControl<string>('', { nonNullable: true });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.titleControl.setValue(this.task.name ?? '', { emitEvent: false });
      this.descriptionControl.setValue(this.task.description ?? '', { emitEvent: false });
      this.newSubtaskControl.setValue('', { emitEvent: false });
      this.commentControl.setValue('', { emitEvent: false });
    }
  }

  onTitleBlur(): void {
    if (!this.task) {
      return;
    }
    const value = this.titleControl.value.trim();
    if (value && value !== this.task.name) {
      this.taskUpdated.emit({ name: value });
    } else {
      this.titleControl.setValue(this.task.name, { emitEvent: false });
    }
  }

  onDescriptionBlur(): void {
    if (!this.task) {
      return;
    }
    const value = this.descriptionControl.value.trim();
    if (value !== (this.task.description ?? '')) {
      this.taskUpdated.emit({ description: value });
    }
  }

  updateAssignee(rawValue: string): void {
    if (!this.task) {
      return;
    }
    const value = rawValue.trim();
    if (value && value !== this.task.assignee) {
      this.taskUpdated.emit({ assignee: value });
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
    this.taskUpdated.emit({ dueDate: iso });
  }

  updatePriority(priority: TaskPriority | string): void {
    if (!this.task) {
      return;
    }
    const next = priority as TaskPriority;
    if (next === this.task.priority) {
      return;
    }
    this.taskUpdated.emit({ priority: next });
  }

  updateStatus(status: TaskStatus | string): void {
    if (!this.task) {
      return;
    }
    const next = status as TaskStatus;
    if (next === this.task.status) {
      return;
    }
    this.taskUpdated.emit({ status: next });
  }

  toggleSubtask(subtask: TaskSubtask): void {
    if (!this.task) {
      return;
    }
    const subtasks = (this.task.subtasks ?? []).map(item =>
      item.id === subtask.id ? { ...item, completed: !item.completed } : item
    );
    this.taskUpdated.emit({ subtasks });
  }

  addSubtask(): void {
    if (!this.task) {
      return;
    }
    const value = this.newSubtaskControl.value.trim();
    if (!value) {
      return;
    }

    const nextSubtasks = [
      ...(this.task.subtasks ?? []),
      {
        id: `subtask-${Date.now()}`,
        title: value,
        completed: false
      }
    ];

    this.taskUpdated.emit({ subtasks: nextSubtasks });
    this.newSubtaskControl.setValue('', { emitEvent: false });
  }

  addComment(): void {
    if (!this.task) {
      return;
    }
    const value = this.commentControl.value.trim();
    if (!value) {
      return;
    }

    const nextComments = [
      ...(this.task.comments ?? []),
      {
        id: `comment-${Date.now()}`,
        author: 'You',
        message: value,
        createdAt: new Date().toISOString()
      }
    ];

    this.taskUpdated.emit({ comments: nextComments });
    this.commentControl.setValue('', { emitEvent: false });
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
}

