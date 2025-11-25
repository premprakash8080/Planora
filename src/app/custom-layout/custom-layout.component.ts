import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { SidebarSection, SidebarNavItem } from '../shared/ui/app-sidebar/app-sidebar.component';
import { ProjectService, Project } from '../layout/tasks/services/project.service';
import { ProjectDialogComponent } from './components/project-dialog/project-dialog.component';
import { ThemeService } from '../shared/services/theme.service';
import { fadeIn, slideInUp } from '../shared/animations/app.animations';

interface ProjectNavItem {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'vex-custom-layout',
  templateUrl: './custom-layout.component.html',
  styleUrls: ['./custom-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, slideInUp]
})
export class CustomLayoutComponent implements OnInit, OnDestroy {
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 1024px)')
    .pipe(
      map(result => result.matches),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  sidebarCollapsed = false;
  mobileSidebarOpen = false;
  private readonly destroy$ = new Subject<void>();
  private readonly projects$ = new BehaviorSubject<Project[]>([]);
  
  sidebarSections$: Observable<SidebarSection[]> = this.projects$.pipe(
    map((projects) => this.buildSidebarSections(projects)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router: Router,
    private readonly projectService: ProjectService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService
  ) {
    this.loadProjects();
    
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.breakpointObserver.isMatched('(max-width: 1024px)')) {
          this.mobileSidebarOpen = false;
        }
      });
  }

  ngOnInit(): void {
    // Initialize theme service - this will apply the saved theme or system preference
    // The service is already initialized in its constructor, but we ensure it's ready
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  handleMenuToggle(): void {
    if (this.breakpointObserver.isMatched('(max-width: 1024px)')) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  handleSidebarCollapseChange(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  handleSidebarNavigate(_item: SidebarNavItem): void {
    if (this.breakpointObserver.isMatched('(max-width: 1024px)')) {
      this.mobileSidebarOpen = false;
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load projects from API
   */
  private loadProjects(): void {
    this.projectService.getProjects(false).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (projects) => {
        this.projects$.next(projects);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
      }
    });
  }

  /**
   * Open dialog to create new project
   */
  openCreateProjectDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProjects(); // Reload projects after creation
      }
    });
  }

  private buildSidebarSections(projects: Project[]): SidebarSection[] {
    return [
      {
        id: 'main',
        title: 'Main',
        items: [
          { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
          { label: 'Inbox', icon: 'inbox', route: '/inbox' },
          { label: 'Members', icon: 'group', route: '/members' },
          { label: 'Mails', icon: 'mail', route: '/mails' },
          { label: 'My Tasks', icon: 'task', route: '/my-tasks' },
          { label: 'Chat', icon: 'chat', route: '/chat' },
        ]
      },
      {
        id: 'projects',
        title: 'Projects',
        collapsible: true,
        collapsed: false,
        items: projects
          .filter(project => !project.is_archived)
          .map(project => ({
            label: project.name,
            route: `/projects/${project.id}/tasks`,
            exact: false
          }))
      },
      {
        id: 'insights',
        title: 'Insights',
        collapsible: true,
        collapsed: false,
        items: [
          { label: 'Reporting', icon: 'assessment', route: '/insights/report' },
          { label: 'Productivity Overview', icon: 'show_chart', route: '/insights/productivity-overview' },
          { label: 'Team Performance', icon: 'groups', route: '/insights/team-performance' },
          { label: 'Time Tracking', icon: 'schedule', route: '/insights/time-tracking' }
        ]
      }
    ];
  }
}
