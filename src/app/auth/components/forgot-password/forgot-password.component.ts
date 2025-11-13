import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../service/auth.service';

@Component({
  selector: 'vex-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  visible: Boolean = false;
  hide = true;
  forgotPassForm: FormGroup
  showResetScreen: boolean = false
  showForgotPassScreen: boolean = true
  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private snackBarService: SnackBarService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.forgotPassForm = this.fb.group({
      recovery_email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$')]],

    });
  }
  showResetLink() {
    this.showResetScreen = true
    this.showForgotPassScreen = false
  }
 


  public onSubmit() {
    this.forgotPassForm.markAllAsTouched();
    if (this.forgotPassForm.invalid) {
      return;
    }

    this.authenticationService.forgotPassword(this.forgotPassForm.value.recovery_email).subscribe(res => {
      if (res.success) {
        this.snackBarService.showSuccess(res.msg);
        //this.forgotPassForm.controls['recovery_email'].setValue('');
        this.router.navigate(['/auth/back-to-login']);
      }
    });
  }

  getErrorMessage() {
    if (this.forgotPassForm.controls['recovery_email'].hasError('required')) {
      return 'You must enter a value';
    }

    return this.forgotPassForm.controls['recovery_email'].hasError('email') ? 'Not a valid email' : '';
  }

}
