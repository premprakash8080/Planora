import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";

import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from "./components/login/login.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";


import { MatGridListModule } from "@angular/material/grid-list";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { VexModule } from "../../@vex/vex.module";

import { CustomLayoutModule } from "../custom-layout/custom-layout.module";
import { SidenavModule } from "../../@vex/layout/sidenav/sidenav.module";

import { BackToLoginComponent } from "./components/back-to-login/back-to-login.component";

import { MatInputModule } from "@angular/material/input";
import { PasswordResetComponent } from "./components/password-reset/password-reset.component";
import { SharedModule } from "../shared/shared/shared.module";
import { completeProfileComponent } from "./components/complete-profile/complete-profile.component";


@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    BackToLoginComponent,
    PasswordResetComponent,
    completeProfileComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatGridListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    SidenavModule,
    SharedModule,
    // Vex
    VexModule,
    CustomLayoutModule,
  ],
})
export class AuthModule { }
