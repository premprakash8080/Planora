import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembersComponent } from './components/list-member/members.component';
import { AddMemberComponent } from './components/add-member/add-member.component';
import { ViewMemberComponent } from './components/view-member/view-member.component';

const routes: Routes = [
  {
    path: '',
    component: MembersComponent
  },
  {
    path: 'add',
    component: AddMemberComponent
  },
  {
    path: ':id/edit',
    component: AddMemberComponent
  },
  {
    path: ':id',
    component: ViewMemberComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersRoutingModule {}

