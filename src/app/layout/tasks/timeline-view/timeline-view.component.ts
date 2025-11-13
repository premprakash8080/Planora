import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tasks-timeline-view',
  templateUrl: './timeline-view.component.html',
  styleUrls: ['./timeline-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineViewComponent {}

