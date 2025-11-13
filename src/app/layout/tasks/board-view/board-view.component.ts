import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tasks-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardViewComponent {}

