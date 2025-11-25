import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedUiModule } from '../../../../shared/ui/ui.module';

export interface ChatHeaderUser {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarColor?: string;
  initials?: string;
  isOnline?: boolean;
  status?: 'online' | 'away' | 'offline';
}

export interface ChatHeaderMember {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarColor?: string;
  initials?: string;
}

@Component({
  selector: 'vex-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, SharedUiModule]
})
export class ChatHeaderComponent {
  @Input() channelType: 'direct' | 'channel' = 'channel';
  @Input() channelName: string = '';
  @Input() isPrivate: boolean = false;
  @Input() isStarred: boolean = false;
  @Input() memberCount?: number;
  @Input() members: ChatHeaderMember[] = [];
  @Input() user?: ChatHeaderUser; // For direct messages
  @Input() isMuted: boolean = false;
  @Input() hasUnread: boolean = false;

  @Output() headerClick = new EventEmitter<void>();
  @Output() starClick = new EventEmitter<void>();
  @Output() callClick = new EventEmitter<void>();
  @Output() videoClick = new EventEmitter<void>();
  @Output() pinClick = new EventEmitter<void>();
  @Output() addUserClick = new EventEmitter<void>();
  @Output() membersClick = new EventEmitter<void>();
  @Output() searchClick = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() moreClick = new EventEmitter<void>();

  onHeaderClick(): void {
    this.headerClick.emit();
  }

  onStarClick(event: Event): void {
    event.stopPropagation();
    this.starClick.emit();
  }

  onCallClick(event: Event): void {
    event.stopPropagation();
    this.callClick.emit();
  }

  onVideoClick(event: Event): void {
    event.stopPropagation();
    this.videoClick.emit();
  }

  onPinClick(event: Event): void {
    event.stopPropagation();
    this.pinClick.emit();
  }

  onAddUserClick(event: Event): void {
    event.stopPropagation();
    this.addUserClick.emit();
  }

  onMembersClick(event: Event): void {
    event.stopPropagation();
    this.membersClick.emit();
  }

  onSearchClick(event: Event): void {
    event.stopPropagation();
    this.searchClick.emit();
  }

  onNotificationsClick(event: Event): void {
    event.stopPropagation();
    this.notificationsClick.emit();
  }

  onMoreClick(event: Event): void {
    event.stopPropagation();
    this.moreClick.emit();
  }

  trackByMemberId(index: number, member: ChatHeaderMember): string {
    return member.id;
  }
}
