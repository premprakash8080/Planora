import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectMessage } from '../../../../../services/project-messages.service';

@Component({
  selector: 'app-pinned-messages',
  templateUrl: './pinned-messages.component.html',
  styleUrls: ['./pinned-messages.component.scss']
})
export class PinnedMessagesComponent {
  @Input() messages: ProjectMessage[] = [];
  @Input() editingMessageId: string | null = null;
  @Input() editingContent = '';
  @Input() canEdit: ((message: ProjectMessage) => boolean) | boolean = false;
  @Input() canDelete: ((message: ProjectMessage) => boolean) | boolean = false;
  @Input() canPin = false;
  @Input() isDarkTheme = false;

  @Output() edit = new EventEmitter<ProjectMessage>();
  @Output() saveEdit = new EventEmitter<{ messageId: string; content: string }>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<ProjectMessage>();
  @Output() togglePin = new EventEmitter<ProjectMessage>();

  onEdit(message: ProjectMessage): void {
    this.edit.emit(message);
  }

  onSaveEdit(messageId: string): void {
    this.saveEdit.emit({ messageId, content: this.editingContent });
  }

  onCancelEdit(): void {
    this.cancelEdit.emit();
  }

  onDelete(message: ProjectMessage): void {
    this.delete.emit(message);
  }

  onTogglePin(message: ProjectMessage): void {
    this.togglePin.emit(message);
  }

  trackByMessageId(index: number, message: ProjectMessage): string {
    return message.id;
  }

  canEditMessage(message: ProjectMessage): boolean {
    if (typeof this.canEdit === 'function') {
      return this.canEdit(message);
    }
    return this.canEdit as boolean;
  }

  canDeleteMessage(message: ProjectMessage): boolean {
    if (typeof this.canDelete === 'function') {
      return this.canDelete(message);
    }
    return this.canDelete as boolean;
  }
}

