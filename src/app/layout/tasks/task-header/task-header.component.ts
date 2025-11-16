import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { DropdownPopoverItem } from '../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { DropdownPopoverItem } from '../../../shared/ui/dropdown-popover/dropdown-popover.component';

interface NavTab {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-task-header',
  templateUrl: './task-header.component.html',
  styleUrls: ['./task-header.component.scss']
})
export class TaskHeaderComponent {
  @Input() projectTitle = 'Cross-functional project plan';
  @Input() isFavorite = false;
  @Input() selectedStatus = 'in-progress';
  @Input() activeTab = 'list';

  @Output() titleChange = new EventEmitter<string>();
  @Output() favoriteChange = new EventEmitter<boolean>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() share = new EventEmitter<void>();
  @Output() customize = new EventEmitter<void>();

  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

  private originalTitle = '';

  // Status Options
  statusItems: DropdownPopoverItem[] = [
    { id: 'not-started', label: 'Not Started', color: '#94a3b8' },
    { id: 'in-progress', label: 'In Progress', color: '#0ea5e9' },
    { id: 'on-hold', label: 'On Hold', color: '#f97316' },
    { id: 'completed', label: 'Completed', color: '#22c55e' }
  ];

  // Navigation Tabs
  tabs: NavTab[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'list', label: 'List', icon: 'list' },
    { id: 'board', label: 'Board', icon: 'view_kanban' },
    { id: 'timeline', label: 'Timeline', icon: 'timeline' },
    { id: 'dashboard', label: 'Dashboard', icon: 'bar_chart' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_today' },
    { id: 'workflow', label: 'Workflow', icon: 'linear_scale' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
    { id: 'files', label: 'Files', icon: 'folder_open' }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  // Computed
  get projectInitials(): string {
    return this.projectTitle
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  get projectColor(): string {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444'];
    return colors[this.projectTitle.length % colors.length];
  }

  get statusLabel(): string {
    return this.statusItems.find(s => s.id === this.selectedStatus)?.label || 'Set status';
  }

  get statusColor(): string {
    return this.statusItems.find(s => s.id === this.selectedStatus)?.color || '#94a3b8';
  }

  // Actions
  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    this.favoriteChange.emit(this.isFavorite);
  }

  onStatusChange(statusId: string) {
    this.statusChange.emit(statusId);
  }

  onTabChange(tabId: string) {
    this.tabChange.emit(tabId);
    const segment = this.getRouteForTab(tabId);
    if (segment) {
      // Navigate relative to the tasks module route
      const baseRoute = this.route.parent ?? this.route;
      this.router.navigate([segment], { relativeTo: baseRoute });
    }
  }

  onShare() {
    this.share.emit();
  }

  onCustomize() {
    this.customize.emit();
  }

  // Title Editing
  onTitleBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && value !== this.projectTitle) {
      this.titleChange.emit(value);
    } else if (!value) {
      input.value = this.projectTitle;
    }
  }

  cancelTitleEdit() {
    this.titleInput.nativeElement.value = this.projectTitle;
    this.titleInput.nativeElement.blur();
  }

  private getRouteForTab(tabId: string): string | null {
    switch (tabId) {
      case 'list':
        return 'list';
      case 'board':
        return 'board';
      case 'timeline':
        return 'timeline';
      case 'dashboard':
        return 'dashboard';
      case 'calendar':
        return 'calendar';
      case 'overview':
        return 'overview';
      case 'workflow':
      case 'messages':
      case 'files':
      default:
        return null;
    }
  }
}