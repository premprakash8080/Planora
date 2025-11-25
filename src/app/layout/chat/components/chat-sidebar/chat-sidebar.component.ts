import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatChannelListComponent } from '../chat-channel-list/chat-channel-list.component';
import { Channel } from '../chat-channel-item/chat-channel-item.component';

// Re-export Channel interface for backward compatibility
export { Channel };

@Component({
  selector: 'vex-chat-sidebar',
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, ChatChannelListComponent]
})
export class ChatSidebarComponent implements OnChanges {
  @Input() channels: Channel[] = [];
  @Input() directMessages: Channel[] = [];
  @Input() selectedChannelId: string | null = null;
  @Input() isCollapsed: boolean = false;
  
  @Output() channelSelected = new EventEmitter<string>();
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() createChannel = new EventEmitter<void>();
  @Output() createDirectMessage = new EventEmitter<void>();
  @Output() channelDelete = new EventEmitter<string>();

  // Track expanded state for sections
  channelsExpanded = signal(true);
  directMessagesExpanded = signal(true);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channels']) {
      console.log('📥 ChatSidebar - Channels updated:', this.channels.length, this.channels);
    }
    if (changes['directMessages']) {
      console.log('📥 ChatSidebar - Direct Messages updated:', this.directMessages.length, this.directMessages);
    }
  }
}
