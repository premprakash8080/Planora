import { Component, OnInit, OnDestroy, Input, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { LayoutService } from 'src/@vex/services/layout.service';
import { SidebarService } from '../../services/sidebar.service';
import { DashboardService, Project } from '../../services/dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-schedule',
  templateUrl: './dashboard-schedule.component.html',
  styleUrls: ['./dashboard-schedule.component.scss']
})
export class DashboardScheduleComponent implements OnInit, OnDestroy {
  leftSideNav!: MatSidenav;
  isSidenavOpen = false;
  @Input() showIcon: boolean = false;
  mobileQueryForSideNav?: MediaQueryList;
  events: string[] = [];
  opened: boolean | undefined;
  events1: string[] = [];
  opened1: boolean | undefined;
  test: boolean = false;
  isSidebarOpened: boolean = false;
  @ViewChild('snavForSchedule') sidenav!: MatSidenav;
  @Input() closeSidebarEvent: any;
  isDrawerOpen = false;

  projects: Project[] = [];
  loading = false;
  error: string | null = null;
  selectedProject: Project | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private layoutService: LayoutService,
    private sidebarService: SidebarService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}


  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.mobileQueryForSideNav && this._mobileQueryListener) {
      if ('removeEventListener' in this.mobileQueryForSideNav) {
        this.mobileQueryForSideNav.removeEventListener('change', this._mobileQueryListener);
      } else {
        const legacyQuery = this.mobileQueryForSideNav as MediaQueryList & {
          removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
        };
        legacyQuery.removeListener?.(this._mobileQueryListener as (event: MediaQueryListEvent) => void);
      }
    }
  }

  isOpen$ = this.sidebarService.isOpen$;
  isOpenNotificationBar$ = this.sidebarService.isOpenNotificationBar$;

  /**
   * Load projects from API
   */
  loadProjects(): void {
    this.loading = true;
    this.error = null;
    this.dashboardService.getProjects(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.ngZone.run(() => {
            this.projects = [...projects]; // Create new array reference
            this.loading = false;
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          this.ngZone.run(() => {
            this.error = 'Failed to load projects. Please try again.';
            this.loading = false;
            this.cdr.markForCheck();
          });
        }
      });
  }

  /**
   * Get project color or default
   */
  getProjectColor(project: Project): string {
    return project.color || '#2563eb';
  }

  /**
   * Get project status display
   */
  getProjectStatus(project: Project): string {
    if (project.is_archived) {
      return 'Archived';
    }
    return project.status || 'Not Started';
  }

  /**
   * Get project status color
   */
  getProjectStatusColor(project: Project): string {
    if (project.is_archived) {
      return '#6b7280';
    }
    const status = project.status?.toLowerCase() || 'not-started';
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'on-hold':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }

  /**
   * Get member count
   */
  getMemberCount(project: Project): number {
    return project.members?.length || 0;
  }

  /**
   * Track by function for project list
   */
  trackByProjectId(index: number, project: Project): number {
    return project.id;
  }

  closeSidebar() {
    this.sidenav.close();
    this.selectedProject = null;
  }
  
  openSideBar(project?: Project) {
    if (project) {
      this.selectedProject = project;
    }
    this.sidenav.open();
  }

  openQuickpanel(): void {
    this.layoutService.openDashboardSchedulePanel();
  }
  private _mobileQueryListener?: () => void;

  openCloseSideBar() {
    this.showIcon = !this.showIcon;
    this.leftSideNav.toggle();
  }
  openCloseSideBarIcon() {
    this.showIcon = false;
  }
}
