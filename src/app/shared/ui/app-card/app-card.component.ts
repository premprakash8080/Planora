import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './app-card.component.html',
  styleUrls: ['./app-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppCardComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() interactive = false;

  @HostBinding('class.app-card--interactive')
  get hostInteractive(): boolean {
    return this.interactive;
  }

  @HostBinding('class.app-card--padded-none')
  get noPadding(): boolean {
    return this.padding === 'none';
  }

  @HostBinding('class.app-card--padded-sm')
  get smallPadding(): boolean {
    return this.padding === 'sm';
  }

  @HostBinding('class.app-card--padded-lg')
  get largePadding(): boolean {
    return this.padding === 'lg';
  }
}

