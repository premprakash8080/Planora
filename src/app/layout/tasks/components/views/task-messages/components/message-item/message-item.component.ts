import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectMessage } from '../../../../../services/project-messages.service';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent {
  @Input() message!: ProjectMessage;
  @Input() isPinned = false;
  @Input() isEditing = false;
  @Input() editingContent = '';
  @Input() canEdit = false;
  @Input() canDelete = false;
  @Input() canPin = false;
  @Input() isDarkTheme = false;

  @Output() edit = new EventEmitter<ProjectMessage>();
  @Output() saveEdit = new EventEmitter<string>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<ProjectMessage>();
  @Output() togglePin = new EventEmitter<ProjectMessage>();

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  formatMessageContent(content: string): string {
    // Simple markdown-like formatting
    let formatted = content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
    
    // Basic link detection
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
    
    return formatted;
  }

  onEdit(): void {
    this.edit.emit(this.message);
  }

  onSaveEdit(): void {
    this.saveEdit.emit(this.editingContent);
  }

  onCancelEdit(): void {
    this.cancelEdit.emit();
  }

  onDelete(): void {
    this.delete.emit(this.message);
  }

  onTogglePin(): void {
    this.togglePin.emit(this.message);
  }
}

