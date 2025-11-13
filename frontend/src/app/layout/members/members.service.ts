import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Member } from './member.model';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private readonly membersSubject = new BehaviorSubject<Member[]>(this.seedMembers());

  readonly members$: Observable<Member[]> = this.membersSubject.asObservable();

  get members(): Member[] {
    return this.membersSubject.getValue();
  }

  getMemberById(id: string): Member | undefined {
    return this.members.find((member) => member.id === id);
  }

  addMember(member: Member): void {
    const members = [...this.members, member];
    this.membersSubject.next(members);
  }

  private seedMembers(): Member[] {
    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatarUrl: 'assets/img/pic_rounded.svg',
        initials: 'SJ',
        avatarColor: '#6C5CE7',
        role: 'Developer',
        projectsAssigned: 5,
        status: 'Active',
        team: 'Platform',
        email: 'sarah.johnson@planora.io',
        phone: '+1 (415) 555-0134',
        location: 'San Francisco, USA',
        availability: 'Full-time',
        bio: 'Full-stack developer leading our core platform delivery and mentoring new engineers.',
        skills: ['Angular', 'Node.js', 'GraphQL', 'UX collaboration'],
        lastActive: 'Online 2 minutes ago',
      },
      {
        id: '2',
        name: 'Michael Chen',
        initials: 'MC',
        avatarColor: '#00B894',
        role: 'Developer',
        projectsAssigned: 4,
        status: 'Active',
        team: 'Platform',
        email: 'michael.chen@planora.io',
        phone: '+1 (347) 555-0109',
        location: 'New York, USA',
        availability: 'Full-time',
        bio: 'Frontend-focused engineer delivering collaborative tools and task dashboards.',
        skills: ['Angular', 'TypeScript', 'RxJS', 'Testing'],
        lastActive: 'Online 12 minutes ago',
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        initials: 'ER',
        avatarColor: '#0984E3',
        role: 'Designer',
        projectsAssigned: 3,
        status: 'Active',
        team: 'Design Systems',
        email: 'emily.rodriguez@planora.io',
        phone: '+34 91 555 0148',
        location: 'Madrid, Spain',
        availability: 'Full-time',
        bio: 'Product designer shaping cross-platform experiences and accessibility standards.',
        skills: ['Figma', 'Design Systems', 'Accessibility'],
        lastActive: 'Online 25 minutes ago',
      },
      {
        id: '4',
        name: 'David Kim',
        initials: 'DK',
        avatarColor: '#E17055',
        role: 'DevOps',
        projectsAssigned: 2,
        status: 'Inactive',
        team: 'Infrastructure',
        email: 'david.kim@planora.io',
        phone: '+82 2-555-0190',
        location: 'Seoul, South Korea',
        availability: 'Contract',
        bio: 'Site reliability engineer focusing on scaling and observability.',
        skills: ['Kubernetes', 'Terraform', 'AWS', 'Prometheus'],
        lastActive: 'Inactive • Last seen 3 days ago',
      },
      {
        id: '5',
        name: 'Lisa Anderson',
        initials: 'LA',
        avatarColor: '#6C5CE7',
        role: 'Manager',
        projectsAssigned: 6,
        status: 'Active',
        team: 'Delivery',
        email: 'lisa.anderson@planora.io',
        phone: '+44 20 5550 1212',
        location: 'London, UK',
        availability: 'Full-time',
        bio: 'Program manager overseeing roadmap execution and stakeholder alignment.',
        skills: ['Strategic Planning', 'OKRs', 'Stakeholder Management'],
        lastActive: 'Online 1 hour ago',
      },
      {
        id: '6',
        name: 'James Wilson',
        initials: 'JW',
        avatarColor: '#D63031',
        role: 'QA',
        projectsAssigned: 4,
        status: 'Active',
        team: 'Quality Engineering',
        email: 'james.wilson@planora.io',
        phone: '+1 (206) 555-0170',
        location: 'Seattle, USA',
        availability: 'Full-time',
        bio: 'QA lead driving automation coverage and continuous quality improvements.',
        skills: ['Cypress', 'Playwright', 'API Testing'],
        lastActive: 'Online 5 minutes ago',
      },
      {
        id: '7',
        name: 'Priya Patel',
        initials: 'PP',
        avatarColor: '#E84393',
        role: 'Designer',
        projectsAssigned: 2,
        status: 'Inactive',
        team: 'Brand Studio',
        email: 'priya.patel@planora.io',
        phone: '+91 22 5550 2233',
        location: 'Mumbai, India',
        availability: 'Part-time',
        bio: 'Brand designer crafting marketing assets and visual storytelling.',
        skills: ['Illustration', 'Brand Identity', 'Motion'],
        lastActive: 'Inactive • Last seen yesterday',
      },
      {
        id: '8',
        name: 'Oliver Brown',
        initials: 'OB',
        avatarColor: '#00CEC9',
        role: 'Developer',
        projectsAssigned: 5,
        status: 'Active',
        team: 'Integrations',
        email: 'oliver.brown@planora.io',
        phone: '+61 2 5550 3344',
        location: 'Sydney, Australia',
        availability: 'Full-time',
        bio: 'Backend engineer building integrations and API-driven workflows.',
        skills: ['NestJS', 'Microservices', 'Domain Modeling'],
        lastActive: 'Online 9 minutes ago',
      },
    ];
  }
}


