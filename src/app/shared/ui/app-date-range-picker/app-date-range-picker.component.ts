import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  ElementRef,
  ViewChild
} from '@angular/core';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './app-date-range-picker.component.html',
  styleUrls: ['./app-date-range-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDateRangePickerComponent implements OnInit, OnChanges {
  @Input() startDate: Date | null = null;
  @Input() dueDate: Date | null = null;
  @Output() dateRangeChange = new EventEmitter<DateRange>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('calendarContainer', { static: false }) calendarContainer!: ElementRef;

  // Calendar state
  currentMonth: Date = new Date();
  selectedStart: Date | null = null;
  selectedEnd: Date | null = null;
  hoverDate: Date | null = null;
  isSelecting: boolean = false;

  // Calendar grid
  weeks: Date[][] = [];
  today: Date = new Date();

  constructor(
    private cdr: ChangeDetectorRef,
    private el: ElementRef
  ) {
    this.today.setHours(0, 0, 0, 0);
  }

  ngOnInit(): void {
    this.initializeSelection();
    // Start calendar on current month (today)
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['dueDate']) {
      this.initializeSelection();
      this.generateCalendar();
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    this.cancel.emit();
  }

  // Note: Click outside is handled by the dropdown popover component
  // We don't need to handle it here to avoid conflicts

  /**
   * Initialize selection from input dates
   */
  private initializeSelection(): void {
    if (this.startDate && this.dueDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.dueDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // If same day, treat as single date
      if (this.isSameDay(start, end)) {
        this.selectedStart = start;
        this.selectedEnd = start; // Set end to same as start for single date
        this.isSelecting = false;
      } else {
        this.selectedStart = start;
        this.selectedEnd = end;
        this.isSelecting = false;
      }
    } else if (this.dueDate) {
      const due = new Date(this.dueDate);
      due.setHours(0, 0, 0, 0);
      this.selectedStart = due;
      this.selectedEnd = due; // Single date
      this.isSelecting = false;
    } else {
      this.selectedStart = null;
      this.selectedEnd = null;
      this.isSelecting = false;
    }
    this.hoverDate = null;
  }

  /**
   * Generate calendar grid for current month
   */
  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Start from Sunday of the week containing the first day
    const dayOfWeek = firstDay.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const weeks: Date[][] = [];
    let currentDate = new Date(startDate);

    // Generate 6 weeks (42 days) to ensure full month display
    for (let week = 0; week < 6; week++) {
      const weekDays: Date[] = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    this.weeks = weeks;
  }

  /**
   * Navigate to previous month
   */
  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
    this.cdr.markForCheck();
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
    this.cdr.markForCheck();
  }

  /**
   * Go to today
   */
  goToToday(): void {
    this.currentMonth = new Date();
    this.generateCalendar();
    this.cdr.markForCheck();
  }

  /**
   * Handle date click
   */
  onDateClick(date: Date): void {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    // If no selection started, start selection with this date
    if (!this.selectedStart) {
      this.selectedStart = normalized;
      this.selectedEnd = null;
      this.isSelecting = true;
      this.hoverDate = null;
    }
    // If start is selected but no end (in selecting mode)
    else if (this.isSelecting && !this.selectedEnd) {
      if (this.isSameDay(this.selectedStart, normalized)) {
        // Clicked same day - set as single date (both start and end)
        this.selectedEnd = normalized;
        this.isSelecting = false;
        this.hoverDate = null;
        this.emitSelection();
      } else {
        // Different day - set as range
        if (normalized < this.selectedStart) {
          // Clicked before start, swap them
          this.selectedEnd = this.selectedStart;
          this.selectedStart = normalized;
        } else {
          this.selectedEnd = normalized;
        }
        this.isSelecting = false;
        this.hoverDate = null;
        this.emitSelection();
      }
    }
    // If both are selected (completed selection), allow updating
    else if (this.selectedStart && this.selectedEnd && !this.isSelecting) {
      // Check if clicking on an already selected date
      const isClickingOnSelected = this.isSameDay(normalized, this.selectedStart) || 
                                    this.isSameDay(normalized, this.selectedEnd) ||
                                    (normalized >= this.selectedStart && normalized <= this.selectedEnd);
      
      if (isClickingOnSelected && this.isSameDay(this.selectedStart, this.selectedEnd)) {
        // Clicking on a single selected date - immediately update to that date
        this.selectedStart = normalized;
        this.selectedEnd = normalized;
        this.isSelecting = false;
        this.hoverDate = null;
        this.emitSelection();
      } else {
        // Clicking on any date when range is set - start new selection
        this.selectedStart = normalized;
        this.selectedEnd = null;
        this.isSelecting = true;
        this.hoverDate = null;
      }
    }

    this.cdr.markForCheck();
  }

  /**
   * Handle date hover
   */
  onDateHover(date: Date): void {
    if (this.isSelecting && this.selectedStart && !this.selectedEnd) {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      
      // Only update hover if it's different from start
      if (!this.isSameDay(normalized, this.selectedStart)) {
        this.hoverDate = normalized;
        this.cdr.markForCheck();
      } else {
        this.hoverDate = null;
        this.cdr.markForCheck();
      }
    }
  }

  /**
   * Clear hover
   */
  onDateLeave(): void {
    this.hoverDate = null;
    this.cdr.markForCheck();
  }

  /**
   * Get effective end date (selected or hover)
   */
  getEffectiveEnd(): Date | null {
    if (this.selectedEnd) return this.selectedEnd;
    if (this.hoverDate && this.selectedStart) {
      // If hover is before start, swap them visually
      if (this.hoverDate < this.selectedStart) {
        return this.selectedStart;
      }
      return this.hoverDate;
    }
    return null;
  }

  /**
   * Get effective start date (for range display)
   */
  getEffectiveStart(): Date | null {
    if (!this.selectedStart) return null;
    // When hovering before start, show hover as start
    if (this.hoverDate && !this.selectedEnd && this.hoverDate < this.selectedStart) {
      return this.hoverDate;
    }
    return this.selectedStart;
  }

  /**
   * Check if date is in range (between start and end, excluding start/end)
   */
  isInRange(date: Date): boolean {
    const effectiveStart = this.getEffectiveStart();
    const effectiveEnd = this.getEffectiveEnd();
    
    if (!effectiveStart || !effectiveEnd) return false;

    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    // Exclude start and end dates (they have their own styling)
    return normalized > effectiveStart && normalized < effectiveEnd;
  }

  /**
   * Check if date is in hover range (for visual feedback)
   */
  isInHoverRange(date: Date): boolean {
    if (!this.selectedStart || this.selectedEnd || !this.hoverDate) return false;
    
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    const start = this.hoverDate < this.selectedStart ? this.hoverDate : this.selectedStart;
    const end = this.hoverDate < this.selectedStart ? this.selectedStart : this.hoverDate;

    return normalized > start && normalized < end;
  }

  /**
   * Check if date is start of range
   */
  isStart(date: Date): boolean {
    const effectiveStart = this.getEffectiveStart();
    if (!effectiveStart) return false;
    return this.isSameDay(date, effectiveStart);
  }

  /**
   * Check if date is end of range
   */
  isEnd(date: Date): boolean {
    const effectiveEnd = this.getEffectiveEnd();
    if (!effectiveEnd) return false;
    return this.isSameDay(date, effectiveEnd);
  }

  /**
   * Check if date is selected (single date or part of range)
   */
  isSelected(date: Date): boolean {
    if (!this.selectedStart) return false;
    
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    // Single date selection
    if (this.selectedEnd && this.isSameDay(this.selectedStart, this.selectedEnd)) {
      return this.isSameDay(date, this.selectedStart);
    }

    // Range selection - include start and end dates
    if (this.selectedEnd) {
      return normalized >= this.selectedStart && normalized <= this.selectedEnd;
    }

    // Only start selected (in progress)
    return this.isSameDay(date, this.selectedStart);
  }

  /**
   * Check if date is today
   */
  isToday(date: Date): boolean {
    return this.isSameDay(date, this.today);
  }

  /**
   * Check if date is in current month
   */
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth() &&
           date.getFullYear() === this.currentMonth.getFullYear();
  }

  /**
   * Get month/year label
   */
  getMonthLabel(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Get day name abbreviation
   */
  getDayName(dayIndex: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  }

  /**
   * Emit selection to parent
   */
  private emitSelection(): void {
    if (this.selectedStart) {
      const end = this.selectedEnd || this.selectedStart;
      this.dateRangeChange.emit({
        start: this.selectedStart,
        end: end
      });
    }
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Check if date is hover start (when hovering before selected start)
   */
  isHoverStart(date: Date): boolean {
    if (!this.selectedStart || this.selectedEnd || !this.hoverDate) return false;
    if (this.hoverDate < this.selectedStart) {
      return this.isSameDay(date, this.hoverDate);
    }
    return false;
  }

  /**
   * Check if date is hover end
   */
  isHoverEnd(date: Date): boolean {
    if (!this.selectedStart || this.selectedEnd || !this.hoverDate) return false;
    if (this.hoverDate >= this.selectedStart) {
      return this.isSameDay(date, this.hoverDate);
    }
    return false;
  }

  /**
   * Get hint text based on selection state
   */
  getHintText(): string {
    if (!this.selectedStart) {
      return 'Click a date to set start & due dates';
    }
    if (this.selectedEnd && !this.isSelecting) {
      if (this.isSameDay(this.selectedStart, this.selectedEnd)) {
        return 'Single date selected';
      }
      return 'Range selected';
    }
    if (this.isSelecting) {
      if (this.hoverDate && !this.isSameDay(this.selectedStart, this.hoverDate)) {
        return 'Click to confirm range';
      }
      return 'Hover to select end date';
    }
    return 'Hover to select end date';
  }
}

