import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatOptionModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MembersComponent } from './components/list-member/members.component';
import { MembersRoutingModule } from './members-routing.module';
import { SharedUiModule } from '../../shared/ui/ui.module';
import { AddMemberComponent } from './components/add-member/add-member.component';
import { ViewMemberComponent } from './components/view-member/view-member.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MembersComponent,
    AddMemberComponent,
    ViewMemberComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MembersRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatOptionModule,
    MatSortModule,
    MatProgressSpinnerModule,
    SharedUiModule
  ]
})
export class MembersModule {}

