import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TasksRoutingModule } from './tasks-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ListViewComponent } from './components/views/list-view/list-view.component';
import { TaskDetailComponent } from './components/views/task-detail/task-detail.component';
import { SubtaskListComponent } from './components/views/subtask-list/subtask-list.component';
import { TaskDescriptionEditorComponent } from './components/views/task-description-editor/task-description-editor.component';
import { BoardViewComponent } from './components/views/board-view/board-view.component';
import { TimelineViewComponent } from './components/views/timeline-view/timeline-view.component';
import { CalendarViewComponent } from './components/views/calendar-view/calendar-view.component';
import { DashboardViewComponent } from './components/views/dashboard-view/dashboard-view.component';
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
import { AddSectionButtonComponent } from './components/views/list-view/components/add-section-button/add-section-button.component';
import { TaskSectionComponent } from './components/views/list-view/components/task-section/task-section.component';
import { TaskRowComponent } from './components/views/list-view/components/task-row/task-row.component';
import { AddTaskButtonComponent } from './components/views/list-view/components/add-task-button/add-task-button.component';
import { TaskHeaderComponent } from './components/task-header/task-header.component';
import { ProjectOverviewComponent } from './components/views/project-overview/project-overview.component';
import { TaskCardComponent } from './components/views/board-view/task-card/task-card.component';
import { TaskWorkflowComponent } from './components/views/task-workflow/task-workflow.component';
import { TaskMessagesComponent } from './components/views/task-messages/task-messages.component';
import { TaskFilesComponent } from './components/views/task-files/task-files.component';
import { ProjectMembersModalComponent } from './components/project-members-modal/project-members-modal.component';
import { TimelineGroupRowComponent } from './components/views/timeline-view/components/timeline-group-row/timeline-group-row.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


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
    ProjectOverviewComponent,
    TaskCardComponent,
    TaskWorkflowComponent,
    TaskMessagesComponent,
    TaskFilesComponent,
    ProjectMembersModalComponent,
    TimelineGroupRowComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TasksRoutingModule,
    DragDropModule,
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
    MatDialogModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    QuillModule.forRoot(),
    SharedUiModule
  ]
})
export class DashboardProjectTasksModule {}
