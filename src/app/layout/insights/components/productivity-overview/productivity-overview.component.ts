import { Component, OnInit } from '@angular/core';

/**
 * Productivity Overview Component
 * 
 * Displays productivity metrics and insights including:
 * - Productivity trends
 * - Task completion rates
 * - Work efficiency metrics
 * - Daily/weekly productivity stats
 */

export interface ProductivityMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

export interface ProductivityTrend {
  day: string;
  tasksCompleted: number;
  hoursWorked: number;
  efficiency: number;
}

@Component({
  selector: 'app-productivity-overview',
  templateUrl: './productivity-overview.component.html',
  styleUrls: ['./productivity-overview.component.scss']
})
export class ProductivityOverviewComponent implements OnInit {

  Math = Math;

  /**
   * Dummy data for productivity metrics
   */
  productivityMetrics: ProductivityMetric[] = [
    {
      id: '1',
      label: 'Tasks Completed Today',
      value: 12,
      unit: 'tasks',
      change: 15,
      changeType: 'increase',
      icon: 'check_circle',
      color: '#4caf50'
    },
    {
      id: '2',
      label: 'Average Completion Time',
      value: 3.5,
      unit: 'hours',
      change: -8,
      changeType: 'decrease',
      icon: 'schedule',
      color: '#2196f3'
    },
    {
      id: '3',
      label: 'Productivity Score',
      value: 87,
      unit: '%',
      change: 5,
      changeType: 'increase',
      icon: 'trending_up',
      color: '#9c27b0'
    },
    {
      id: '4',
      label: 'Focus Time',
      value: 6.5,
      unit: 'hours',
      change: 12,
      changeType: 'increase',
      icon: 'timer',
      color: '#ff9800'
    }
  ];

  /**
   * Dummy data for productivity trends (last 7 days)
   */
  productivityTrends: ProductivityTrend[] = [
    { day: 'Mon', tasksCompleted: 8, hoursWorked: 6.5, efficiency: 85 },
    { day: 'Tue', tasksCompleted: 10, hoursWorked: 7.0, efficiency: 88 },
    { day: 'Wed', tasksCompleted: 12, hoursWorked: 7.5, efficiency: 90 },
    { day: 'Thu', tasksCompleted: 9, hoursWorked: 6.0, efficiency: 82 },
    { day: 'Fri', tasksCompleted: 14, hoursWorked: 8.0, efficiency: 92 },
    { day: 'Sat', tasksCompleted: 6, hoursWorked: 4.0, efficiency: 75 },
    { day: 'Sun', tasksCompleted: 4, hoursWorked: 3.0, efficiency: 70 }
  ];

  /**
   * Selected time period for filtering
   */
  selectedPeriod: 'week' | 'month' | 'quarter' = 'week';

  /**
   * Pre-calculated max values for chart scaling
   */
  maxTasksCompleted: number = 0;
  maxHoursWorked: number = 0;
  maxEfficiency: number = 0;

  /**
   * Pre-calculated summary values
   */
  totalTasksThisWeek: number = 0;
  totalHoursWorked: number = 0;
  averageEfficiency: number = 0;
  bestDay: string = '';

  constructor() { }

  ngOnInit(): void {
    // Calculate max values for chart scaling
    this.maxTasksCompleted = Math.max(...this.productivityTrends.map(t => t.tasksCompleted)) * 1.2;
    this.maxHoursWorked = Math.max(...this.productivityTrends.map(t => t.hoursWorked)) * 1.2;
    this.maxEfficiency = Math.max(...this.productivityTrends.map(t => t.efficiency)) * 1.2;
    
    // Calculate summary values
    this.totalTasksThisWeek = this.productivityTrends.reduce((sum, t) => sum + t.tasksCompleted, 0);
    this.totalHoursWorked = this.productivityTrends.reduce((sum, t) => sum + t.hoursWorked, 0);
    this.averageEfficiency = this.productivityTrends.reduce((sum, t) => sum + t.efficiency, 0) / this.productivityTrends.length;
    this.bestDay = this.productivityTrends.reduce((max, t) => t.tasksCompleted > max.tasksCompleted ? t : max, this.productivityTrends[0]).day;
  }

  /**
   * Get the change indicator icon based on change type
   */
  getChangeIcon(changeType: string): string {
    return changeType === 'increase' ? 'trending_up' : 'trending_down';
  }

  /**
   * Get percentage height for tasks completed chart
   */
  getTasksCompletedHeight(tasksCompleted: number): number {
    return (tasksCompleted / this.maxTasksCompleted) * 100;
  }

  /**
   * Get percentage height for hours worked chart
   */
  getHoursWorkedHeight(hoursWorked: number): number {
    return (hoursWorked / this.maxHoursWorked) * 100;
  }

  /**
   * Get percentage height for efficiency chart
   */
  getEfficiencyHeight(efficiency: number): number {
    return (efficiency / this.maxEfficiency) * 100;
  }
}

