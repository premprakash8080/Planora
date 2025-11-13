import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';
import { UserCreds } from 'src/app/core/models/core.models';
import { CreationPermissions, DeliveryPermissions } from 'src/@vex/enums/Enumeration';
import { AuthenticationService } from '../../service/auth.service';

@Component({
  selector: 'vex-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  returnUrl: string;
  error = '';
  loading = false;
  companyAccounts: Array<any> = [];
  visible: Boolean = false;
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private titleService: Title,
    private authenticationService: AuthenticationService,
    private userSessionService: UserSessionService,
    private snackBarService: SnackBarService,
  ) {
    //this.titleService.setTitle("Login");
    // this.getAllCompanyAccounts();
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.checkIsRemember();
  }
  /**
   * On submit form
   */
  onSubmit() {

    // stop here if form is invalid
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }

    this.snackBarService.showSuccess('Login Successful');
    this.userSessionService.accessToken = "1231SAASDSADSA123SDDSAASD213S";
    this.userSessionService.userSession =  {
      id:1,
      first_name:"string",
      last_name:"string",
      phone_number:"string",
      email: "string",
      address: "string",  
      role:1,
      status:1,
      createdAt:new Date(),
      updatedAt:new Date(),
      abn:"any",
      designation:"any",
  };
    this.router.navigate(['/']);
    return
    this.authenticationService.Login(this.loginForm.value.username, this.loginForm.value.password, 1).subscribe(res => {
      if (res.status) {
        const creds: UserCreds = {
          username: this.loginForm.value.username,
          password: this.loginForm.value.password,
        }
        this.userSessionService.accessToken = res.token;
        this.userSessionService.userSession = res.user;
        this.authenticationService.getUserPermissions(res.user.role).subscribe(res => {
          let permissions: number[] = [];

          res.permissions.forEach((p: any) => {
            permissions.push(p.permission_id);
          });

          this.userSessionService.userPermissions = permissions;

          this.snackBarService.showSuccess('Login Successful');
          if (this.userSessionService.rememberMe === true) this.userSessionService.userCredentials = creds

          this.userSessionService.userPermissions = this.userSessionService.userPermissions.sort((a, b) => a - b);

          if (this.userSessionService.userPermissions.length == 0) {
            this.router.navigate(['/']);
            return
          }

          if (this.HasDashboardCreationPermissions() || this.HasDeliveryPermissionsPermissions()) {
            this.router.navigate(['/']);
            return;
          }

          switch(this.userSessionService.userPermissions[0])
          {
             case 2://CourseSetup
             this.router.navigate(['/course-setup']);
              break;
              case 3://ManageCourses
             this.router.navigate(['/manage-courses']);
              break;
              case 4://Courses
             this.router.navigate(['/courses']);
              break;
              case 5://RoleManagement
             this.router.navigate(['/role']);
              break;
              case 6://NewsFeed
             this.router.navigate(['/news']);
              break;
              case 7://TechSupport
             this.router.navigate(['/tech-support']);
              break;

              case 9://DeliverySetup
             this.router.navigate(['/delivery-setup']);
              break;
              case 10://ManageTrainerAssessor
             this.router.navigate(['/manage-tariner']);
              break;
              case 11://ManageStudents
             this.router.navigate(['/manage-students']);
              break;
              case 12://Classes
             this.router.navigate(['/classes']);
              break;
              case 13://MarkingAndFeedback
             this.router.navigate(['/marking-feedback']);
              break;
              case 14://StudentChat
              this.router.navigate(['/chat']);
               break;
          }
        });

      } else {
        this.snackBarService.showError('Invalid password! Please try again.');
      }

    });

  }

  private HasDashboardCreationPermissions() {
    return this.userSessionService.userPermissions.filter(a => a == CreationPermissions.DashboardCreation).length > 0
  }

  private HasDeliveryPermissionsPermissions() {
    return this.userSessionService.userPermissions.filter(a => a == DeliveryPermissions.DashboardDelivery).length > 0
  }

  getErrorMessage() {
    if (this.loginForm.controls['username'].hasError('required')) {
      return 'You must enter a value';
    }

    return this.loginForm.controls['username'].hasError('email') ? 'Not a valid email' : '';
  }

  setIsRemember(event: any) {
    const target = event.target as HTMLInputElement;
    this.userSessionService.rememberMe = target.checked;
  }

  private checkIsRemember() {
    if (this.userSessionService.rememberMe) {
      this.patchValue(this.loginForm, this.userSessionService.userCredentials);

    }
  }

  private patchValue(form: FormGroup, data: UserCreds) {
    form.patchValue(data);
  }
}
