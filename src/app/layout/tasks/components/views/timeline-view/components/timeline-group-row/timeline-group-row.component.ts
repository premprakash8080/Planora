import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { TimelineGroup, TimelineDay, TimelineTask } from '../../../../../services/timeline-view.service';

@Component({
  selector: 'app-timeline-group-row',
  templateUrl: './timeline-group-row.component.html',
  styleUrls: ['./timeline-group-row.component.scss'],
})
export class TimelineGroupRowComponent {
  @Input() group!: TimelineGroup;
  @Input() timelineDays: TimelineDay[] = [];
  @Input() dayWidthPx = 32;
  @Input() timelineStartDate: string | null = null;
  @Input() todayOffsetPx: number | null = null;
  @Input() groupColumnWidth = 240;

  @Output() taskDragEnded = new EventEmitter<{ event: CdkDragEnd; task: TimelineTask; group: TimelineGroup }>();
  @Output() toggleCollapse = new EventEmitter<TimelineGroup>();

  get timelineWidthPx(): number {
    return this.timelineDays.length * this.dayWidthPx;
  }

  onTaskDragEnded(event: CdkDragEnd, task: TimelineTask): void {
    this.taskDragEnded.emit({ event, task, group: this.group });
  }

  onToggleCollapse(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleCollapse.emit(this.group);
  }

  getTaskOffset(task: TimelineTask): number {
    if (!this.timelineStartDate) {
      return 0;
    }
    const start = task.startDate || this.timelineStartDate;
    const diff = this.dateDiffInDays(this.timelineStartDate, start);
    return Math.max(0, diff) * this.dayWidthPx;
  }

  getTaskWidth(task: TimelineTask): number {
    const start = task.startDate || this.timelineStartDate;
    const end = task.dueDate || start;
    const diff = this.dateDiffInDays(start, end) + 1;
    return Math.max(1, diff) * this.dayWidthPx;
  }

  trackTaskById = (_: number, task: TimelineTask) => task.id;

  private dateDiffInDays(from: string, to: string): number {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}


