import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';

@Component({
  selector: 'app-calendar',
  templateUrl: './app-calendar.component.html',
  styleUrls: ['./app-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppCalendarComponent implements OnChanges, AfterViewInit {
  @Input() selected: Date | null = null;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;

  @Output() dateChange = new EventEmitter<Date>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild(MatCalendar) calendar?: MatCalendar<Date>;

  activeDate: Date = new Date();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected']) {
      this.syncActiveDate();
    }
  }

  ngAfterViewInit(): void {
    this.syncActiveDate();
  }

  handleSelected(date: Date | null): void {
    if (!date) {
      return;
    }
    this.selected = date;
    this.activeDate = date;
    if (this.calendar) {
      this.calendar.activeDate = date;
    }
    this.dateChange.emit(date);
  }

  goToday(): void {
    const today = new Date();
    this.handleSelected(today);
  }

  goPreviousMonth(): void {
    const previous = new Date(this.activeDate.getFullYear(), this.activeDate.getMonth() - 1, 1);
    this.setActiveDate(previous);
  }

  goNextMonth(): void {
    const next = new Date(this.activeDate.getFullYear(), this.activeDate.getMonth() + 1, 1);
    this.setActiveDate(next);
  }

  private syncActiveDate(): void {
    const target = this.selected ? new Date(this.selected) : new Date();
    this.setActiveDate(target, false);
  }

  private setActiveDate(date: Date, emit = true): void {
    this.activeDate = date;
    if (this.calendar) {
      this.calendar.activeDate = date;
    }
    if (emit && this.calendar) {
      this.calendar.updateTodaysDate();
    }
  }
}

