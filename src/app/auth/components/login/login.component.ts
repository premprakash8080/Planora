import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthenticationService } from '../../service/auth.service';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';
import { UserCreds } from 'src/app/core/models/core.models';

@Component({
  selector: 'vex-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hide = true;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private userSessionService: UserSessionService,
    private snackBarService: SnackBarService,
  ) {}

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authenticationService.isAuthenticated) {
      this.router.navigate(['/']);
      return;
    }

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Check if remember me is enabled and restore credentials
    this.checkIsRemember();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Stop here if form is invalid
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const email = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    this.authenticationService.login(email, password)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Store credentials if remember me is enabled
            if (this.userSessionService.rememberMe) {
              const creds: UserCreds = {
                username: email,
                password: password,
              };
              this.userSessionService.userCredentials = creds;
            }

            this.snackBarService.showSuccess(response.message || 'Login successful');
            this.router.navigate(['/']);
          } else {
            this.error = response.message || 'Login failed';
            this.snackBarService.showError(this.error);
          }
        },
        error: (error) => {
          this.error = error || 'Invalid email or password';
          this.snackBarService.showError(this.error);
        }
      });
  }

  /**
   * Get error message for form field
   */
  getErrorMessage(): string {
    const control = this.loginForm.controls['username'];
    if (control.hasError('required')) {
      return 'You must enter a value';
    }
    if (control.hasError('email')) {
      return 'Not a valid email';
    }
    return '';
  }

  /**
   * Handle remember me checkbox change
   */
  setIsRemember(event: any): void {
    const target = event.target as HTMLInputElement;
    this.userSessionService.rememberMe = target.checked;
  }

  /**
   * Check if remember me is enabled and restore credentials
   */
  private checkIsRemember(): void {
    if (this.userSessionService.rememberMe) {
      const creds = this.userSessionService.userCredentials;
      if (creds) {
        this.loginForm.patchValue({
          username: creds.username,
          password: creds.password,
        });
      }
    }
  }
}
