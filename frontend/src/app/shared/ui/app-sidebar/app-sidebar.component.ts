import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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
export class AppSidebarComponent {
  @Input() appName = 'Planora';
  @Input() logoUrl?: string;
  @Input() sections: SidebarSection[] = [];
  @Input() collapsed = false;

  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() navigate = new EventEmitter<SidebarNavItem>();

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

  trackBySection(index: number, section: SidebarSection): string {
    return section.id;
  }

  trackByItem(index: number, item: SidebarNavItem): string {
    return `${item.route || item.label}-${index}`;
  }
}

