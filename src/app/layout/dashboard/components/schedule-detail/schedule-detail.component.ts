import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.scss']
})
export class ScheduleDetailComponent implements OnInit {
  @Output() closeScheduleSidebarEvent = new EventEmitter<void>();

  cancel() {
    this.closeScheduleSidebarEvent.emit()
  }
  scheduleData = [
    {
      name: "Street Address",
      address: "35 Kelburn Street",
      qty: 1
    },
    {
      name: "Post Code",
      address: "4122",
      qty: 2
    },
    {
      name: "Suburb",
      address: "Upper Mount Gravatt",
      qty: 1
    },
    {
      name: "State",
      address: "QLD",
      qty: 3
    },
    {
      name: "High-end Job",
      address: "Yes",
      qty: 1
    },
  ]
  scheduleDataAssigned = [
    {
      name: "Street Address",
      address: "35 Kelburn Street",
      icon: "arrow_drop_down",
      images: [
        "../../../assets/img/media-1.jpg",
      ]
    },
    {
      icon: "add_circle",
      name: "Post Code",
      address: "4122",
      images: [
        "../../../assets/img/media-1.jpg",
        "../../../assets/img/media-2.jpg",
      ]
    },
    {
      icon: "arrow_drop_down",
      name: "Suburb",
      address: "Upper Mount Gravatt",
      images: [
        "../../../assets/img/media-1.jpg",
        "../../../assets/img/media-2.jpg",
        "../../../assets/img/media-3.jpg",
      ]
    },
    {
      icon: "arrow_drop_down",
      name: "State",
      address: "QLD",
      images: [
        "../../../assets/img/media-1.jpg",
        "../../../assets/img/media-2.jpg",
      ]
    },
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
