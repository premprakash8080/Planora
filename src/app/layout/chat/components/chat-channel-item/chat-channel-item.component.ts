import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { SharedUiModule } from '../../../../shared/ui/ui.module';

export interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'public' | 'private';
  unreadCount?: number;
  lastMessage?: string;
  lastMessageAt?: Date;
  isMuted?: boolean;
  isStarred?: boolean;
  memberCount?: number;
  myRole?: 'owner' | 'admin' | 'member';
  otherUser?: {
    id: string;
    name: string;
    avatarColor?: string;
    initials?: string;
    isOnline?: boolean;
  };
}

@Component({
  selector: 'vex-chat-channel-item',
  templateUrl: './chat-channel-item.component.html',
  styleUrls: ['./chat-channel-item.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, SharedUiModule]
})
export class ChatChannelItemComponent {
  @Input() channel!: Channel;
  @Input() isSelected: boolean = false;
  @Input() showUnreadDot: boolean = true; // Show white dot for unread (Slack style)
  @Input() canDelete: boolean = false; // Only show delete for channels user owns
  
  @Output() channelClick = new EventEmitter<string>();
  @Output() channelDelete = new EventEmitter<string>();

  onChannelClick(event: Event): void {
    // Stop propagation to prevent parent handlers from interfering
    event.stopPropagation();
    event.preventDefault();
    
    // Emit the channel ID
    this.channelClick.emit(this.channel.id);
  }

  getDisplayName(): string {
    if (this.channel.type === 'direct' && this.channel.otherUser) {
      return this.channel.otherUser.name;
    }
    return this.channel.name;
  }

  getUnreadCount(): string | null {
    if (!this.channel.unreadCount || this.channel.unreadCount === 0) {
      return null;
    }
    return this.channel.unreadCount > 99 ? '99+' : this.channel.unreadCount.toString();
  }

  hasUnread(): boolean {
    return !!(this.channel.unreadCount && this.channel.unreadCount > 0);
  }

  isDirectMessage(): boolean {
    return this.channel.type === 'direct';
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.channelDelete.emit(this.channel.id);
  }
}
