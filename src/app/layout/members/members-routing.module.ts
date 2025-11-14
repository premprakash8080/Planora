import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembersComponent } from './members.component';
import { AddMemberComponent } from './add-member/add-member.component';
import { ViewMemberComponent } from './view-member/view-member.component';

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
    path: ':id',
    component: ViewMemberComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersRoutingModule {}

