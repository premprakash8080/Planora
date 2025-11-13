import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'vex-back-to-login',
  templateUrl: './back-to-login.component.html',
  styleUrls: ['./back-to-login.component.scss']
})
export class BackToLoginComponent implements OnInit {
  visible: Boolean = false;
  hide = true;
  hideConfirmPassword= true;
  constructor() { }

  ngOnInit(): void {
  }

}
