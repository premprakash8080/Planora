import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GuestGuard } from "src/app/core/guards/guest.guard";

import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";
import { PasswordResetComponent } from "./components/password-reset/password-reset.component";
import { RegistrationComponent } from "./components/registration/registration.component";

import { LoginComponent } from "./components/login/login.component";
import { completeProfileComponent } from "./components/complete-profile/complete-profile.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [GuestGuard], // Prevent logged-in users from accessing login
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "password-rest",
    component: PasswordResetComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "registration",
    component: RegistrationComponent,
    canActivate: [GuestGuard], // Prevent logged-in users from accessing registration
  },
  {
    path: "complete-profile",
    component: completeProfileComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
