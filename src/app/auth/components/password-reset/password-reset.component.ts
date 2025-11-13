import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'vex-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  showResetScreen: boolean = false
  showForgotPassScreen: boolean = true
  visible: Boolean = false;
  hide = true;
  hideConfirmPassword= true;
  loginForm: any;
  constructor(
    private formBuilder: FormBuilder,

  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      newPassword: ['', [Validators.required,]],
      confirmPassword: ['', Validators.required],
    });
  }
  showResetLink() {
    this.showResetScreen = true
    this.showForgotPassScreen = false
  }
}
