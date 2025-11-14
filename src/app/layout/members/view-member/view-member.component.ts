import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface Member {
  id: string;
  name: string;
  role: 'Developer' | 'Designer' | 'Manager' | 'QA' | 'DevOps';
  projectsAssigned: number;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  avatarColor: string;
  initials: string;
  email?: string;
}

@Component({
  selector: 'app-view-member',
  templateUrl: './view-member.component.html',
  styleUrls: ['./view-member.component.scss']
})
export class ViewMemberComponent implements OnInit {
  member: Member | null = null;
  memberId: string | null = null;

  // Mock data - in real app, this would come from a service
  private members: Member[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatarUrl: 'assets/img/pic_rounded.svg',
      initials: 'SJ',
      avatarColor: '#6C5CE7',
      role: 'Developer',
      projectsAssigned: 5,
      status: 'Active',
      email: 'sarah.johnson@planora.com'
    },
    {
      id: '2',
      name: 'Michael Chen',
      initials: 'MC',
      avatarColor: '#00B894',
      role: 'Developer',
      projectsAssigned: 4,
      status: 'Active',
      email: 'michael.chen@planora.com'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      initials: 'ER',
      avatarColor: '#0984E3',
      role: 'Designer',
      projectsAssigned: 3,
      status: 'Active',
      email: 'emily.rodriguez@planora.com'
    },
    {
      id: '4',
      name: 'David Kim',
      initials: 'DK',
      avatarColor: '#E17055',
      role: 'DevOps',
      projectsAssigned: 2,
      status: 'Inactive',
      email: 'david.kim@planora.com'
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      initials: 'LA',
      avatarColor: '#6C5CE7',
      role: 'Manager',
      projectsAssigned: 6,
      status: 'Active',
      email: 'lisa.anderson@planora.com'
    },
    {
      id: '6',
      name: 'James Wilson',
      initials: 'JW',
      avatarColor: '#D63031',
      role: 'QA',
      projectsAssigned: 4,
      status: 'Active',
      email: 'james.wilson@planora.com'
    },
    {
      id: '7',
      name: 'Priya Patel',
      initials: 'PP',
      avatarColor: '#E84393',
      role: 'Designer',
      projectsAssigned: 2,
      status: 'Inactive',
      email: 'priya.patel@planora.com'
    },
    {
      id: '8',
      name: 'Oliver Brown',
      initials: 'OB',
      avatarColor: '#00CEC9',
      role: 'Developer',
      projectsAssigned: 5,
      status: 'Active',
      email: 'oliver.brown@planora.com'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id');
    
    if (this.memberId) {
      this.member = this.members.find(m => m.id === this.memberId) || null;
      
      if (!this.member) {
        // Member not found, redirect to members list
        this.router.navigate(['/members']);
      }
    } else {
      this.router.navigate(['/members']);
    }
  }

  onBack(): void {
    this.router.navigate(['/members']);
  }

  onEdit(): void {
    if (this.memberId) {
      this.router.navigate(['/members', this.memberId, 'edit']);
    }
  }
}

