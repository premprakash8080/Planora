import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { HttpService } from "src/app/shared/services/http.service";
import { UserSessionService } from "src/app/shared/services/user-session.service";
import { SessionService } from "src/app/shared/services/session.service";
import { StorageService } from "src/app/shared/services/storage.service";
import { ENDPOINTS } from "./api.collection";
import { 
  UserProfileResponse,
  User,
} from "src/app/core/models/auth.models";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  constructor(
    private httpService: HttpService,
    private userSessionService: UserSessionService,
    private storageService: StorageService,
    private sessionService: SessionService
  ) {}

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    const user = this.userSessionService.userSession;
    const token = this.userSessionService.accessToken;
    return !!(user && user.id && token);
  }

  /**
   * Get current user from session
   */
  get currentUser(): User | null {
    return this.userSessionService.userSession;
  }



  /**
   * Get user profile
   * @returns Observable with user profile
   */
  getProfile(): Observable<User> {
    return this.httpService.get(ENDPOINTS.getProfile).pipe(
      map((response: User) => {
        return response;
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update user profile
   * @param profileData Profile data to update
   * @returns Observable with updated user profile
   */
  // updateProfile(profileData: Partial<User>): Observable<UserProfileResponse> {
  //   return this.httpService.put(ENDPOINTS.updateProfile, profileData).pipe(
  //     map((response: UserProfileResponse) => {
  //       if (response.success && response.data) {
  //         this.userSessionService.userSession = response.data.user;
  //       }
  //       return response;
  //     }),
  //     catchError((error) => {
  //       return throwError(() => this.handleError(error));
  //     })
  //   );
  // }

  /**
   * Logout user
   * Clears all session and storage data
   */
  // logout(): void {
  //   this.storageService.clearStorage();
  //   this.sessionService.clearSession();
  //   this.userSessionService.rememberMe = false;
  // }

  /**
   * Forgot password
   * @param email User email
   * @returns Observable
   */
  // forgotPassword(email: string): Observable<any> {
  //   return this.httpService.post(ENDPOINTS.forgot_password, { email });
  // }

  /**
   * Verify token
   * @param token Token to verify
   * @returns Observable
   */
  verifyToken(token: string): Observable<any> {
    return this.httpService.post(ENDPOINTS.verifyToken, { token });
  }

  /**
   * Reset password
   * @param newPassword New password
   * @param confirmPassword Confirm password
   * @param userId User ID
   * @returns Observable
   */
  // resetPassword(newPassword: string, confirmPassword: string, userId: number): Observable<any> {
  //   return this.httpService.post(ENDPOINTS.reset_password, {
  //     password: newPassword,
  //     confirm_password: confirmPassword,
  //     id: userId,
  //   });
  // }

  /**
   * Handle API errors
   * @param error Error object
   * @returns Error message
   */
  private handleError(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
