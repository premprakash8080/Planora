import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

interface Member {
  id: string;
  name: string;
  role: 'Developer' | 'Designer' | 'Manager' | 'QA' | 'DevOps';
  projectsAssigned: number;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  avatarColor: string;
  initials: string;
}

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {

  searchTerm = '';
  selectedRole: 'All' | Member['role'] = 'All';
  selectedStatus: 'All' | Member['status'] = 'All';

  members: Member[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatarUrl: 'assets/img/pic_rounded.svg',
      initials: 'SJ',
      avatarColor: '#6C5CE7',
      role: 'Developer',
      projectsAssigned: 5,
      status: 'Active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      initials: 'MC',
      avatarColor: '#00B894',
      role: 'Developer',
      projectsAssigned: 4,
      status: 'Active'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      initials: 'ER',
      avatarColor: '#0984E3',
      role: 'Designer',
      projectsAssigned: 3,
      status: 'Active'
    },
    {
      id: '4',
      name: 'David Kim',
      initials: 'DK',
      avatarColor: '#E17055',
      role: 'DevOps',
      projectsAssigned: 2,
      status: 'Inactive'
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      initials: 'LA',
      avatarColor: '#6C5CE7',
      role: 'Manager',
      projectsAssigned: 6,
      status: 'Active'
    },
    {
      id: '6',
      name: 'James Wilson',
      initials: 'JW',
      avatarColor: '#D63031',
      role: 'QA',
      projectsAssigned: 4,
      status: 'Active'
    },
    {
      id: '7',
      name: 'Priya Patel',
      initials: 'PP',
      avatarColor: '#E84393',
      role: 'Designer',
      projectsAssigned: 2,
      status: 'Inactive'
    },
    {
      id: '8',
      name: 'Oliver Brown',
      initials: 'OB',
      avatarColor: '#00CEC9',
      role: 'Developer',
      projectsAssigned: 5,
      status: 'Active'
    }
  ];
  

  displayedMembers: Member[] = [];
  displayedColumns: string[] = ['name', 'role', 'projectsAssigned', 'status'];

  roles: Array<'All' | Member['role']> = ['All', 'Developer', 'Designer', 'Manager', 'QA', 'DevOps'];
  statuses: Array<'All' | Member['status']> = ['All', 'Active', 'Inactive'];

  constructor() { }

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.displayedMembers = this.members.filter(member => {
      const matchesTerm =
        member.name.toLowerCase().includes(term) ||
        member.role.toLowerCase().includes(term);

      const matchesRole = this.selectedRole === 'All' || member.role === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'All' || member.status === this.selectedStatus;

      return matchesTerm && matchesRole && matchesStatus;
    });
  }

  onRoleChange(event: MatSelectChange): void {
    this.selectedRole = event.value as 'All' | Member['role'];
    this.applyFilters();
  }

  onStatusChange(event: MatSelectChange): void {
    this.selectedStatus = event.value as 'All' | Member['status'];
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }
}
