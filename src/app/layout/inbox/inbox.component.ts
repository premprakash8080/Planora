import { Component, OnInit } from '@angular/core';

/**
 * Inbox Component
 * 
 * Displays task-related updates similar to Asana's Inbox or activity feed.
 * Shows task updates with information like task name, project name, update type, and time.
 */
export interface InboxUpdate {
  id: string;
  taskName: string;
  projectName: string;
  updateType: 'created' | 'updated' | 'completed' | 'assigned' | 'comment';
  updateDescription: string;
  time: string;
  timeAgo: string;
  userAvatar?: string;
  userName: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {

  /**
   * Dummy data for inbox updates
   * In a real application, this would come from a service/API
   */
  inboxUpdates: InboxUpdate[] = [
    {
      id: '1',
      taskName: 'Design Landing Page',
      projectName: 'Website Redesign',
      updateType: 'completed',
      updateDescription: 'marked as completed',
      time: '2024-01-15T10:30:00',
      timeAgo: '2 hours ago',
      userName: 'Sarah Johnson',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '2',
      taskName: 'Implement Login API',
      projectName: 'Mobile App v2',
      updateType: 'assigned',
      updateDescription: 'started working on it',
      time: '2024-01-15T11:45:00',
      timeAgo: '1 hour ago',
      userName: 'Michael Chen',
      icon: 'play_circle',
      iconColor: 'text-blue-500'
    },
    {
      id: '3',
      taskName: 'Fix Navigation Bug',
      projectName: 'E-commerce Platform',
      updateType: 'completed',
      updateDescription: 'resolved the issue',
      time: '2024-01-15T12:15:00',
      timeAgo: '45 minutes ago',
      userName: 'Emily Davis',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '4',
      taskName: 'Write Unit Tests',
      projectName: 'Payment Gateway',
      updateType: 'comment',
      updateDescription: 'added comment: "Need to cover edge cases"',
      time: '2024-01-15T13:00:00',
      timeAgo: '15 minutes ago',
      userName: 'Raj Patel',
      icon: 'comment',
      iconColor: 'text-gray-500'
    },
    {
      id: '5',
      taskName: 'Update Dashboard UI',
      projectName: 'Analytics Tool',
      updateType: 'completed',
      updateDescription: 'marked as completed',
      time: '2024-01-15T09:20:00',
      timeAgo: '3 hours ago',
      userName: 'Lisa Wang',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '6',
      taskName: 'Deploy to Staging',
      projectName: 'CRM System',
      updateType: 'assigned',
      updateDescription: 'deployment in progress',
      time: '2024-01-15T14:00:00',
      timeAgo: '5 minutes ago',
      userName: 'David Kim',
      icon: 'cloud_upload',
      iconColor: 'text-purple-500'
    },
    {
      id: '7',
      taskName: 'Review Pull Request',
      projectName: 'API Refactor',
      updateType: 'comment',
      updateDescription: 'left review comments',
      time: '2024-01-15T08:30:00',
      timeAgo: '4 hours ago',
      userName: 'Anna Rodriguez',
      icon: 'comment',
      iconColor: 'text-gray-500'
    },
    {
      id: '8',
      taskName: 'Add Search Feature',
      projectName: 'Knowledge Base',
      updateType: 'completed',
      updateDescription: 'feature implemented',
      time: '2024-01-14T16:45:00',
      timeAgo: '1 day ago',
      userName: 'James Wilson',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '9',
      taskName: 'Optimize Database Queries',
      projectName: 'Reporting Module',
      updateType: 'assigned',
      updateDescription: 'optimizing slow queries',
      time: '2024-01-15T10:00:00',
      timeAgo: '2.5 hours ago',
      userName: 'Priya Sharma',
      icon: 'tune',
      iconColor: 'text-orange-500'
    },
    {
      id: '10',
      taskName: 'Create User Onboarding Flow',
      projectName: 'SaaS Product',
      updateType: 'completed',
      updateDescription: 'onboarding flow finalized',
      time: '2024-01-13T11:30:00',
      timeAgo: '2 days ago',
      userName: 'Tom Brown',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '11',
      taskName: 'Fix Mobile Responsiveness',
      projectName: 'Marketing Site',
      updateType: 'completed',
      updateDescription: 'mobile issues resolved',
      time: '2024-01-15T11:00:00',
      timeAgo: '1.5 hours ago',
      userName: 'Sophie Martin',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '12',
      taskName: 'Integrate Stripe Payments',
      projectName: 'Subscription Service',
      updateType: 'assigned',
      updateDescription: 'setting up webhook handlers',
      time: '2024-01-15T13:30:00',
      timeAgo: '30 minutes ago',
      userName: 'Alex Turner',
      icon: 'credit_card',
      iconColor: 'text-indigo-500'
    },
    {
      id: '13',
      taskName: 'Update Documentation',
      projectName: 'Internal Tools',
      updateType: 'completed',
      updateDescription: 'docs updated with new API endpoints',
      time: '2024-01-14T14:20:00',
      timeAgo: '22 hours ago',
      userName: 'Nina Patel',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '14',
      taskName: 'Run Security Audit',
      projectName: 'Banking App',
      updateType: 'comment',
      updateDescription: 'audit completed, 3 vulnerabilities found',
      time: '2024-01-15T09:00:00',
      timeAgo: '4 hours ago',
      userName: 'Carlos Mendoza',
      icon: 'security',
      iconColor: 'text-red-500'
    },
    {
      id: '15',
      taskName: 'Design New Icons',
      projectName: 'Brand Refresh',
      updateType: 'completed',
      updateDescription: 'icon set delivered',
      time: '2024-01-12T15:45:00',
      timeAgo: '3 days ago',
      userName: 'Emma Clarke',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '16',
      taskName: 'Migrate to React 18',
      projectName: 'Legacy Dashboard',
      updateType: 'assigned',
      updateDescription: 'upgrading dependencies',
      time: '2024-01-15T12:00:00',
      timeAgo: '1 hour ago',
      userName: 'Omar Farooq',
      icon: 'upgrade',
      iconColor: 'text-teal-500'
    },
    {
      id: '17',
      taskName: 'Add Dark Mode',
      projectName: 'Design System',
      updateType: 'completed',
      updateDescription: 'dark mode implemented',
      time: '2024-01-14T10:30:00',
      timeAgo: '1 day ago',
      userName: 'Rachel Green',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '18',
      taskName: 'Setup CI/CD Pipeline',
      projectName: 'Microservices',
      updateType: 'completed',
      updateDescription: 'pipeline configured',
      time: '2024-01-15T07:45:00',
      timeAgo: '5 hours ago',
      userName: 'Liam Nguyen',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '19',
      taskName: 'Improve Accessibility',
      projectName: 'Public Website',
      updateType: 'assigned',
      updateDescription: 'adding ARIA labels',
      time: '2024-01-15T11:15:00',
      timeAgo: '1.5 hours ago',
      userName: 'Isabella Rossi',
      icon: 'accessibility',
      iconColor: 'text-yellow-500'
    },
    {
      id: '20',
      taskName: 'Refactor Authentication',
      projectName: 'Admin Panel',
      updateType: 'completed',
      updateDescription: 'JWT authentication implemented',
      time: '2024-01-13T09:00:00',
      timeAgo: '2 days ago',
      userName: 'Victor Silva',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '21',
      taskName: 'Add Export to PDF',
      projectName: 'Reporting Tool',
      updateType: 'comment',
      updateDescription: 'feature requested by client',
      time: '2024-01-15T10:45:00',
      timeAgo: '2 hours ago',
      userName: 'Maya Kapoor',
      icon: 'picture_as_pdf',
      iconColor: 'text-red-500'
    },
    {
      id: '22',
      taskName: 'Optimize Image Loading',
      projectName: 'Media Gallery',
      updateType: 'completed',
      updateDescription: 'lazy loading implemented',
      time: '2024-01-14T13:15:00',
      timeAgo: '23 hours ago',
      userName: 'Ethan Park',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '23',
      taskName: 'Create API Documentation',
      projectName: 'REST Services',
      updateType: 'assigned',
      updateDescription: 'documenting endpoints',
      time: '2024-01-15T13:45:00',
      timeAgo: '15 minutes ago',
      userName: 'Zoe Williams',
      icon: 'description',
      iconColor: 'text-blue-500'
    },
    {
      id: '24',
      taskName: 'Implement Rate Limiting',
      projectName: 'Public API',
      updateType: 'completed',
      updateDescription: 'rate limiting added',
      time: '2024-01-15T08:15:00',
      timeAgo: '4.5 hours ago',
      userName: 'Noah Andersson',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '25',
      taskName: 'Design Email Templates',
      projectName: 'Newsletter System',
      updateType: 'completed',
      updateDescription: '5 templates designed',
      time: '2024-01-11T14:00:00',
      timeAgo: '4 days ago',
      userName: 'Olivia Harris',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '26',
      taskName: 'Add Multi-language Support',
      projectName: 'Global App',
      updateType: 'assigned',
      updateDescription: 'adding Spanish translations',
      time: '2024-01-15T12:30:00',
      timeAgo: '30 minutes ago',
      userName: 'Diego Morales',
      icon: 'language',
      iconColor: 'text-purple-500'
    },
    {
      id: '27',
      taskName: 'Fix Memory Leak',
      projectName: 'Desktop App',
      updateType: 'completed',
      updateDescription: 'memory leak resolved',
      time: '2024-01-14T11:45:00',
      timeAgo: '1 day ago',
      userName: 'Aisha Khan',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '28',
      taskName: 'Setup Monitoring Alerts',
      projectName: 'Production Environment',
      updateType: 'completed',
      updateDescription: 'alerts configured',
      time: '2024-01-15T09:45:00',
      timeAgo: '3 hours ago',
      userName: 'Benjamin Lee',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    },
    {
      id: '29',
      taskName: 'Create User Analytics',
      projectName: 'Dashboard v3',
      updateType: 'assigned',
      updateDescription: 'building analytics charts',
      time: '2024-01-15T13:15:00',
      timeAgo: '45 minutes ago',
      userName: 'Charlotte Dubois',
      icon: 'bar_chart',
      iconColor: 'text-cyan-500'
    },
    {
      id: '30',
      taskName: 'Update Privacy Policy',
      projectName: 'Compliance Update',
      updateType: 'completed',
      updateDescription: 'policy updated for GDPR',
      time: '2024-01-10T10:00:00',
      timeAgo: '5 days ago',
      userName: 'Gabriel Costa',
      icon: 'check_circle',
      iconColor: 'text-green-500'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Component initialization
    // In a real app, you would fetch data from a service here
  }

  /**
   * Get the appropriate icon based on update type
   */
  getUpdateIcon(updateType: string): string {
    const iconMap: { [key: string]: string } = {
      'created': 'add_circle',
      'updated': 'edit',
      'completed': 'check_circle',
      'assigned': 'person_add',
      'commented': 'comment'
    };
    return iconMap[updateType] || 'info';
  }

  /**
   * Get the appropriate color class based on update type
   */
  getUpdateColor(updateType: string): string {
    const colorMap: { [key: string]: string } = {
      'created': 'text-purple-500',
      'updated': 'text-blue-500',
      'completed': 'text-green-500',
      'assigned': 'text-orange-500',
      'commented': 'text-indigo-500'
    };
    return colorMap[updateType] || 'text-gray-500';
  }

  /**
   * Get icon color based on update type
   */
  getIconColor(updateType: string): string {
    const colorMap: { [key: string]: string } = {
      'created': '#9c27b0',
      'updated': '#2196f3',
      'completed': '#4caf50',
      'assigned': '#ff9800',
      'commented': '#3f51b5'
    };
    return colorMap[updateType] || '#9e9e9e';
  }

  /**
   * Get icon background color based on update type
   */
  getIconBackgroundColor(updateType: string): string {
    const colorMap: { [key: string]: string } = {
      'created': '#f3e5f5',
      'updated': '#e3f2fd',
      'completed': '#e8f5e9',
      'assigned': '#fff3e0',
      'commented': '#e8eaf6'
    };
    return colorMap[updateType] || '#f5f5f5';
  }

  /**
   * Handle click on an inbox item
   */
  onUpdateClick(update: InboxUpdate): void {
    // In a real app, this would navigate to the task detail page
    console.log('Clicked update:', update);
  }
}

