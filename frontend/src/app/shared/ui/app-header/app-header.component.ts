import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  @Input() appTitle = 'Planora';
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search tasks, projects, people...';
  @Input() notifications = 3;
  @Input() userInitials = 'JD';
  @Input() userRole = 'Product Manager';
  @Input() userAvatarUrl?: string;

  @Output() menuToggle = new EventEmitter<void>();
  @Output() createClicked = new EventEmitter<void>();
  @Output() searchChanged = new EventEmitter<string>();

  onSearchChange(value: string): void {
    this.searchChanged.emit(value);
  }
}

