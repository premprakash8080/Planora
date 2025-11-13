import { Component, OnInit } from '@angular/core';

/**
 * Team Performance Component
 * 
 * Displays team performance metrics including:
 * - Team member performance
 * - Task completion rates by team member
 * - Team productivity stats
 * - Collaboration metrics
 */

export interface TeamMember {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor?: string;
  avatarUrl?: string;
  role: string;
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
  productivityScore: number;
  status: 'active' | 'away' | 'offline';
}

export interface TeamMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-team-performance',
  templateUrl: './team-performance.component.html',
  styleUrls: ['./team-performance.component.scss']
})
export class TeamPerformanceComponent implements OnInit {

  Math = Math;

  /**
   * Dummy data for team metrics
   */
  teamMetrics: TeamMetric[] = [
    {
      id: '1',
      label: 'Team Productivity',
      value: 85,
      unit: '%',
      icon: 'trending_up',
      color: '#4caf50'
    },
    {
      id: '2',
      label: 'Average Completion Rate',
      value: 78,
      unit: '%',
      icon: 'check_circle',
      color: '#2196f3'
    },
    {
      id: '3',
      label: 'Active Team Members',
      value: 12,
      unit: 'members',
      icon: 'people',
      color: '#9c27b0'
    },
    {
      id: '4',
      label: 'Team Collaboration Score',
      value: 92,
      unit: '%',
      icon: 'group',
      color: '#ff9800'
    }
  ];

  /**
   * Dummy data for team members
   */
  teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatarInitials: 'SJ',
      avatarColor: '#2563eb',
      role: 'Frontend Developer',
      tasksCompleted: 45,
      tasksAssigned: 50,
      completionRate: 90,
      productivityScore: 88,
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatarInitials: 'MC',
      avatarColor: '#db2777',
      role: 'Backend Developer',
      tasksCompleted: 38,
      tasksAssigned: 42,
      completionRate: 90.5,
      productivityScore: 85,
      status: 'active'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      avatarInitials: 'ER',
      avatarColor: '#f97316',
      role: 'UI/UX Designer',
      tasksCompleted: 32,
      tasksAssigned: 35,
      completionRate: 91.4,
      productivityScore: 90,
      status: 'active'
    },
    {
      id: '4',
      name: 'David Kim',
      avatarInitials: 'DK',
      avatarColor: '#10b981',
      role: 'Full Stack Developer',
      tasksCompleted: 42,
      tasksAssigned: 48,
      completionRate: 87.5,
      productivityScore: 82,
      status: 'away'
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      avatarInitials: 'LA',
      avatarColor: '#8b5cf6',
      role: 'Project Manager',
      tasksCompleted: 28,
      tasksAssigned: 30,
      completionRate: 93.3,
      productivityScore: 95,
      status: 'active'
    },
    {
      id: '6',
      name: 'James Wilson',
      avatarInitials: 'JW',
      avatarColor: '#0ea5e9',
      role: 'QA Engineer',
      tasksCompleted: 35,
      tasksAssigned: 40,
      completionRate: 87.5,
      productivityScore: 80,
      status: 'active'
    }
  ];

  /**
   * Displayed columns for team members table
   */
  displayedColumns: string[] = ['member', 'role', 'tasksAssigned', 'tasksCompleted', 'completionRate', 'productivityScore', 'status'];

  constructor() { }

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Get status badge color class
   */
  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'status-active',
      'away': 'status-away',
      'offline': 'status-offline'
    };
    return statusMap[status] || 'status-offline';
  }

  /**
   * Get productivity score color
   */
  getProductivityColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 75) return '#2196f3';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }
}

