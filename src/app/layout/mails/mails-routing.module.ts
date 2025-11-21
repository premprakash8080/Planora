import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MailListComponent } from './components/mail-list/mail-list.component';
import { MailViewComponent } from './components/mail-view/mail-view.component';

const routes: Routes = [
  {
    path: '',
    component: MailListComponent
  },
  {
    path: ':id',
    component: MailViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MailsRoutingModule { }
