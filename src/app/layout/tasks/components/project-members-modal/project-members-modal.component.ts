import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ProjectService, Project, ProjectMember } from '../../services/project.service';
import { MemberService, Member } from '../../../members/service/member.service';
import { DropdownPopoverItem } from '../../../../shared/ui/dropdown-popover/dropdown-popover.component';

@Component({
  selector: 'app-project-members-modal',
  templateUrl: './project-members-modal.component.html',
  styleUrls: ['./project-members-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectMembersModalComponent implements OnInit, OnDestroy {
  project: Project;
  projectMembers: ProjectMember[] = [];
  allMembers: Member[] = [];
  availableMembers: Member[] = [];
  memberItems: DropdownPopoverItem[] = [];
  loading = false;
  addingMember = false;
  searchInputValue = '';
  private destroy$ = new Subject<void>();
  private isLoadingMembers = false;

  constructor(
    public dialogRef: MatDialogRef<ProjectMembersModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private projectService: ProjectService,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) {
    this.project = data.project;
    this.projectMembers = data.project.members || [];
  }

  ngOnInit(): void {
    this.loadAllMembers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllMembers(): void {
    // Prevent multiple simultaneous calls
    if (this.isLoadingMembers) {
      return;
    }

    // Use the new endpoint that returns only available members for this project
    this.isLoadingMembers = true;
    this.loading = true;
    this.cdr.markForCheck();

    this.memberService.getAvailableMembersForProject(this.project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.availableMembers = members;
          this.allMembers = members; // Keep for reference
          this.updateMemberItems();
          this.loading = false;
          this.isLoadingMembers = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.isLoadingMembers = false;
          this.cdr.markForCheck();
        }
      });
  }

  updateAvailableMembers(): void {
    // Reload available members after adding/removing
    this.loadAllMembers();
  }

  private updateMemberItems(): void {
    // Memoize the member items to avoid recalculating on every change detection
    this.memberItems = this.availableMembers.map(member => ({
      id: member.id.toString(),
      label: member.full_name,
      description: member.email,
      avatarText: member.full_name,
      avatarUrl: member.avatar_url,
      avatarColor: member.avatar_color || '#8b5cf6',
      data: member,
      color: member.avatar_color || '#8b5cf6'
    }));
  }


  onInputFocus(): void {
    // Input is readonly, clicking will trigger dropdown via appDropdownTrigger
  }

  onInputChange(event: Event): void {
    // Input is readonly, this won't be called but kept for consistency
  }

  onAddMember(selectedItem: DropdownPopoverItem): void {
    const member = selectedItem.data as Member;
    const userId = member.id;
    
    // Prevent multiple simultaneous additions
    if (this.addingMember) {
      return;
    }

    this.addingMember = true;
    this.searchInputValue = ''; // Clear input after selection
    this.cdr.markForCheck();

    this.projectService.addProjectMember(this.project.id.toString(), userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newMember) => {
          // Create new array reference for OnPush change detection
          this.projectMembers = [...this.projectMembers, newMember];
          // Reload available members to update the list
          this.loadAllMembers();
          this.addingMember = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.addingMember = false;
          this.cdr.markForCheck();
        }
      });
  }

  onRemoveMember(memberId: number): void {
    this.projectService.removeProjectMember(this.project.id.toString(), memberId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Create new array reference for OnPush change detection
          this.projectMembers = this.projectMembers.filter(m => m.user_id !== memberId);
          // Reload available members to update the list
          this.loadAllMembers();
          this.cdr.markForCheck();
        },
        error: () => {
          // Error handling is done in the service
          this.cdr.markForCheck();
        }
      });
  }

  canRemoveMember(member: ProjectMember): boolean {
    // Don't allow removing the project creator
    return member.user_id !== this.project.created_by;
  }

  getInitials(member: ProjectMember): string {
    return member.user.initials || this.generateInitials(member.user.full_name);
  }

  private generateInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // TrackBy functions for *ngFor performance
  trackByMemberId(index: number, member: ProjectMember): number {
    return member.user_id;
  }

  trackByItemId(index: number, item: DropdownPopoverItem): string {
    return item.id;
  }

  close(): void {
    this.dialogRef.close(this.projectMembers);
  }
}

