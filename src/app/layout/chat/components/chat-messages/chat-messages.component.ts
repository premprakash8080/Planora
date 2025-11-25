import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { SharedUiModule } from '../../../../shared/ui/ui.module';
import { ChatMessage } from '../../service/firestore-chat.service';
import { UserSessionService } from '../../../../shared/services/user-session.service';

export interface MessageGroup {
  date: Date;
  dateLabel: string;
  messages: GroupedMessage[];
}

export interface GroupedMessage {
  message: ChatMessage;
  showAvatar: boolean;
  showTimestamp: boolean;
  isConsecutive: boolean;
  isOwnMessage: boolean;
}

@Component({
  selector: 'vex-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, SharedUiModule]
})
export class ChatMessagesComponent implements OnInit, OnDestroy, AfterViewChecked, OnChanges {
  @Input() channelId: string | null = null;
  @Input() messages: ChatMessage[] = [];
  @Input() loading: boolean = false;

  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef<HTMLDivElement>;

  messageGroups: MessageGroup[] = [];
  currentUserId: number | null = null;
  private shouldScrollToBottom = false;
  private lastMessageCount = 0;

  constructor(
    private userSessionService: UserSessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.userSessionService.userSession;
    this.currentUserId = user?.id || null;
    this.groupMessages();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngAfterViewChecked(): void {
    // Auto-scroll to bottom when new messages arrive
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle channelId change - reset message groups
    if (changes['channelId']) {
      const previousChannelId = changes['channelId'].previousValue;
      const currentChannelId = changes['channelId'].currentValue;
      
      console.log('📥 Channel ID changed:', {
        previous: previousChannelId,
        current: currentChannelId
      });
      
      // Reset state when channel changes
      this.messageGroups = [];
      this.lastMessageCount = 0;
      
      // If messages are already loaded for this channel, group them immediately
      if (this.messages && this.messages.length > 0 && currentChannelId) {
        console.log('📨 Grouping existing messages for new channel');
        this.groupMessages();
        this.shouldScrollToBottom = true;
        this.lastMessageCount = this.messages.length;
        this.cdr.markForCheck();
      }
    }
    
    // Handle messages change
    if (changes['messages']) {
      const previousMessages = changes['messages'].previousValue || [];
      const currentMessages = changes['messages'].currentValue || [];
      
      console.log('📨 Messages input changed:', {
        previous: previousMessages.length,
        current: currentMessages.length,
        lastCount: this.lastMessageCount,
        channelId: this.channelId
      });
      
      // Always process if messages array reference changed or length changed
      if (currentMessages.length !== this.lastMessageCount || 
          changes['messages'].firstChange ||
          previousMessages.length !== currentMessages.length) {
        
        if (currentMessages && currentMessages.length > 0) {
          console.log('✅ Grouping', currentMessages.length, 'messages');
          this.groupMessages();
          this.shouldScrollToBottom = currentMessages.length > this.lastMessageCount;
          this.lastMessageCount = currentMessages.length;
        } else {
          // Clear message groups if messages array is empty
          console.log('🧹 Clearing message groups (empty messages)');
          this.messageGroups = [];
          this.lastMessageCount = 0;
        }
        
        this.cdr.markForCheck();
      }
    }
    
    // Handle loading state change
    if (changes['loading']) {
      const wasLoading = changes['loading'].previousValue;
      const isLoading = changes['loading'].currentValue;
      
      console.log('⏳ Loading state changed:', {
        wasLoading,
        isLoading,
        messagesCount: this.messages?.length || 0,
        groupsCount: this.messageGroups.length
      });
      
      // If loading finished and we have messages but no groups, group them
      if (!isLoading && wasLoading && this.messages && this.messages.length > 0 && this.messageGroups.length === 0) {
        console.log('✅ Loading finished, grouping messages');
        this.groupMessages();
        this.shouldScrollToBottom = true;
        this.lastMessageCount = this.messages.length;
        this.cdr.markForCheck();
      }
    }
  }

  groupMessages(): void {
    if (!this.messages || this.messages.length === 0) {
      this.messageGroups = [];
      return;
    }

    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;
    let previousMessage: ChatMessage | null = null;

    this.messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt);
      const dateKey = this.getDateKey(messageDate);
      
      // Check if we need a new day group
      if (!currentGroup || this.getDateKey(currentGroup.date) !== dateKey) {
        currentGroup = {
          date: messageDate,
          dateLabel: this.formatDateLabel(messageDate),
          messages: []
        };
        groups.push(currentGroup);
      }

      // Determine if we should show avatar (sender changed or first message of day)
      const showAvatar = !previousMessage || 
                        previousMessage.userId !== message.userId ||
                        this.isNewDay(previousMessage.createdAt, message.createdAt);

      // Determine if messages are consecutive (same sender, within 5 minutes)
      const isConsecutive = previousMessage && 
                           previousMessage.userId === message.userId &&
                           !this.isNewDay(previousMessage.createdAt, message.createdAt) &&
                           this.isWithinTimeWindow(previousMessage.createdAt, message.createdAt, 5);

      const isOwnMessage = message.userId === this.currentUserId;

      currentGroup.messages.push({
        message,
        showAvatar,
        showTimestamp: false, // Will be shown on hover
        isConsecutive: !!isConsecutive,
        isOwnMessage
      });

      previousMessage = message;
    });

    this.messageGroups = groups;
  }

  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  isNewDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() !== d2.getDate() ||
           d1.getMonth() !== d2.getMonth() ||
           d1.getFullYear() !== d2.getFullYear();
  }

  isWithinTimeWindow(date1: Date | string, date2: Date | string, minutes: number): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes <= minutes;
  }

  formatDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.getDateKey(date) === this.getDateKey(today)) {
      return 'Today';
    } else if (this.getDateKey(date) === this.getDateKey(yesterday)) {
      return 'Yesterday';
    } else {
      // Format as "Monday, January 1" or similar
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  formatRelativeTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return this.formatTime(d);
    }
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  onMessageHover(groupedMessage: GroupedMessage, show: boolean): void {
    groupedMessage.showTimestamp = show;
  }

  onMessageAction(action: string, message: ChatMessage): void {
    console.log(`Message action: ${action}`, message);
    // TODO: Implement message actions (reply, react, edit, delete, etc.)
  }

  trackByMessageId = (index: number, groupedMessage: GroupedMessage): string => {
    return groupedMessage.message.id;
  }

  trackByGroupDate = (index: number, group: MessageGroup): string => {
    return this.getDateKey(group.date);
  }
}
