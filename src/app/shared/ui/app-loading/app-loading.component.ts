import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type LoadingSize = 'sm' | 'md' | 'lg';
type LoadingVariant = 'spinner' | 'dots' | 'pulse';

@Component({
  selector: 'app-loading',
  templateUrl: './app-loading.component.html',
  styleUrls: ['./app-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppLoadingComponent {
  @Input() size: LoadingSize = 'md';
  @Input() variant: LoadingVariant = 'spinner';
  @Input() message: string = 'Loading...';
  @Input() fullScreen: boolean = false;
  @Input() overlay: boolean = false;
}

