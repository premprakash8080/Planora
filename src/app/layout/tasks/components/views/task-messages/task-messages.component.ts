import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectMessagesService, ProjectMessage } from '../../../services/project-messages.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-tasks-messages',
  templateUrl: './task-messages.component.html',
  styleUrls: ['./task-messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskMessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef<HTMLElement>;

  projectTitle = 'Messages';
  projectId: string | null = null;
  isDarkTheme = false;

  loading = false;
  error: string | null = null;
  messages: ProjectMessage[] = [];
  pinnedMessages: ProjectMessage[] = [];
  regularMessages: ProjectMessage[] = [];

  newMessageContent = '';
  editingMessageId: string | null = null;
  editingContent = '';
  sending = false;

  currentUserId: string | null = null; // TODO: Get from auth service
  isProjectAdmin = false; // TODO: Check from project data

  private destroy$ = new Subject<void>();
  private pollInterval: any = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly messagesService: ProjectMessagesService,
    private readonly snackBar: SnackBarService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const projectRoute = this.findProjectRoute();
    projectRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const projectId = params.get('projectId');
      if (projectId && projectId !== this.projectId) {
        this.projectId = projectId;
        this.loadMessages();
        this.startPolling();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEmptyState(): boolean {
    return !this.loading && this.messages.length === 0;
  }

  get canSend(): boolean {
    return !this.sending && !!this.newMessageContent.trim();
  }

  get characterCount(): number {
    return this.newMessageContent.length;
  }

  get showCharacterCount(): boolean {
    return this.characterCount > 2000;
  }

  loadMessages(): void {
    if (!this.projectId) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.messagesService.getMessages(this.projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.messages = response.messages || [];
          this.updateMessageLists();
          this.loading = false;
          this.cdr.markForCheck();
          setTimeout(() => this.scrollToBottom(), 100);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.error = error || 'Failed to load messages';
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  sendMessage(): void {
    if (!this.canSend || !this.projectId) {
      return;
    }

    const content = this.newMessageContent.trim();
    if (!content) {
      return;
    }

    // Optimistic update
    const tempMessage: ProjectMessage = {
      id: `temp-${Date.now()}`,
      content,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: this.currentUserId || '1',
        fullName: 'You',
        email: '',
        avatarUrl: null,
        avatarColor: null,
        initials: 'YO',
      },
    };

    this.messages = [tempMessage, ...this.messages];
    this.updateMessageLists();
    this.newMessageContent = '';
    this.sending = true;
    this.cdr.markForCheck();

    this.messagesService.createMessage(this.projectId, content).pipe(takeUntil(this.destroy$)).subscribe({
      next: (message) => {
        this.ngZone.run(() => {
          // Replace temp message with real one
          this.messages = this.messages.map(m => m.id === tempMessage.id ? message : m);
          this.updateMessageLists();
          this.sending = false;
          this.cdr.markForCheck();
          setTimeout(() => this.scrollToBottom(), 100);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          // Remove temp message on error
          this.messages = this.messages.filter(m => m.id !== tempMessage.id);
          this.updateMessageLists();
          this.sending = false;
          this.snackBar.showError(error || 'Failed to send message');
          this.cdr.markForCheck();
        });
      }
    });
  }

  startEditing(message: ProjectMessage): void {
    this.editingMessageId = message.id;
    this.editingContent = message.content;
  }

  cancelEditing(): void {
    this.editingMessageId = null;
    this.editingContent = '';
  }

  saveEdit(messageId?: string, content?: string): void {
    const id = messageId || this.editingMessageId;
    const editContent = content || this.editingContent;
    
    if (!id || !editContent?.trim()) {
      return;
    }

    const trimmedContent = editContent.trim();

    // Optimistic update
    this.messages = this.messages.map(m =>
      m.id === id ? { ...m, content: trimmedContent, updatedAt: new Date().toISOString() } : m
    );
    this.updateMessageLists();
    this.editingMessageId = null;
    this.editingContent = '';
    this.cdr.markForCheck();

    this.messagesService.updateMessage(id, trimmedContent).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        this.ngZone.run(() => {
          this.messages = this.messages.map(m => m.id === id ? updated : m);
          this.updateMessageLists();
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.loadMessages(); // Reload on error
          this.snackBar.showError(error || 'Failed to update message');
        });
      }
    });
  }

  deleteMessage(message: ProjectMessage): void {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    const messageId = message.id;
    const originalMessages = [...this.messages];

    // Optimistic update
    this.messages = this.messages.filter(m => m.id !== messageId);
    this.updateMessageLists();
    this.cdr.markForCheck();

    this.messagesService.deleteMessage(messageId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // Success - already removed
      },
      error: (error) => {
        this.ngZone.run(() => {
          // Restore on error
          this.messages = originalMessages;
          this.updateMessageLists();
          this.snackBar.showError(error || 'Failed to delete message');
          this.cdr.markForCheck();
        });
      }
    });
  }

  togglePin(message: ProjectMessage): void {
    const messageId = message.id;
    const originalPinned = message.pinned;

    // Optimistic update
    this.messages = this.messages.map(m =>
      m.id === messageId ? { ...m, pinned: !m.pinned } : m
    );
    this.updateMessageLists();
    this.cdr.markForCheck();

    this.messagesService.pinMessage(messageId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        this.ngZone.run(() => {
          this.messages = this.messages.map(m => m.id === messageId ? updated : m);
          this.updateMessageLists();
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          // Restore on error
          this.messages = this.messages.map(m =>
            m.id === messageId ? { ...m, pinned: originalPinned } : m
          );
          this.updateMessageLists();
          this.snackBar.showError(error || 'Failed to pin message');
          this.cdr.markForCheck();
        });
      }
    });
  }

  canEditMessage(message: ProjectMessage): boolean {
    return this.currentUserId === message.author?.id;
  }

  canDeleteMessage(message: ProjectMessage): boolean {
    return this.currentUserId === message.author?.id || this.isProjectAdmin;
  }

  get canPinMessage(): boolean {
    return this.isProjectAdmin;
  }

  trackByMessageId(index: number, message: ProjectMessage): string {
    return message.id;
  }

  onContentChange(content: string): void {
    this.newMessageContent = content;
  }

  onInsertMarkdown(before: string, after: string): void {
    // This will be handled by the composer component
    // For now, just insert at the end
    this.newMessageContent = this.newMessageContent + before + after;
    this.cdr.markForCheck();
  }

  private updateMessageLists(): void {
    this.pinnedMessages = this.messages.filter(m => m.pinned);
    this.regularMessages = this.messages.filter(m => !m.pinned);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          const container = this.messagesContainer.nativeElement;
          container.scrollTop = container.scrollHeight;
        }, 0);
      });
    }
  }

  private startPolling(): void {
    this.stopPolling();
    // Poll every 10 seconds for new messages
    this.pollInterval = setInterval(() => {
      if (this.projectId && !this.sending && !this.editingMessageId) {
        this.loadMessages();
      }
    }, 10000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.cdr.markForCheck();
  }

  private findProjectRoute(): ActivatedRoute {
    let projectRoute: ActivatedRoute | null = this.route;
    while (projectRoute) {
      if (projectRoute.snapshot.paramMap.has('projectId')) {
        return projectRoute;
      }
      projectRoute = projectRoute.parent;
    }
    return this.route;
  }
}
