import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { DashboardService, DashboardStats, MonthlyStats } from '../../services/dashboard.service';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('snav') sidenav!: MatSidenav;
  
  showFiller = false;
  editing: boolean = false;
  message: string = '';
  editedMessage: string = '';
  selectedValue = 'FY 2022/2023';
  
  // Dashboard stats
  stats: DashboardStats = {
    upcoming: 0,
    overdue: 0,
    ongoing: 0,
    complete: 0
  };
  
  // Monthly stats
  monthlyStats: MonthlyStats = {
    newJobs: 0,
    housesOut: 0,
    completed: 0
  };
  
  loading = false;
  userName: string = '';
  dataLoaded = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private sidebarService: SidebarService,
    private dashboardService: DashboardService,
    private userSessionService: UserSessionService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isOpen$ = this.sidebarService.isOpen$;
  }

  isOpen$ = this.sidebarService.isOpen$;

  ngOnInit(): void {
    // Load data on initial load
    this.loadDashboardData();
    this.loadUserName();

    // Listen for route navigation events to reload data when navigating to dashboard
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap((event: NavigationEnd) => {
          // If navigating to dashboard and data hasn't loaded yet, reload
          if ((event.urlAfterRedirects === '/dashboard' || event.urlAfterRedirects.endsWith('/dashboard')) && !this.dataLoaded) {
            setTimeout(() => {
              this.loadDashboardData();
            }, 50);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  /**
   * Called when route is activated (for route reuse strategy)
   */
  ngAfterViewInit(): void {
    // Ensure change detection runs after view init
    // Also reload data if it hasn't been loaded yet
    if (!this.dataLoaded && !this.loading) {
      this.loadDashboardData();
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load dashboard data
   */
  loadDashboardData(): void {
    // Prevent double loading
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.dataLoaded = false;
    
    // Use forkJoin to load all data in parallel and ensure change detection runs once
    forkJoin({
      taskStats: this.dashboardService.getTaskDashboardStats(),
      monthlyStats: this.dashboardService.getMonthlyStats(this.selectedValue),
      noticeBoard: this.dashboardService.getNoticeBoard()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ taskStats, monthlyStats, noticeBoard }) => {
          this.ngZone.run(() => {
            // Create new object references to trigger change detection
            this.stats = { ...taskStats };
            this.monthlyStats = { ...monthlyStats };
            this.message = noticeBoard;
            this.loading = false;
            this.dataLoaded = true;
            this.cdr.detectChanges(); // Force change detection
          });
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.ngZone.run(() => {
            this.snackBarService.showError('Failed to load dashboard data');
            this.loading = false;
            this.dataLoaded = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  /**
   * Load user name for greeting
   */
  loadUserName(): void {
    const user = this.userSessionService.userSession;
    if (user && user.full_name) {
      const firstName = user.full_name.split(' ')[0];
      this.userName = firstName;
    } else {
      this.userName = 'User';
    }
  }

  /**
   * Edit notice board
   */
  editNotice(): void {
    this.editing = true;
    this.editedMessage = this.message;
  }

  /**
   * Clear notice board
   */
  clearNotice(): void {
    this.editedMessage = '';
    this.editing = false;
  }

  /**
   * Broadcast notice board
   */
  broadcastNotice(): void {
    if (!this.editedMessage.trim()) {
      this.snackBarService.showError('Please enter a message');
      return;
    }

    this.dashboardService.updateNoticeBoard(this.editedMessage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            if (response.success) {
              this.message = this.editedMessage;
              this.editing = false;
              this.snackBarService.showSuccess('Notice board updated successfully');
            } else {
              this.snackBarService.showError('Failed to update notice board');
            }
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error updating notice board:', error);
          this.ngZone.run(() => {
            this.snackBarService.showError('Failed to update notice board');
            this.cdr.markForCheck();
          });
        }
      });
  }

  /**
   * Handle fiscal year change
   */
  onFiscalYearChange(): void {
    this.dashboardService.getMonthlyStats(this.selectedValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.ngZone.run(() => {
            this.monthlyStats = { ...stats }; // Create new object reference
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error loading monthly stats:', error);
          this.ngZone.run(() => {
            this.snackBarService.showError('Failed to load monthly statistics');
            this.cdr.markForCheck();
          });
        }
      });
  }

  closeSidebar(): void {
    this.sidenav.close();
  }

  openSideBar(): void {
    this.sidenav.open();
  }

  /**
   * Get current date formatted
   */
  getCurrentDate(): string {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }
}
