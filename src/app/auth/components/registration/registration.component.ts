import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";
import { AuthenticationService } from "../../service/auth.service";
import { SnackBarService } from "src/app/shared/services/snackbar.service";

@Component({
  selector: "vex-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.scss"],
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  loading = false;
  hide = true;
  hideConfirmPassword = true;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackBarService: SnackBarService,
  ) {}

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authenticationService.isAuthenticated) {
      this.router.navigate(['/']);
      return;
    }

    this.registrationForm = this.formBuilder.group({
      full_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Stop here if form is invalid
    this.registrationForm.markAllAsTouched();
    if (this.registrationForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { full_name, email, password } = this.registrationForm.value;

    this.authenticationService.register(full_name, email, password)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBarService.showSuccess(response.message || 'Registration successful');
            this.router.navigate(['/']);
          } else {
            this.error = response.message || 'Registration failed';
            this.snackBarService.showError(this.error);
          }
        },
        error: (error) => {
          this.error = error || 'Registration failed. Please try again.';
          this.snackBarService.showError(this.error);
        }
      });
  }

  /**
   * Get error message for form field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.registrationForm.controls[fieldName];
    
    if (control.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    
    if (control.hasError('email')) {
      return 'Not a valid email';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    
    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `Must be no more than ${maxLength} characters`;
    }
    
    return '';
  }

  /**
   * Get field label for error messages
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      full_name: 'Full name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Check if passwords match
   */
  get passwordMismatch(): boolean {
    return this.registrationForm.hasError('passwordMismatch') && 
           this.registrationForm.get('confirmPassword')?.touched;
  }
}
