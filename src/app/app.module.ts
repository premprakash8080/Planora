import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VexModule } from 'src/@vex/vex.module';
import { CustomLayoutModule } from './custom-layout/custom-layout.module';
import { SharedModule } from './shared/shared/shared.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpResponseInterceptor } from './core/interceptors/http.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    MatSnackBarModule,
      // Vex
      VexModule,
      CustomLayoutModule,
      SharedModule,
  ],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpResponseInterceptor,
    multi: true,
  },],
  bootstrap: [AppComponent]
})
export class AppModule { }
