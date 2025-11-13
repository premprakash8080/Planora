import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isOpenSubject = new Subject<boolean>();
  private isOpenSubjectForNotification = new Subject<boolean>();
  isOpen$ = this.isOpenSubject.asObservable();
  isOpenNotificationBar$ = this.isOpenSubjectForNotification.asObservable();

  openSidebar() {
    this.isOpenSubject.next(true);
    console.log('open');
  }

  closeSidebar() {
    this.isOpenSubject.next(false);
    console.log('closed');
  }
  notificationSidebarOpen() {
    this.isOpenSubjectForNotification.next(true);
    console.log('open');
  }

  notificationSidebarClose() {
    this.isOpenSubjectForNotification.next(false);
    console.log('closed');
  }
}
