import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MailsRoutingModule } from './mails-routing.module';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { SharedUiModule } from 'src/app/shared/ui/ui.module';
import { MailListComponent } from './mail-list/mail-list.component';
import { MailViewComponent } from './mail-view/mail-view.component';
import { MailComposeComponent } from './mail-compose/mail-compose.component';

@NgModule({
  declarations: [
    MailListComponent,
    MailViewComponent,
    MailComposeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedUiModule,
    MailsRoutingModule
  ]
})
export class MailsModule { }
