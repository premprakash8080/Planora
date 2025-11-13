import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  templateUrl: './app-avatar.component.html',
  styleUrls: ['./app-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppAvatarComponent {
  private static readonly DEFAULT_COLOR = '#ff7300';

  @Input() src?: string | null;
  @Input() initials = '';
  @Input() alt = '';
  @Input() color?: string;
  @Input() clickable = false;
  @Input() size: AvatarSize = 'md';

  @HostBinding('class')
  get hostClasses(): string {
    const classes = ['app-avatar', `app-avatar--${this.size}`];
    if (this.clickable) {
      classes.push('app-avatar--clickable');
    }
    if (!this.src) {
      classes.push('app-avatar--placeholder');
      if (!this.color) {
        classes.push('app-avatar--placeholder-default');
      }
    }
    return classes.join(' ');
  }

  @HostBinding('style.--avatar-bg')
  get backgroundColor(): string {
    return this.color || AppAvatarComponent.DEFAULT_COLOR;
  }
}

