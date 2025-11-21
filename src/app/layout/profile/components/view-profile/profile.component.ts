import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from 'src/app/core/models/auth.models';
import { AuthenticationService } from 'src/app/auth/service/auth.service';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  loading = false;

  constructor(
    private authService: AuthenticationService,
    private userSessionService: UserSessionService,
    private snackBarService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Try to get user from session first (faster)
    const sessionUser = this.userSessionService.userSession;
    
    if (sessionUser) {
      // Use session user immediately, then refresh from API
      this.user$ = this.authService.getProfile().pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data.user;
          }
          return sessionUser; // Fallback to session user
        }),
        catchError((error) => {
          // If API fails, use session user
          this.snackBarService.showError('Failed to load profile. Using cached data.');
          return [sessionUser];
        })
      );
    } else {
      // No session user, fetch from API
      this.user$ = this.authService.getProfile().pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data.user;
          }
          return null;
        }),
        catchError((error) => {
          this.snackBarService.showError('Failed to load profile.');
          return [null];
        })
      );
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Get user initials from full name
   */
  getInitials(fullName: string): string {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onEdit(): void {
    this.router.navigate(['/profile/edit']);
  }
}
