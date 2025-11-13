import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  appModeChange: Subject<any> = new Subject();
  updateSidebarMenu: Subject<any> = new Subject();

  constructor() { }

  /**
   * on change app mode observable
   */
  onAppModeChange() {
    this.appModeChange.next('');
  }

  /**
   * on change app mode and after set new menu to variable
   */
  onUpdateSidebarMenu() {
    this.updateSidebarMenu.next('');
  }
}
