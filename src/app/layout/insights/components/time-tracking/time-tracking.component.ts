import { Component, OnInit } from '@angular/core';

/**
 * Time Tracking Component
 * 
 * Displays time tracking metrics including:
 * - Time logged by project
 * - Daily/weekly time breakdown
 * - Time tracking trends
 * - Billable vs non-billable hours
 */

export interface TimeEntry {
  id: string;
  projectName: string;
  taskName: string;
  date: string;
  hours: number;
  minutes: number;
  billable: boolean;
  description?: string;
}

export interface ProjectTimeSummary {
  projectName: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  tasksCount: number;
  color: string;
}

export interface DailyTimeBreakdown {
  day: string;
  hours: number;
  billableHours: number;
  nonBillableHours: number;
}

@Component({
  selector: 'app-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss']
})
export class TimeTrackingComponent implements OnInit {

  Math = Math;

  /**
   * Dummy data for time entries
   */
  timeEntries: TimeEntry[] = [
    {
      id: '1',
      projectName: 'Website Redesign',
      taskName: 'Design Landing Page',
      date: '2024-01-15',
      hours: 4,
      minutes: 30,
      billable: true,
      description: 'Worked on landing page design'
    },
    {
      id: '2',
      projectName: 'Mobile App',
      taskName: 'Implement User Authentication',
      date: '2024-01-15',
      hours: 3,
      minutes: 15,
      billable: true
    },
    {
      id: '3',
      projectName: 'Backend Services',
      taskName: 'Write API Documentation',
      date: '2024-01-15',
      hours: 2,
      minutes: 0,
      billable: false
    },
    {
      id: '4',
      projectName: 'Website Redesign',
      taskName: 'Review Code Changes',
      date: '2024-01-14',
      hours: 1,
      minutes: 45,
      billable: true
    },
    {
      id: '5',
      projectName: 'Marketing Campaign',
      taskName: 'Create Marketing Campaign',
      date: '2024-01-14',
      hours: 5,
      minutes: 0,
      billable: true
    }
  ];

  /**
   * Dummy data for project time summary
   */
  projectTimeSummary: ProjectTimeSummary[] = [
    {
      projectName: 'Website Redesign',
      totalHours: 24.5,
      billableHours: 22.0,
      nonBillableHours: 2.5,
      tasksCount: 8,
      color: '#2196f3'
    },
    {
      projectName: 'Mobile App',
      totalHours: 18.75,
      billableHours: 18.75,
      nonBillableHours: 0,
      tasksCount: 6,
      color: '#4caf50'
    },
    {
      projectName: 'Backend Services',
      totalHours: 15.25,
      billableHours: 12.0,
      nonBillableHours: 3.25,
      tasksCount: 5,
      color: '#ff9800'
    },
    {
      projectName: 'Marketing Campaign',
      totalHours: 12.5,
      billableHours: 12.5,
      nonBillableHours: 0,
      tasksCount: 4,
      color: '#9c27b0'
    }
  ];

  /**
   * Dummy data for daily time breakdown
   */
  dailyTimeBreakdown: DailyTimeBreakdown[] = [
    { day: 'Mon', hours: 7.5, billableHours: 7.0, nonBillableHours: 0.5 },
    { day: 'Tue', hours: 8.0, billableHours: 7.5, nonBillableHours: 0.5 },
    { day: 'Wed', hours: 7.75, billableHours: 7.25, nonBillableHours: 0.5 },
    { day: 'Thu', hours: 6.5, billableHours: 6.0, nonBillableHours: 0.5 },
    { day: 'Fri', hours: 8.25, billableHours: 7.75, nonBillableHours: 0.5 },
    { day: 'Sat', hours: 4.0, billableHours: 4.0, nonBillableHours: 0 },
    { day: 'Sun', hours: 2.0, billableHours: 2.0, nonBillableHours: 0 }
  ];

  /**
   * Displayed columns for time entries table
   */
  displayedColumns: string[] = ['date', 'project', 'task', 'time', 'billable', 'actions'];

  /**
   * Total hours this week
   */
  get totalHoursThisWeek(): number {
    return this.dailyTimeBreakdown.reduce((sum, day) => sum + day.hours, 0);
  }

  /**
   * Total billable hours this week
   */
  get totalBillableHours(): number {
    return this.dailyTimeBreakdown.reduce((sum, day) => sum + day.billableHours, 0);
  }

  /**
   * Total non-billable hours this week
   */
  get totalNonBillableHours(): number {
    return this.dailyTimeBreakdown.reduce((sum, day) => sum + day.nonBillableHours, 0);
  }

  constructor() { }

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Format time (hours and minutes)
   */
  formatTime(hours: number, minutes: number): string {
    const totalMinutes = hours * 60 + minutes;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  /**
   * Get billable badge color
   */
  getBillableColor(billable: boolean): string {
    return billable ? 'billable-yes' : 'billable-no';
  }

  /**
   * Get maximum hours for chart scaling
   */
  getMaxHours(): number {
    return Math.max(...this.dailyTimeBreakdown.map(d => d.hours)) * 1.2;
  }
}

