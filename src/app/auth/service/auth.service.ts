import { Injectable } from "@angular/core";
import { HttpService } from "src/app/shared/services/http.service";
import { ENDPOINTS } from "./api.collection";
import { UserSessionService } from "src/app/shared/services/user-session.service";
import { SessionService } from "src/app/shared/services/session.service";
import { StorageService } from "src/app/shared/services/storage.service";

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

  get isAuthenticated() {
    return this.userSessionService.userSession?.id > 0;
  }

  public Login(email: string, password: string, role: Number) {
    var param = {
      email: email,
      password: password,
      tempRole: role,
    };

    return this.httpService.post(ENDPOINTS.Login, param);
  }

  public logout() {
    this.storageService.clearStorage();
    this.sessionService.clearSession();
    this.userSessionService.rememberMe = false;
  }

  public forgotPassword(email: any) {
    var param = {
      email: email,
    };

    return this.httpService.post(ENDPOINTS.forgot_password, param);
  }
  public verifyToken(token: any) {
    let params = { token: token };
    return this.httpService.post(ENDPOINTS.API_ENDPOINT_VERIFY_TOKEN, params);
  }
  public resetPassword(newPassword: any, confirmPassword: any, userId: number) {
    let params = {
      password: newPassword,
      confirm_password: confirmPassword,
      id: userId,
    };
    return this.httpService.post(ENDPOINTS.API_ENDPOINT_RESET_PASSWORD, params);
  }

  public getUserPermissions(roleId:number)
  {
    return this.httpService.get(ENDPOINTS.get_permissions_by_role_id+'/'+roleId);
  }
}
