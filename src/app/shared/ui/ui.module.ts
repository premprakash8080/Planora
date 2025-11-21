import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { OverlayModule } from '@angular/cdk/overlay';

import { AppHeaderComponent } from './app-header/app-header.component';
import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';
import { AppPageTitleComponent } from './app-page-title/app-page-title.component';
import { AppCardComponent } from './app-card/app-card.component';
import { AppButtonComponent } from './app-button/app-button.component';
import { AppTableComponent } from './app-table/app-table.component';
import { AppCalendarComponent } from './app-calendar/app-calendar.component';
import { AppAvatarComponent } from './app-avatar/app-avatar.component';
import { AppLoadingComponent } from './app-loading/app-loading.component';
import { AppPaginationComponent } from './app-pagination/app-pagination.component';
import { DropdownPopoverComponent } from './dropdown-popover/dropdown-popover.component';
import { DropdownTriggerDirective } from './dropdown-popover/dropdown-trigger.directive';
import { DropdownContentDirective } from './dropdown-popover/dropdown-content.directive';

@NgModule({
  declarations: [
    AppHeaderComponent,
    AppSidebarComponent,
    AppPageTitleComponent,
    AppCardComponent,
    AppButtonComponent,
    AppTableComponent,
    AppCalendarComponent,
    AppAvatarComponent,
    AppLoadingComponent,
    AppPaginationComponent,
    DropdownPopoverComponent,
    DropdownTriggerDirective,
    DropdownContentDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    OverlayModule
  ],
  exports: [
    AppHeaderComponent,
    AppSidebarComponent,
    AppPageTitleComponent,
    AppCardComponent,
    AppButtonComponent,
    AppTableComponent,
    AppCalendarComponent,
    AppAvatarComponent,
    AppLoadingComponent,
    AppPaginationComponent,
    DropdownPopoverComponent,
    DropdownTriggerDirective,
    DropdownContentDirective
  ]
})
export class SharedUiModule {}

