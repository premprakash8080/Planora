import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit {
  memberForm: FormGroup;
  roles: Member['role'][] = ['Developer', 'Designer', 'Manager', 'QA', 'DevOps'];
  statuses: Member['status'][] = ['Active', 'Inactive'];
  
  avatarColors: string[] = [
    '#6C5CE7', '#00B894', '#0984E3', '#E17055', 
    '#D63031', '#E84393', '#00CEC9', '#FDCB6E'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.memberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.memberForm.valid) {
      const formValue = this.memberForm.value;
      
      // Generate initials from name
      const initials = this.getInitials(formValue.name);
      
      // Generate random avatar color
      const avatarColor = this.avatarColors[
        Math.floor(Math.random() * this.avatarColors.length)
      ];

      const newMember: Member = {
        id: Date.now().toString(),
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
        status: formValue.status,
        projectsAssigned: 0,
        avatarColor,
        initials
      };

      // TODO: Save member to service/store
      console.log('New member:', newMember);
      
      // Navigate back to members list
      this.router.navigate(['/members']);
    } else {
      this.memberForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/members']);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least 2 characters`;
    }
    return '';
  }
}

