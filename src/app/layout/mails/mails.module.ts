import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MailsRoutingModule } from './mails-routing.module';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { SharedUiModule } from 'src/app/shared/ui/ui.module';
import { MailListComponent } from './components/mail-list/mail-list.component';
import { MailViewComponent } from './components/mail-view/mail-view.component';
import { MailComposeComponent } from './components/mail-compose/mail-compose.component';
import { MailTabComponent } from './components/mail-tab/mail-tab.component';

@NgModule({
  declarations: [
    MailListComponent,
    MailViewComponent,
    MailComposeComponent,
    MailTabComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedUiModule,
    MailsRoutingModule
  ]
})
export class MailsModule { }
