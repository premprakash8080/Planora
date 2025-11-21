import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DropdownPopoverItem } from '../dropdown-popover/dropdown-popover.component';
import { AuthenticationService } from 'src/app/auth/service/auth.service';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  @Input() appTitle = 'Planora';
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search tasks, projects, people...';
  @Input() notifications = 3;

  @Output() menuToggle = new EventEmitter<void>();
  @Output() searchChanged = new EventEmitter<string>();

  user: User | null = null;
  userInitials = 'JD';
  userRole = 'User';
  userAvatarUrl?: string;

  private destroy$ = new Subject<void>();

  notificationItems: DropdownPopoverItem[] = [
    {
      id: 'notif-1',
      label: 'New task assigned',
      description: 'You have been assigned to a new task',
      avatarColor: '#2563eb'
    },
    {
      id: 'notif-2',
      label: 'Project update',
      description: 'Website Redesign project has been updated',
      avatarColor: '#10b981'
    },
    {
      id: 'notif-3',
      label: 'Team member joined',
      description: 'Sarah Johnson joined your team',
      avatarColor: '#8b5cf6'
    }
  ];

  profileItems: DropdownPopoverItem[] = [
    {
      id: 'view-profile',
      label: 'View Profile',
      avatarText: 'VP',
      avatarColor: '#2563eb'
    },
    {
      id: 'settings',
      label: 'Settings',
      avatarText: 'ST',
      avatarColor: '#64748b'
    },
    {
      id: 'logout',
      label: 'Logout',
      avatarText: 'LO',
      avatarColor: '#ef4444'
    }
  ];

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private userSessionService: UserSessionService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load user data from session
   */
  private loadUserData(): void {
    this.user = this.authenticationService.currentUser || this.userSessionService.userSession as any;
    
    if (this.user) {
      this.userInitials = this.user.initials || this.getInitialsFromName(this.user.full_name);
      this.userAvatarUrl = this.user.avatar_url;
      // You can add role logic here if needed
      this.userRole = 'User';
    }
  }

  /**
   * Get initials from full name
   */
  private getInitialsFromName(fullName: string): string {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onSearchChange(value: string): void {
    this.searchChanged.emit(value);
  }

  onNotificationSelect(item: DropdownPopoverItem): void {
    // Handle notification click
    console.log('Notification selected:', item);
    // TODO: Navigate to notification detail or mark as read
  }

  onProfileSelect(item: DropdownPopoverItem): void {
    switch (item.id) {
      case 'view-profile':
        this.router.navigate(['/profile']);
        break;
      case 'settings':
        this.router.navigate(['/settings']);
        break;
      case 'logout':
        this.handleLogout();
        break;
    }
  }

  /**
   * Handle user logout
   */
  private handleLogout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/auth/login']);
  }
}
