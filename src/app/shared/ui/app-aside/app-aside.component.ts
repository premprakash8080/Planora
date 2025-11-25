import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-aside',
  templateUrl: './app-aside.component.html',
  styleUrls: ['./app-aside.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule]
})
export class AppAsideComponent {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() width: string = 'min(45vw, 50vw)';
  @Input() showCloseButton: boolean = true;
  @Input() showHeader: boolean = true;

  @Output() close = new EventEmitter<void>();
  @Output() menuClick = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onMenuClick(): void {
    this.menuClick.emit();
  }
}

