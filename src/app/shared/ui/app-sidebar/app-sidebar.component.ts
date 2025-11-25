import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService, Theme } from '../../services/theme.service';

export interface SidebarNavItem {
  label: string;
  icon?: string;
  route?: string;
  badge?: string | number;
  exact?: boolean;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarNavItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSidebarComponent implements OnDestroy {
  @Input() appName = 'Planora';
  @Input() logoUrl?: string;
  @Input() sections: SidebarSection[] = [];
  @Input() collapsed = false;

  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() navigate = new EventEmitter<SidebarNavItem>();
  @Output() createProject = new EventEmitter<string>();

  currentTheme: Theme = 'light';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  toggleSection(section: SidebarSection): void {
    if (!section.collapsible) {
      return;
    }

    section.collapsed = !section.collapsed;
  }

  getCreateButtonLabel(sectionId: string): string {
    switch (sectionId) {
      case 'projects':
        return 'Create new project';
      case 'channels':
        return 'Create channel';
      case 'direct-messages':
        return 'Start direct message';
      default:
        return 'Create';
    }
  }

  trackBySection(index: number, section: SidebarSection): string {
    return section.id;
  }

  trackByItem(index: number, item: SidebarNavItem): string {
    return `${item.route || item.label}-${index}`;
  }

  toggleTheme(): void {
    // Add a subtle rotation animation to the theme toggle button
    const themeButton = document.querySelector('.app-sidebar__theme-button');
    if (themeButton) {
      themeButton.classList.add('theme-toggle-active');
      setTimeout(() => {
        themeButton.classList.remove('theme-toggle-active');
      }, 400);
    }
    this.themeService.toggleTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

