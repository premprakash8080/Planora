import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-message-composer',
  templateUrl: './message-composer.component.html',
  styleUrls: ['./message-composer.component.scss']
})
export class MessageComposerComponent {
  @ViewChild('composerTextarea', { static: false }) composerTextarea?: ElementRef<HTMLTextAreaElement>;

  @Input() content = '';
  @Input() sending = false;
  @Input() isDarkTheme = false;
  @Input() showCharacterCount = false;
  @Input() characterCount = 0;

  @Output() contentChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<void>();
  @Output() insertMarkdown = new EventEmitter<{ before: string; after: string }>();

  get canSend(): boolean {
    return !this.sending && !!this.content.trim();
  }

  onContentChange(value: string): void {
    this.contentChange.emit(value);
    this.adjustHeight();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (this.canSend) {
        this.send.emit();
      }
    }
  }

  onSend(): void {
    if (this.canSend) {
      this.send.emit();
    }
  }

  onInsertMarkdown(before: string, after: string): void {
    this.insertMarkdown.emit({ before, after });
  }

  adjustHeight(): void {
    if (this.composerTextarea?.nativeElement) {
      const textarea = this.composerTextarea.nativeElement;
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 56), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }

  focus(): void {
    if (this.composerTextarea?.nativeElement) {
      this.composerTextarea.nativeElement.focus();
    }
  }
}

