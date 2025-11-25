import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { SharedUiModule } from 'src/app/shared/ui/ui.module';
import { ChatComponent } from './components/chat/chat.component';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { ChatHeaderComponent } from './components/chat-header/chat-header.component';
import { ChatMessagesComponent } from './components/chat-messages/chat-messages.component';
import { ChatChannelItemComponent } from './components/chat-channel-item/chat-channel-item.component';
import { ChatChannelListComponent } from './components/chat-channel-list/chat-channel-list.component';
import { AddMembersDialogComponent } from './components/add-members-dialog/add-members-dialog.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    SharedUiModule,
    ChatRoutingModule,
    // Standalone components
    ChatComponent,
    ChatSidebarComponent,
    ChatHeaderComponent,
    ChatMessagesComponent,
    ChatChannelItemComponent,
    ChatChannelListComponent,
    AddMembersDialogComponent
  ],
  exports: [
    ChatComponent,
    ChatSidebarComponent,
    ChatHeaderComponent,
    ChatMessagesComponent,
    ChatChannelItemComponent,
    ChatChannelListComponent,
    AddMembersDialogComponent
  ]
})
export class ChatModule {}

