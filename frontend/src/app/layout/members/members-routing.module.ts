import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembersComponent } from './members.component';
import { MemberDetailsPageComponent } from './member-details-page/member-details-page.component';
import { MemberCreatePageComponent } from './member-create-page/member-create-page.component';

const routes: Routes = [
  {
    path: '',
    component: MembersComponent
  },
  {
    path: 'new',
    component: MemberCreatePageComponent
  },
  {
    path: ':id',
    component: MemberDetailsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersRoutingModule {}

