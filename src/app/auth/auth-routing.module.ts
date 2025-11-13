import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

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
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },

  {
    path: "password-rest",
    component: PasswordResetComponent,
  },
  {
    path: "registration",
    component: RegistrationComponent,
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
