import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TasksRoutingModule } from './tasks-routing.module';
import { ListViewComponent } from './list-view/list-view.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { SubtaskListComponent } from './subtask-list/subtask-list.component';
import { TaskDescriptionEditorComponent } from './task-description-editor/task-description-editor.component';
import { BoardViewComponent } from './board-view/board-view.component';
import { TimelineViewComponent } from './timeline-view/timeline-view.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
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

@NgModule({
  declarations: [
    ListViewComponent,
    BoardViewComponent,
    TimelineViewComponent,
    CalendarViewComponent,
    DashboardViewComponent,
    TaskDetailComponent,
    SubtaskListComponent,
    TaskDescriptionEditorComponent
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
