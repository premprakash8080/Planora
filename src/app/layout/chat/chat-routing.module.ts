import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { AddMembersDialogComponent } from './components/add-members-dialog/add-members-dialog.component';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
const routes: Routes = [
  {
    path: '',
    component: ChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }

