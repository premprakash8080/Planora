import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/auth/service/auth.service';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  previewAvatar: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private userSessionService: UserSessionService,
    private snack: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.userSessionService.userSession;

    this.form = this.fb.group({
      full_name: [user?.full_name, Validators.required],
      email: [{ value: user?.email, disabled: true }],
      avatar_url: [user?.avatar_url || null],
      avatar_color: [user?.avatar_color],
      status: [user?.status || 'active'],
    });
  }

  /** Handle avatar upload */
  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => (this.previewAvatar = reader.result as string);
    reader.readAsDataURL(file);
  }

  /** Save profile */
  onSave(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const payload = {
      ...this.form.getRawValue(),
      avatar_url: this.previewAvatar || this.form.value.avatar_url,
    };

    this.authService.updateProfile(payload).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.snack.showSuccess('Profile updated successfully');
          this.userSessionService.userSession = response.data.user;
          this.router.navigate(['/profile']);
        } else {
          this.snack.showError('Update failed');
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error?.error?.message || error?.message || 'Something went wrong';
        this.snack.showError(errorMessage);
      },
    });
  }

  onCancel() {
    this.router.navigate(['/profile']);
  }

  getInitials(fullName: string): string {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
