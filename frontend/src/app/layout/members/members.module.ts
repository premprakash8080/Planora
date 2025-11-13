import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatOptionModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';

import { MembersComponent } from './members.component';
import { MembersRoutingModule } from './members-routing.module';
import { SharedUiModule } from '../../shared/ui/ui.module';
import { MemberDetailsPageComponent } from './member-details-page/member-details-page.component';
import { MemberCreatePageComponent } from './member-create-page/member-create-page.component';

@NgModule({
  declarations: [
    MembersComponent,
    MemberDetailsPageComponent,
    MemberCreatePageComponent
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
    MatDividerModule,
    SharedUiModule
  ]
})
export class MembersModule {}

