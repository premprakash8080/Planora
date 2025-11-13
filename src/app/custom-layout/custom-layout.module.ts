import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomLayoutComponent } from './custom-layout.component';
import { RouterModule } from '@angular/router';
import { SharedUiModule } from '../shared/ui/ui.module';


@NgModule({
  declarations: [CustomLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedUiModule
  ]
})
export class CustomLayoutModule {
}
