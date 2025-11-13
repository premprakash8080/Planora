import { Component, OnInit } from '@angular/core';

/**
 * Report Component
 * 
 * This component displays analytics reports including:
 * - Key Metrics: Total Tasks, Completed Tasks, In Progress, Overdue Tasks
 * - Task Status Distribution: Breakdown of tasks by status
 * - Project Performance: Project performance table with completion rates
 */

/**
 * Interface for Report Data
 */
export interface ReportData {
  id: string;
  metric: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

/**
 * Interface for Task Analytics
 */
export interface TaskAnalytics {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  // Expose Math object to template
  Math = Math;

  /**
   * Dummy data for key metrics
   * In a real application, this would come from a service/API
   */
  reportMetrics: ReportData[] = [
    {
      id: '1',
      metric: 'Total Tasks',
      value: 156,
      change: 12,
      changeType: 'increase',
      icon: 'task',
      color: '#2196f3'
    },
    {
      id: '2',
      metric: 'Completed Tasks',
      value: 98,
      change: 8,
      changeType: 'increase',
      icon: 'check_circle',
      color: '#4caf50'
    },
    {
      id: '3',
      metric: 'In Progress',
      value: 42,
      change: -5,
      changeType: 'decrease',
      icon: 'hourglass_empty',
      color: '#ff9800'
    },
    {
      id: '4',
      metric: 'Overdue Tasks',
      value: 16,
      change: 3,
      changeType: 'increase',
      icon: 'warning',
      color: '#f44336'
    }
  ];

  /**
   * Dummy data for task status analytics
   * In a real application, this would come from a service/API
   */
  taskStatusAnalytics: TaskAnalytics[] = [
    {
      status: 'To Do',
      count: 45,
      percentage: 28.8,
      color: '#9e9e9e'
    },
    {
      status: 'In Progress',
      count: 42,
      percentage: 26.9,
      color: '#ff9800'
    },
    {
      status: 'In Review',
      count: 23,
      percentage: 14.7,
      color: '#2196f3'
    },
    {
      status: 'Completed',
      count: 98,
      percentage: 62.8,
      color: '#4caf50'
    },
    {
      status: 'Blocked',
      count: 8,
      percentage: 5.1,
      color: '#f44336'
    }
  ];

  /**
   * Dummy data for project performance
   * In a real application, this would come from a service/API
   */
  projectPerformance = [
    {
      projectName: 'Website Redesign',
      totalTasks: 45,
      completed: 32,
      completionRate: 71.1,
      status: 'On Track'
    },
    {
      projectName: 'Mobile App',
      totalTasks: 38,
      completed: 28,
      completionRate: 73.7,
      status: 'On Track'
    },
    {
      projectName: 'Marketing Campaign',
      totalTasks: 29,
      completed: 18,
      completionRate: 62.1,
      status: 'At Risk'
    },
    {
      projectName: 'Backend Services',
      totalTasks: 44,
      completed: 20,
      completionRate: 45.5,
      status: 'Delayed'
    }
  ];

  /**
   * Displayed columns for the project performance table
   */
  displayedColumns: string[] = ['projectName', 'totalTasks', 'completed', 'completionRate', 'status'];

  constructor() { }

  ngOnInit(): void {
    // Component initialization
    // In a real app, you would fetch data from a service here
  }

  /**
   * Get the change indicator icon based on change type
   */
  getChangeIcon(changeType: string): string {
    return changeType === 'increase' ? 'trending_up' : 'trending_down';
  }

  /**
   * Get the status badge color class
   */
  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'On Track': 'status-success',
      'At Risk': 'status-warning',
      'Delayed': 'status-error'
    };
    return statusMap[status] || 'status-default';
  }
}
