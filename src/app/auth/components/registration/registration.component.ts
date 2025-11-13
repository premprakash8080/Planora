import { Component, OnInit } from "@angular/core";

@Component({
  selector: "vex-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.scss"],
})
export class RegistrationComponent implements OnInit {
  step = 0;
  constructor() {}
  visible: Boolean = false;
  hide = true;
  hideConfirmPassword= true;
  ngOnInit() {}

  stepUpdate(event) {
    this.step = event;
  }
}
