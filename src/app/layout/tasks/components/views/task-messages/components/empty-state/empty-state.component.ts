import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-messages-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class MessagesEmptyStateComponent {
  @Input() isDarkTheme = false;
}

