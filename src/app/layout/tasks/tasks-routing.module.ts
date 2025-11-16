import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListViewComponent } from './views/list-view/list-view.component';
import { BoardViewComponent } from './views/board-view/board-view.component';
import { TimelineViewComponent } from './views/timeline-view/timeline-view.component';
import { CalendarViewComponent } from './views/calendar-view/calendar-view.component';
import { DashboardViewComponent } from './views/dashboard-view/dashboard-view.component';
import { ProjectOverviewComponent } from './views/project-overview/project-overview.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: ListViewComponent
  },
  {
    path: 'list/:taskId',
    component: ListViewComponent
  },
  {
    path: 'board',
    component: BoardViewComponent
  },
  {
    path: 'timeline',
    component: TimelineViewComponent
  },
  {
    path: 'calendar',
    component: CalendarViewComponent
  },
  {
    path: 'dashboard',
    component: DashboardViewComponent
  },
  {
    path: 'overview',
    component: ProjectOverviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {}
