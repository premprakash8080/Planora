import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Member, MemberService } from '../../service/member.service';

@Component({
  selector: 'app-view-member',
  templateUrl: './view-member.component.html',
  styleUrls: ['./view-member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewMemberComponent implements OnInit {
  member: Member | null = null;
  memberId: number | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.memberId = parseInt(id, 10);
      this.loadMember();
    } else {
      this.router.navigate(['/members']);
    }
  }

  /**
   * Load member from API
   */
  loadMember(): void {
    if (!this.memberId) return;

    this.loading = true;
    this.cdr.markForCheck();
    
    this.memberService.getMemberById(this.memberId).subscribe({
      next: (member) => {
        this.member = member;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading member:', error);
        this.member = null;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/members']);
  }

  onEdit(): void {
    if (this.memberId) {
      this.router.navigate(['/members', this.memberId, 'edit']);
    }
  }

  getInitials(fullName: string): string {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
