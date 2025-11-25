import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FirestoreChatService } from '../../service/firestore-chat.service';
import { ChatService } from '../../service/chat.service';
import { FirebaseService } from '../../service/firebase.service';
import { UserSessionService } from '../../../../shared/services/user-session.service';
import { SnackBarService } from '../../../../shared/services/snackbar.service';

@Component({
  selector: 'vex-chat-message-input',
  templateUrl: './chat-message-input.component.html',
  styleUrls: ['./chat-message-input.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule]
})
export class ChatMessageInputComponent implements OnInit, OnDestroy {
  @ViewChild('messageTextarea', { static: false }) messageTextarea?: ElementRef<HTMLTextAreaElement>;

  @Input() channelId: string | null = null;
  @Input() disabled: boolean = false;
  @Input() placeholder: string = 'Message #channel';

  @Output() messageSent = new EventEmitter<void>();

  messageContent: string = '';
  sending: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private firestoreChatService: FirestoreChatService,
    private chatService: ChatService,
    private firebaseService: FirebaseService,
    private userSessionService: UserSessionService,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    // Update placeholder based on channel type if needed
    if (this.channelId) {
      // Placeholder will be set by parent component
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canSend(): boolean {
    return !this.sending && !this.disabled && !!this.messageContent.trim() && !!this.channelId;
  }

  onContentChange(value: string): void {
    this.messageContent = value;
    this.adjustTextareaHeight();
  }

  onKeyDown(event: KeyboardEvent): void {
    // Enter to send, Shift+Enter for new line
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.canSend) {
        this.sendMessage();
      }
    }
  }

  onSendClick(): void {
    if (this.canSend) {
      this.sendMessage();
    }
  }

  onEmojiClick(): void {
    // TODO: Open emoji picker
    console.log('Emoji picker - to be implemented');
  }

  private async sendMessage(): Promise<void> {
    if (!this.channelId || !this.messageContent.trim()) {
      return;
    }

    const content = this.messageContent.trim();
    this.sending = true;
    this.messageContent = ''; // Clear input immediately (optimistic UI)
    this.adjustTextareaHeight();

    try {
      // Try Firestore first if available, otherwise use REST API
      if (this.firebaseService.isInitialized()) {
        // Use REST API which handles Firestore writes properly
        await this.sendViaAPI(this.channelId, content);
      } else {
        // Use REST API fallback
        await this.sendViaAPI(this.channelId, content);
      }
      
      this.messageSent.emit();
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Restore message content on error
      this.messageContent = content;
      this.snackBarService.showError(error?.message || 'Failed to send message');
    } finally {
      this.sending = false;
      // Focus textarea after sending
      setTimeout(() => {
        this.focus();
      }, 100);
    }
  }

  private sendViaAPI(channelId: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.chatService.sendMessage(channelId, content)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            resolve();
          },
          error: (error) => {
            reject(error);
          }
        });
    });
  }

  adjustTextareaHeight(): void {
    if (this.messageTextarea?.nativeElement) {
      const textarea = this.messageTextarea.nativeElement;
      textarea.style.height = 'auto';
      // Min height ~40px (single line), max ~200px (about 8 lines)
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }

  focus(): void {
    if (this.messageTextarea?.nativeElement) {
      this.messageTextarea.nativeElement.focus();
    }
  }

  // Highlight @mentions in the textarea (visual only)
  // This is a simple implementation - in production, you'd use a rich text editor
  hasMentions(): boolean {
    return /@\w+/.test(this.messageContent);
  }
}

