import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListViewComponent } from './list-view/list-view.component';
import { BoardViewComponent } from './board-view/board-view.component';
import { TimelineViewComponent } from './timeline-view/timeline-view.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {}
