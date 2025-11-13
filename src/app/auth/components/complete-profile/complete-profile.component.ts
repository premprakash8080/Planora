import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'vex-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})
export class completeProfileComponent implements OnInit {
  visible: Boolean = false;
  hide = true;
  hideConfirmPassword= true;
  showDoneScreen: boolean = false
  showCompleteProfileScreen: boolean = true
  constructor() { }

  ngOnInit(): void {
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
}
