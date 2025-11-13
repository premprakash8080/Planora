import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { SidebarSection } from '../shared/ui/app-sidebar/app-sidebar.component';

interface ProjectNavItem {
  id: string;
  name: string;
}

@Component({
  selector: 'vex-custom-layout',
  templateUrl: './custom-layout.component.html',
  styleUrls: ['./custom-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomLayoutComponent implements OnDestroy {
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 1024px)')
    .pipe(
      map(result => result.matches),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  sidebarCollapsed = false;
  mobileSidebarOpen = false;
  private readonly destroy$ = new Subject<void>();

  private readonly projects: ProjectNavItem[] = [
    { id: '1', name: 'Website Redesign' },
    { id: '2', name: 'Mobile App Launch' },
    { id: '3', name: 'Growth Experiments' },
    { id: '4', name: 'Customer Success Ops' }
  ];

  sidebarSections: SidebarSection[] = this.buildSidebarSections();

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router: Router
  ) {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildSidebarSections(): SidebarSection[] {
    return [
      {
        id: 'main',
        title: 'Main',
        items: [
          { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
          { label: 'Inbox', icon: 'inbox', route: '/inbox' },
          { label: 'Members', icon: 'group', route: '/members' },
          { label: 'Mails', icon: 'mail', route: '/mails' }
        ]
      },
      {
        id: 'projects',
        title: 'Projects',
        collapsible: true,
        collapsed: false,
        items: this.projects.map(project => ({
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
