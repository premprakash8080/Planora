import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TasksRoutingModule } from './tasks-routing.module';
import { ListViewComponent } from './views/list-view/list-view.component';
import { TaskDetailComponent } from './views/task-detail/task-detail.component';
import { SubtaskListComponent } from './views/subtask-list/subtask-list.component';
import { TaskDescriptionEditorComponent } from './views/task-description-editor/task-description-editor.component';
import { BoardViewComponent } from './views/board-view/board-view.component';
import { TimelineViewComponent } from './views/timeline-view/timeline-view.component';
import { CalendarViewComponent } from './views/calendar-view/calendar-view.component';
import { DashboardViewComponent } from './views/dashboard-view/dashboard-view.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { QuillModule } from 'ngx-quill';
import { SharedUiModule } from '../../shared/ui/ui.module';
import { AddSectionButtonComponent } from './views/list-view/components/add-section-button/add-section-button.component';
import { TaskSectionComponent } from './views/list-view/components/task-section/task-section.component';
import { TaskRowComponent } from './views/list-view/components/task-row/task-row.component';
import { AddTaskButtonComponent } from './views/list-view/components/add-task-button/add-task-button.component';
import { TaskHeaderComponent } from './task-header/task-header.component';
import { ProjectOverviewComponent } from './views/project-overview/project-overview.component';

@NgModule({
  declarations: [
    ListViewComponent,
    BoardViewComponent,
    TimelineViewComponent,
    CalendarViewComponent,
    DashboardViewComponent,
    TaskDetailComponent,
    SubtaskListComponent,
    TaskDescriptionEditorComponent,
    AddSectionButtonComponent,
    TaskSectionComponent,
    TaskRowComponent,
    AddTaskButtonComponent,
    TaskHeaderComponent,
    ProjectOverviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TasksRoutingModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    MatDividerModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    QuillModule.forRoot(),
    SharedUiModule
  ]
})
export class DashboardProjectTasksModule {}
