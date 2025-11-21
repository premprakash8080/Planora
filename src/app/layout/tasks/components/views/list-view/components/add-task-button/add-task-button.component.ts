import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-add-task-button',
  template: `
    <button class="add-task" type="button" (click)="addTask.emit()">
      <mat-icon>add</mat-icon>
      Add task…
    </button>
  `,
  styles: [`
    .add-task {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 20px 18px;
      color: #64748b;
      background: transparent;
      border: none;
      border-top: 1px dashed #e5e7eb;
      font-size: 14px;
      cursor: pointer;
    }
    .add-task:hover { background: #f8fafc; color: #1f2937; }
    .add-task mat-icon { font-size: 18px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTaskButtonComponent {
  @Output() addTask = new EventEmitter<void>();
}


