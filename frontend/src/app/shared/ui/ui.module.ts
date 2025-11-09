import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AppHeaderComponent } from './app-header/app-header.component';
import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';
import { AppPageTitleComponent } from './app-page-title/app-page-title.component';
import { AppCardComponent } from './app-card/app-card.component';
import { AppButtonComponent } from './app-button/app-button.component';
import { AppTableComponent } from './app-table/app-table.component';

@NgModule({
  declarations: [
    AppHeaderComponent,
    AppSidebarComponent,
    AppPageTitleComponent,
    AppCardComponent,
    AppButtonComponent,
    AppTableComponent
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
    MatInputModule
  ],
  exports: [
    AppHeaderComponent,
    AppSidebarComponent,
    AppPageTitleComponent,
    AppCardComponent,
    AppButtonComponent,
    AppTableComponent
  ]
})
export class SharedUiModule {}

