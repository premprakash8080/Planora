import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-title',
  templateUrl: './app-page-title.component.html',
  styleUrls: ['./app-page-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPageTitleComponent {
  @Input() title = '';
  @Input() description = '';
}

