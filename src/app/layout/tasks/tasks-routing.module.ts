import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListViewComponent } from './components/views/list-view/list-view.component';
import { BoardViewComponent } from './components/views/board-view/board-view.component';
import { TimelineViewComponent } from './components/views/timeline-view/timeline-view.component';
import { CalendarViewComponent } from './components/views/calendar-view/calendar-view.component';
import { DashboardViewComponent } from './components/views/dashboard-view/dashboard-view.component';
import { ProjectOverviewComponent } from './components/views/project-overview/project-overview.component';
import { TaskFilesComponent } from './components/views/task-files/task-files.component';
import { TaskWorkflowComponent } from './components/views/task-workflow/task-workflow.component';
import { TaskMessagesComponent } from './components/views/task-messages/task-messages.component';

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
  },
  {
    path: 'workflow',
    component: TaskWorkflowComponent
  },
  {
    path: 'messages',
    component: TaskMessagesComponent
  },
  {
    path: 'files',
    component: TaskFilesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {}
