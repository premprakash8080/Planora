import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxComponent } from './inbox.component';
import { InboxRoutingModule } from './inbox-routing.module';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { SharedUiModule } from 'src/app/shared/ui/ui.module';

@NgModule({
  declarations: [InboxComponent],
  imports: [
    CommonModule,
    SharedModule,
    SharedUiModule,
    InboxRoutingModule
  ]
})
export class InboxModule {}

