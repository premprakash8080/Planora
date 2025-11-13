import { Component, OnInit, Output, EventEmitter,ViewChild } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  showFiller = false;
  editing: boolean = false;
  message: string = "Hi Team!\n\nWe will be having our end of month meeting this Friday 5:30pm. Please make sure you’re back on site before that time. Cheers!\n\nPS: There will be Pizza!;";
  editedMessage: string = "";
  selectedValue = 'FY 2022/2023'; // Set the initial selected value
  @ViewChild('snav') sidenav!: MatSidenav;

  editNotice() {
    this.editing = true;
    this.editedMessage = this.message;
  }

  clearNotice() {
    this.editedMessage = "";
    this.editing = false;
  }

  broadcastNotice() {
    this.message = this.editedMessage;
    this.editing = false;
  }
  constructor(private sidebarService: SidebarService) { }
  isOpen$ = this.sidebarService.isOpen$;

  closeSidebar() {
    this.sidenav.close();
  }
  openSideBar() {
    this.sidenav.open()
  }
  
  ngOnInit(): void {
  }

  data = [
  {
    name: 'Guerrero Morales',
    team: 'Supportal',
    phone: '+21 (988) 504-2559',
    color: 'bg-blue-100',
    image: 'assets/img/john-canady.jpg'
  },
  {
    name: 'Ava Thompson',
    team: 'Design Team',
    phone: '+44 (752) 103-9821',
    color: 'bg-pink-100',
    image: 'assets/img/john-canady.jpg'
  },
  {
    name: 'Ethan Carter',
    team: 'Frontend Devs',
    phone: '+1 (212) 443-0012',
    color: 'bg-green-100',
    image: 'assets/img/john-canady.jpg'
  },
  {
    name: 'Sophia Martinez',
    team: 'Marketing',
    phone: '+49 (176) 654-9870',
    color: 'bg-yellow-100',
    image: 'assets/img/john-canady.jpg'
  },
  {
    name: 'Noah Patel',
    team: 'QA & Testing',
    phone: '+91 (998) 234-2212',
    color: 'bg-purple-100',
    image: 'assets/img/john-canady.jpg'
  },
  {
    name: 'Isabella Rossi',
    team: 'Product Design',
    phone: '+39 (335) 890-1203',
    color: 'bg-red-100',
    image: 'assets/img/john-canady.jpg'
  }
];


}
