import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ReportComponent } from "./components/report/report.component";
import { ProductivityOverviewComponent } from "./components/productivity-overview/productivity-overview.component";
import { TeamPerformanceComponent } from "./components/team-performance/team-performance.component";
import { TimeTrackingComponent } from "./components/time-tracking/time-tracking.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        redirectTo: "report",
        pathMatch: "full"
      },
      {
        path: "report",
        component: ReportComponent
      },
      {
        path: "productivity-overview",
        component: ProductivityOverviewComponent
      },
      {
        path: "team-performance",
        component: TeamPerformanceComponent
      },
      {
        path: "time-tracking",
        component: TimeTrackingComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsightsRoutingModule { }

