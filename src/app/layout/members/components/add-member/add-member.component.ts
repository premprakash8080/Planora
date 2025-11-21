import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Member, MemberService } from '../../service/member.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMemberComponent implements OnInit {
  memberForm: FormGroup;
  roles: string[] = ['Developer', 'Designer', 'Manager', 'QA', 'DevOps'];
  statuses: Member['status'][] = ['active', 'inactive', 'suspended'];
  isEditMode = false;
  memberId: number | null = null;
  existingMember: Member | null = null;
  loading = false;
  
  avatarColors: string[] = [
    '#6C5CE7', '#00B894', '#0984E3', '#E17055', 
    '#D63031', '#E84393', '#00CEC9', '#FDCB6E'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) {
    this.memberForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['active', Validators.required],
      password: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.memberId = parseInt(id, 10);
      this.isEditMode = true;
      this.loadMember();
      // Remove password requirement in edit mode
      this.memberForm.get('password')?.clearValidators();
    } else {
      // Password required for new members
      this.memberForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.memberForm.get('password')?.updateValueAndValidity();
  }

  /**
   * Load member for editing
   */
  loadMember(): void {
    if (!this.memberId) return;

    this.loading = true;
    this.cdr.markForCheck();
    
    this.memberService.getMemberById(this.memberId).subscribe({
      next: (member) => {
        this.existingMember = member;
        this.memberForm.patchValue({
          full_name: member.full_name,
          email: member.email,
          role: member.role || '',
          status: member.status
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading member:', error);
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/members']);
      }
    });
  }

  onSubmit(): void {
    if (this.memberForm.valid) {
      this.loading = true;
      this.cdr.markForCheck();
      const formValue = this.memberForm.value;
      
      if (this.isEditMode && this.memberId) {
        // Update existing member
        const updateData: Partial<Member> = {
          full_name: formValue.full_name,
          email: formValue.email,
          status: formValue.status
        };

        // Only include role if it's provided
        if (formValue.role) {
          updateData.role = formValue.role;
        }

        this.memberService.updateMember(this.memberId, updateData).subscribe({
          next: () => {
            this.router.navigate(['/members', this.memberId]);
          },
          error: (error) => {
            console.error('Error updating member:', error);
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      } else {
        // Create new member
        const newMember: Partial<Member> = {
          full_name: formValue.full_name,
          email: formValue.email,
          role: formValue.role,
          status: formValue.status,
          password: formValue.password
        };

        this.memberService.createMember(newMember).subscribe({
          next: () => {
            this.router.navigate(['/members']);
          },
          error: (error) => {
            console.error('Error creating member:', error);
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      }
    } else {
      this.memberForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.memberId) {
      this.router.navigate(['/members', this.memberId]);
    } else {
      this.router.navigate(['/members']);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.memberForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }
}
