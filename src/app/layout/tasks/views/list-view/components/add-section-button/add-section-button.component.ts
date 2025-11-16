import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-add-section-button',
  templateUrl: './add-section-button.component.html',
  styleUrls: ['./add-section-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSectionButtonComponent {
  @Output() addSection = new EventEmitter<void>();
}


