import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTableComponent {
  @Input() dense = false;
  @Input() striped = true;

  @HostBinding('class.app-table--dense')
  get hostDense(): boolean {
    return this.dense;
  }

  @HostBinding('class.app-table--striped')
  get hostStriped(): boolean {
    return this.striped;
  }
}

