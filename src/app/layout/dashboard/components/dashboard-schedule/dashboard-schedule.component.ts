import { Component, OnInit, Input, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { LayoutService } from 'src/@vex/services/layout.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-dashboard-schedule',
  templateUrl: './dashboard-schedule.component.html',
  styleUrls: ['./dashboard-schedule.component.scss']
})
export class DashboardScheduleComponent implements OnInit {
  leftSideNav!: MatSidenav;
  // leftSideNav!: boolean = false;
  isSidenavOpen = false;
  @Input()
  showIcon: boolean = false;
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

  constructor(private renderer: Renderer2, private layoutService: LayoutService, private sidebarService: SidebarService) { }


  ngOnInit(): void {
    console.log(this.closeSidebarEvent);

  }
  isOpen$ = this.sidebarService.isOpen$;
  isOpenNotificationBar$ = this.sidebarService.isOpenNotificationBar$;

  closeSidebar() {
    this.sidenav.close();
  }
  openSideBar() {
    this.sidenav.open()
  }

  openQuickpanel(): void {
    this.layoutService.openDashboardSchedulePanel();
  }
  private _mobileQueryListener?: () => void;

  ngOnDestroy(): void {
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

  openCloseSideBar() {
    this.showIcon = !this.showIcon;
    this.leftSideNav.toggle();
  }
  openCloseSideBarIcon() {
    this.showIcon = false;
  }
  data = [
    {
      name: 'Marketing Website',
      team: 'Design & Frontend',
      asset: 'Truck Asset',
      color: 'bg-green-500',
      image: 'assets/img/icon_truck.svg'
    },
    {
      name: 'Mobile App Revamp',
      team: 'iOS Team',
      asset: 'Build Assets',
      color: 'bg-blue-500',
      image: 'assets/img/icon_truck.svg'
    },
    {
      name: 'Marketing Website',
      team: 'Design & Frontend',
      asset: 'Truck Asset',
      color: 'bg-green-500',
      image: 'assets/img/icon_truck.svg'
    },
    {
      name: 'Mobile App Revamp',
      team: 'iOS Team',
      asset: 'Build Assets',
      color: 'bg-blue-500',
      image: 'assets/img/icon_truck.svg'
    },
    {
      name: 'Marketing Website',
      team: 'Design & Frontend',
      asset: 'Truck Asset',
      color: 'bg-green-500',
      image: 'assets/img/icon_truck.svg'
    },
    {
      name: 'Mobile App Revamp',
      team: 'iOS Team',
      asset: 'Build Assets',
      color: 'bg-blue-500',
      image: 'assets/img/icon_truck.svg'
    },
    {
      name: 'Marketing Website',
      team: 'Design & Frontend',
      asset: 'Truck Asset',
      color: 'bg-green-500',
      image: 'assets/img/icon_truck.svg'
    },
    {
      name: 'Mobile App Revamp',
      team: 'iOS Team',
      asset: 'Build Assets',
      color: 'bg-blue-500',
      image: 'assets/img/icon_truck.svg'
    }
  ]

}
