import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Task } from '../task.model';

type DueDateState = 'empty' | 'overdue' | 'today' | 'upcoming';

@Component({
  selector: 'app-subtask-list',
  templateUrl: './subtask-list.component.html',
  styleUrls: ['./subtask-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubtaskListComponent implements OnChanges, AfterViewInit {
  @Input() subtasks: Task[] | null = [];
  @Input() allowAssignee = true;
  @Input() allowDueDate = true;

  @Output() toggle = new EventEmitter<string>();
  @Output() nameChange = new EventEmitter<{ id: string; name: string }>();
  @Output() remove = new EventEmitter<string>();
  @Output() create = new EventEmitter<string>();
  @Output() subtaskOpen = new EventEmitter<Task>();
  @Output() assigneeClick = new EventEmitter<Task>();

  @ViewChild('listContainer') private listContainer?: ElementRef<HTMLDivElement>;

  readonly newSubtaskControl = new FormControl<string>('', { nonNullable: true });

  private drafts = new Map<string, string>();
  private previousLength = 0;
  private readonly dueDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  });

  ngAfterViewInit(): void {
    this.previousLength = this.subtasks?.length ?? 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['subtasks']) {
      return;
    }

    const next = this.subtasks ?? [];
    const ids = new Set(next.map(subtask => subtask.id));

    // Remove drafts for subtasks that no longer exist.
    Array.from(this.drafts.keys()).forEach(id => {
      if (!ids.has(id)) {
        this.drafts.delete(id);
      }
    });

    // Seed drafts for new subtasks.
    next.forEach(subtask => {
      if (!this.drafts.has(subtask.id)) {
        this.drafts.set(subtask.id, subtask.name);
      }
    });

    if ((this.previousLength ?? 0) < next.length) {
      this.scrollToBottomSoon();
    }
    this.previousLength = next.length;
  }

  getDraft(subtask: Task): string {
    return this.drafts.get(subtask.id) ?? subtask.name;
  }

  getAssigneeInitials(subtask: Task): string {
    const value = subtask.assignee?.trim() ?? '';
    if (!value) {
      return '+';
    }
    const parts = value.split(' ').filter(Boolean);
    if (!parts.length) {
      return value.substring(0, 2).toUpperCase();
    }
    return parts.map(part => part.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  getDueDateLabel(subtask: Task): string {
    const state = this.getDueDateState(subtask);
    if (state === 'empty') {
      return 'Set due date';
    }

    const due = this.parseDueDate(subtask);
    if (!due) {
      return 'Set due date';
    }

    switch (state) {
      case 'overdue':
        return `Overdue · ${this.dueDateFormatter.format(due)}`;
      case 'today':
        return 'Due today';
      case 'upcoming': {
        const diff = this.diffInDays(due);
        if (diff === 1) {
          return 'Due tomorrow';
        }
        if (diff <= 7) {
          return `Due in ${diff} days`;
        }
        return this.dueDateFormatter.format(due);
      }
      default:
        return this.dueDateFormatter.format(due);
    }
  }

  getDueDateClass(subtask: Task): string {
    switch (this.getDueDateState(subtask)) {
      case 'overdue':
        return 'subtask-row__due-date subtask-row__due-date--overdue';
      case 'today':
        return 'subtask-row__due-date subtask-row__due-date--today';
      case 'upcoming':
        return 'subtask-row__due-date subtask-row__due-date--scheduled';
      default:
        return 'subtask-row__due-date subtask-row__due-date--empty';
    }
  }

  handleToggle(subtask: Task): void {
    this.toggle.emit(subtask.id);
  }

  handleNameInput(subtask: Task, rawValue: string): void {
    this.drafts.set(subtask.id, rawValue);
  }

  handleNameBlur(subtask: Task): void {
    const draft = (this.drafts.get(subtask.id) ?? '').trim();
    if (!draft) {
      this.drafts.set(subtask.id, subtask.name);
      return;
    }
    if (draft !== subtask.name) {
      this.nameChange.emit({ id: subtask.id, name: draft });
    }
  }

  handleNameKeydown(event: KeyboardEvent, subtask: Task): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleNameBlur(subtask);
      this.focusNewInputSoon();
      return;
    }

    if (event.key === 'Backspace') {
      const target = event.target as HTMLInputElement;
      if (target.value.trim() === '') {
        event.preventDefault();
        this.remove.emit(subtask.id);
      }
    }
  }

  handleAssigneeClick(subtask: Task, event: Event): void {
    event.stopPropagation();
    if (!this.allowAssignee) {
      return;
    }
    this.assigneeClick.emit(subtask);
  }

  handleDueDateOpen(subtask: Task, event: Event): void {
    event.stopPropagation();
    if (!this.allowDueDate) {
      return;
    }
    this.subtaskOpen.emit(subtask);
  }

  handleRowClick(subtask: Task, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.subtask-row__input')) {
      return;
    }
    this.subtaskOpen.emit(subtask);
  }

  handleRemoveClick(id: string, event: Event): void {
    event.stopPropagation();
    this.remove.emit(id);
  }

  handleCreateFromInput(): void {
    const value = this.newSubtaskControl.value.trim();
    if (!value) {
      return;
    }
    this.create.emit(value);
    this.newSubtaskControl.setValue('');
    this.scrollToBottomSoon();
    this.focusNewInputSoon();
  }

  handleAddKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleCreateFromInput();
      return;
    }

    if (event.key === 'Backspace' && !this.newSubtaskControl.value) {
      event.preventDefault();
      const last = (this.subtasks ?? []).at(-1);
      if (last) {
        this.remove.emit(last.id);
      }
    }
  }

  handleDragMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  focusNewInputSoon(): void {
    setTimeout(() => {
      const input = this.listContainer?.nativeElement.querySelector<HTMLInputElement>('.subtask-list__add-input');
      input?.focus();
    }, 40);
  }

  private scrollToBottomSoon(): void {
    setTimeout(() => {
      const el = this.listContainer?.nativeElement;
      if (!el) {
        return;
      }
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 80);
  }

  private getDueDateState(subtask: Task): DueDateState {
    const due = this.parseDueDate(subtask);
    if (!due) {
      return 'empty';
    }

    const today = this.startOfDay(new Date());
    const dueDay = this.startOfDay(due);
    const diff = Math.round((dueDay - today) / (24 * 60 * 60 * 1000));

    if (diff < 0) {
      return 'overdue';
    }
    if (diff === 0) {
      return 'today';
    }
    return 'upcoming';
  }

  private parseDueDate(subtask: Task): Date | null {
    if (!subtask.dueDate) {
      return null;
    }
    const candidate = new Date(subtask.dueDate);
    if (Number.isNaN(candidate.getTime())) {
      return null;
    }
    return candidate;
  }

  private diffInDays(date: Date): number {
    const today = this.startOfDay(new Date());
    const target = this.startOfDay(date);
    return Math.round((target - today) / (24 * 60 * 60 * 1000));
  }

  private startOfDay(date: Date): number {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy.getTime();
  }
}

