import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InsightsRoutingModule } from './insights-routing.module';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { ReportComponent } from './components/report/report.component';
import { ProductivityOverviewComponent } from './components/productivity-overview/productivity-overview.component';
import { TeamPerformanceComponent } from './components/team-performance/team-performance.component';
import { TimeTrackingComponent } from './components/time-tracking/time-tracking.component';
import { SharedUiModule } from '../../shared/ui/ui.module';

/**
 * Insights Module
 * 
 * This module contains analytics and reporting features.
 * It includes:
 * - Report component
 * - Productivity Overview component
 * - Team Performance component
 * - Time Tracking component
 */
@NgModule({
  declarations: [
    ReportComponent,
    ProductivityOverviewComponent,
    TeamPerformanceComponent,
    TimeTrackingComponent
  ],
  imports: [
    CommonModule,
    InsightsRoutingModule,
    SharedModule,
    SharedUiModule
  ]
})
export class InsightsModule { }

