import { Component, Input } from '@angular/core';

// ──────────────────────────────────────────────────────────────
// Types (unchanged – kept for clarity)
interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
  role?: string;
}

interface Activity {
  id: string;
  type: 'status' | 'join' | 'create' | 'due';
  icon: string;
  message: string;
  userInitials?: string;
  userColor?: string;
  time: string;
}

// ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent {
  @Input() description = '';
  @Input() members: Member[] = [];
  @Input() status: 'on-track' | 'at-risk' | 'off-track' = 'on-track';
  @Input() dueDate: string | null = null;
  @Input() activities: Activity[] = [];

  /** Human‑readable label for the current status */
  getStatusLabel(): string {
    switch (this.status) {
      case 'on-track':  return 'On track';
      case 'at-risk':   return 'At risk';
      case 'off-track': return 'Off track';
      default:          return 'On track';
    }
  }

  /** Token‑based colour for the current status */
  getStatusColor(): string {
    switch (this.status) {
      case 'on-track':  return '#10b981'; // accent
      case 'at-risk':   return '#f59e0b'; // warning
      case 'off-track': return '#ef4444'; // danger
      default:          return '#10b981';
    }
  }
}