import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { SharedUiModule } from 'src/app/shared/ui/ui.module';
import { ChatComponent } from './components/chat/chat.component';

@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
    SharedModule,
    SharedUiModule,
    ChatRoutingModule
  ]
})
export class ChatModule {}

