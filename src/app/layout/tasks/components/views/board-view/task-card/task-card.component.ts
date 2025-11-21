import { Component, Input } from '@angular/core';
import { BoardViewTask } from '../../../../services/board-view.service';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task!: BoardViewTask;

  getPriorityStyles(): Record<string, string> {
    return this.getPillStyles(this.task.priorityLabel?.color);
  }

  getStatusStyles(): Record<string, string> {
    return this.getPillStyles(this.task.status?.color);
  }

  getDueDateLabel(): string | null {
    return this.task.dueDateDisplay || this.task.dueDate || null;
  }

  getAssigneeInitials(): string | null {
    if (this.task.assigneeInitials) {
      return this.task.assigneeInitials;
    }
    if (this.task.assigneeName) {
      return this.task.assigneeName
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    return null;
  }

  private getPillStyles(color?: string | null): Record<string, string> {
    if (!color) {
      return {};
    }
    return {
      'background-color': color,
      color: this.getContrastColor(color),
    };
  }

  private getContrastColor(hexColor: string): string {
    if (!hexColor) {
      return '#111827';
    }
    const normalized = hexColor.replace('#', '');
    const expanded = normalized.length === 3
      ? normalized
          .split('')
          .map(char => char + char)
          .join('')
      : normalized.padEnd(6, '0');

    const numeric = parseInt(expanded, 16);
    if (Number.isNaN(numeric)) {
      return '#111827';
    }

    const r = (numeric >> 16) & 255;
    const g = (numeric >> 8) & 255;
    const b = numeric & 255;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#111827' : '#f8fafc';
  }
}