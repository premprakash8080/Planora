import { Component, EventEmitter, OnInit, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Project } from '../../services/dashboard.service';

interface ProjectMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  role?: string;
}

@Component({
  selector: 'app-schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.scss']
})
export class ScheduleDetailComponent implements OnInit, OnChanges {
  @Input() project: Project | null = null;
  @Output() closeScheduleSidebarEvent = new EventEmitter<void>();

  projectMembers: ProjectMember[] = [];
  loading = false;
  error: string | null = null;

  constructor() { }

  ngOnInit(): void {
    if (this.project) {
      this.processProjectData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && this.project) {
      this.processProjectData();
    }
  }

  /**
   * Process project data to extract members and format for display
   */
  processProjectData(): void {
    if (!this.project) {
      return;
    }

    // Process members
    this.projectMembers = [];
    if (this.project.members && this.project.members.length > 0) {
      this.projectMembers = this.project.members.map(member => ({
        id: member.user_id.toString(),
        name: member.user.full_name,
        initials: member.user.initials || this.getInitials(member.user.full_name),
        color: member.user.avatar_color || this.generateColor(member.user.full_name),
        role: member.role
      }));
    }
  }

  /**
   * Get initials from full name
   */
  private getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Generate a color based on name
   */
  private generateColor(name: string): string {
    const colors = [
      '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Get status label
   */
  getStatusLabel(status?: string): string {
    if (!status) return 'Active';
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'on-hold': 'On Hold',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'on-track': 'On Track',
      'at-risk': 'At Risk',
      'off-track': 'Off Track'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  /**
   * Load project details (placeholder for future API call)
   */
  loadProjectDetails(): void {
    // This can be implemented to fetch fresh project data if needed
    this.error = null;
    if (this.project) {
      this.processProjectData();
    }
  }

  /**
   * Cancel and close sidebar
   */
  cancel(): void {
    this.closeScheduleSidebarEvent.emit();
  }

  /**
   * Track by function for members
   */
  trackByMemberId(index: number, member: ProjectMember): string {
    return member.id;
  }
}
