import { NgxSpinnerService } from 'ngx-spinner';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, finalize, Observable, retry, throwError } from 'rxjs';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';
import { UserSessionService } from 'src/app/shared/services/user-session.service';


@Injectable()

export class HttpResponseInterceptor implements HttpInterceptor {

  constructor(
    private ngxService: NgxSpinnerService, 
    private snackBarService: SnackBarService,
    private userSessionService:UserSessionService
    ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    let requestWithToken;
    if(this.userSessionService.accessToken!=undefined && this.userSessionService.accessToken!="")
    {
      requestWithToken = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${this.userSessionService.accessToken}`),
      });
    }

    this.ngxService.show();
    return next.handle(requestWithToken || request).pipe(retry(1), catchError((error: HttpErrorResponse) => {
      let message = '';
      if (error?.error?.msg) {
        message = error.error.msg;
      }
      if(message==''){
        if (error.error instanceof ErrorEvent) {
          // handle client-side error
          message = `Error1: ${error.error.message}`;
        } else if (error.status === 0 || error.status === 400) {
          message = 'Something went wrong. Please try again later.';
        } else if (error.status === 403) {
          message = 'Forbidden Error! You do not have permission to view this resource.';
        } else if (error.status === 404) {
          message = 'Service not found';
        } else if (error.status === 503) {
          message = 'Service Unavailable! Sorry, we are under maintenance!';
        } else if (error.status === 500) {
          message = 'Something went wrong. Please try again later.';
        } else {
          // handle server-side error
          message = `${error.status}: Something went wrong. Please report this issue.`;
        }
      }     
      this.snackBarService.showError(message)
      return throwError(message);
    }),
      finalize(() => this.ngxService.hide()))
  }
}
