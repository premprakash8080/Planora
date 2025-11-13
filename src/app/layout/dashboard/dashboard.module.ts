import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { ScheduleDetailComponent } from './components/schedule-detail/schedule-detail.component';
import { DashboardScheduleComponent } from './components/dashboard-schedule/dashboard-schedule.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotificationComponent } from 'src/@vex/layout/toolbar/notification/notification.component';
import { ProfileComponent } from 'src/@vex/layout/toolbar/profile/profile.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedUiModule } from '../../shared/ui/ui.module';

@NgModule({
  declarations: [
    ScheduleDetailComponent,
    DashboardScheduleComponent,
    DashboardComponent,
    ProfileComponent,
    NotificationComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    MatProgressBarModule,
    SharedUiModule
  ]
})
export class DashboardModule { }
