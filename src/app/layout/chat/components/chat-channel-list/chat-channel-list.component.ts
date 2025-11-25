import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChatChannelItemComponent, Channel } from '../chat-channel-item/chat-channel-item.component';

@Component({
  selector: 'vex-chat-channel-list',
  templateUrl: './chat-channel-list.component.html',
  styleUrls: ['./chat-channel-list.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, ChatChannelItemComponent]
})
export class ChatChannelListComponent implements OnChanges {
  @Input() title: string = '';
  @Input() channels: Channel[] = [];
  @Input() selectedChannelId: string | null = null;
  @Input() collapsed: boolean = false;
  @Input() showAddButton: boolean = false;
  
  @Output() channelSelected = new EventEmitter<string>();
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() addClick = new EventEmitter<void>();
  @Output() channelDelete = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channels']) {
      console.log(`📋 ${this.title} - Channels updated:`, this.channels.length, this.channels);
    }
  }

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  onChannelClick(channelId: string): void {
    console.log(`🖱️ Channel clicked: ${channelId} (${this.title})`);
    this.channelSelected.emit(channelId);
  }

  onAddClick(event: Event): void {
    event.stopPropagation();
    this.addClick.emit();
  }

  trackByChannelId(index: number, channel: Channel): string {
    return channel.id;
  }

  canDeleteChannel(channel: Channel): boolean {
    // Only allow delete for non-direct channels where user is owner
    return channel.type !== 'direct' && channel.myRole === 'owner';
  }

  onChannelDelete(channelId: string): void {
    this.channelDelete.emit(channelId);
  }
}
