import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Member } from '../member.model';
import { MembersService } from '../members.service';

@Component({
  selector: 'app-member-details-page',
  templateUrl: './member-details-page.component.html',
  styleUrls: ['./member-details-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDetailsPageComponent implements OnInit, OnDestroy {
  member: Member | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly membersService: MembersService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.member = null;
        return;
      }
      this.member = this.membersService.getMemberById(id) ?? null;
    });
  }

  handleContact(member: Member): void {
    console.log('Contact member', member);
  }

  handleViewProfile(member: Member): void {
    console.log('Viewing full profile for', member);
  }

  handleBack(): void {
    this.router.navigate(['/members']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


