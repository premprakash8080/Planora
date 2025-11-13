import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileTooltipVisible: boolean = false;
  @ViewChild("menuTrigger") menuTrigger: MatMenuTrigger;
  showDoneScreen: boolean = false
  showCompleteProfileScreen: boolean = true
  @Output() closeSidebarEvent = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  closeSidebar() {
    this.closeSidebarEvent.emit();
    this.showDoneScreen = false
    this.showCompleteProfileScreen = true
  }
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    console.log(file);
    // Do something with the selected file, such as upload it to a server
  }
  showCompleteProfileLink() {
    this.showDoneScreen = true
    this.showCompleteProfileScreen = false
  }
 goBackToProfile() {
    this.showDoneScreen = false
    this.showCompleteProfileScreen = true
  }
}
