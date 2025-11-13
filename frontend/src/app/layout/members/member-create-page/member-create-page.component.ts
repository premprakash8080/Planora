import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Member, MemberAvailability, MemberRole, MemberStatus } from '../member.model';
import { MembersService } from '../members.service';

@Component({
  selector: 'app-member-create-page',
  templateUrl: './member-create-page.component.html',
  styleUrls: ['./member-create-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCreatePageComponent {
  readonly roles: MemberRole[] = ['Developer', 'Designer', 'Manager', 'QA', 'DevOps'];
  readonly statuses: MemberStatus[] = ['Active', 'Inactive'];
  readonly availability: MemberAvailability[] = ['Full-time', 'Part-time', 'Contract'];

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    role: ['Developer', Validators.required],
    team: ['', Validators.required],
    status: ['Active', Validators.required],
    availability: ['Full-time', Validators.required],
    location: ['', Validators.required],
    projectsAssigned: [0, [Validators.required, Validators.min(0)]],
    bio: ['', [Validators.required, Validators.minLength(10)]],
    skills: ['', Validators.required],
    avatarColor: ['#ff7300'],
  });

  submitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly membersService: MembersService,
    private readonly router: Router
  ) {}

  handleCancel(): void {
    this.router.navigate(['/members']);
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const formValue = this.form.value;
    const member: Member = {
      id: crypto.randomUUID(),
      name: formValue.name,
      role: formValue.role,
      projectsAssigned: formValue.projectsAssigned,
      status: formValue.status,
      avatarUrl: undefined,
      avatarColor: formValue.avatarColor || '#ff7300',
      initials: this.buildInitials(formValue.name),
      team: formValue.team,
      email: formValue.email,
      phone: formValue.phone,
      location: formValue.location,
      availability: formValue.availability,
      bio: formValue.bio,
      skills: this.parseSkills(formValue.skills),
      lastActive: 'Just added',
    };

    this.membersService.addMember(member);
    this.router.navigate(['/members', member.id]);
  }

  private buildInitials(name: string): string {
    if (!name) {
      return '';
    }
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  private parseSkills(value: string): string[] {
    if (!value) {
      return [];
    }
    return value
      .split(',')
      .map((skill: string) => skill.trim())
      .filter(Boolean);
  }
}


