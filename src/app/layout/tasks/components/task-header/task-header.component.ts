import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DropdownPopoverItem } from '../../../../shared/ui/dropdown-popover/dropdown-popover.component';
import { Project, ProjectMember } from '../../services/project.service';
import { ProjectMembersModalComponent } from '../project-members-modal/project-members-modal.component';

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
export class TaskHeaderComponent implements OnInit, OnDestroy {
  @Input() projectTitle = 'Cross-functional project plan';
  @Input() isFavorite = false;
  @Input() selectedStatus = 'in-progress';
  @Input() project?: Project;
  
  activeTab = 'list';
  private routeSubscription?: Subscription;

  @Output() titleChange = new EventEmitter<string>();
  @Output() favoriteChange = new EventEmitter<boolean>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() share = new EventEmitter<void>();
  @Output() customize = new EventEmitter<void>();
  @Output() membersChange = new EventEmitter<ProjectMember[]>();

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Set initial active tab from current route
    this.updateActiveTabFromRoute();
    
    // Subscribe to route changes to update active tab
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveTabFromRoute();
      });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private updateActiveTabFromRoute(): void {
    // Get the current route snapshot
    let route = this.route;
    while (route.firstChild) {
      route = route.firstChild;
    }
    
    const routePath = route.snapshot.routeConfig?.path || '';
    
    // Handle parameterized routes (e.g., 'list/:taskId' -> 'list')
    let routeSegment = routePath.split('/')[0];
    
    // If routeSegment is empty or is a parameter (starts with ':'), check the URL
    if (!routeSegment || routeSegment.startsWith(':')) {
      const url = this.router.url;
      const segments = url.split('/').filter(segment => segment.length > 0 && !segment.match(/^\d+$/));
      // Find the last segment that matches a tab ID
      for (let i = segments.length - 1; i >= 0; i--) {
        const segment = segments[i];
        if (this.tabs.find(tab => tab.id === segment)) {
          routeSegment = segment;
          break;
        }
      }
    }
    
    // Check if the segment matches any tab ID
    const matchingTab = this.tabs.find(tab => tab.id === routeSegment);
    
    if (matchingTab) {
      this.activeTab = matchingTab.id;
    } else {
      // Default to 'list' if no match found or if we're at the root
      this.activeTab = 'list';
    }
  }

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
    // Update active tab immediately for responsive UI
    this.activeTab = tabId;
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
        return 'workflow';
      case 'messages':
        return 'messages';
      case 'files':
        return 'files';
      default:
        return null;
    }
  }

  // Project Members
  get projectMembers(): ProjectMember[] {
    return this.project?.members || [];
  }

  get displayedMembers(): ProjectMember[] {
    // Show max 5 avatars, rest will be shown as "+X"
    return this.projectMembers.slice(0, 5);
  }

  get remainingMembersCount(): number {
    return Math.max(0, this.projectMembers.length - 5);
  }

  getInitials(member: ProjectMember): string {
    return member.user.initials || this.generateInitials(member.user.full_name);
  }

  private generateInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  openMembersModal(): void {
    if (!this.project) return;

    const dialogRef = this.dialog.open(ProjectMembersModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { project: { ...this.project } }, // Pass a copy to avoid direct mutation
      panelClass: 'project-members-dialog'
    });

    dialogRef.afterClosed().subscribe((updatedMembers?: ProjectMember[]) => {
      if (updatedMembers !== undefined && this.project) {
        // Update the project members
        this.project.members = updatedMembers;
        // Emit event to parent to reload project data
        this.membersChange.emit(updatedMembers);
      }
    });
  }
}