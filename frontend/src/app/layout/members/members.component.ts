import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Member, MemberRole, MemberStatus } from './member.model';
import { MembersService } from './members.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit, OnDestroy {

  searchTerm = '';
  selectedRole: 'All' | MemberRole = 'All';
  selectedStatus: 'All' | MemberStatus = 'All';

  private members: Member[] = [];
  displayedMembers: Member[] = [];
  displayedColumns: string[] = ['name', 'role', 'projectsAssigned', 'status'];

  roles: Array<'All' | MemberRole> = ['All', 'Developer', 'Designer', 'Manager', 'QA', 'DevOps'];
  statuses: Array<'All' | MemberStatus> = ['All', 'Active', 'Inactive'];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly membersService: MembersService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.membersService.members$
      .pipe(takeUntil(this.destroy$))
      .subscribe((members) => {
        this.members = members;
        this.applyFilters();
      });
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
    this.selectedRole = event.value as 'All' | MemberRole;
    this.applyFilters();
  }

  onStatusChange(event: MatSelectChange): void {
    this.selectedStatus = event.value as 'All' | MemberStatus;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  handleMemberSelect(member: Member): void {
    this.router.navigate(['/members', member.id]);
  }

  handleAddMember(): void {
    this.router.navigate(['/members', 'new']);
  }

  trackByMemberId(_index: number, member: Member): string {
    return member.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
