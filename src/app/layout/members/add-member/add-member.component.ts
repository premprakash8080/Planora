import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit {
  memberForm: FormGroup;
  roles: Member['role'][] = ['Developer', 'Designer', 'Manager', 'QA', 'DevOps'];
  statuses: Member['status'][] = ['Active', 'Inactive'];
  isEditMode = false;
  memberId: string | null = null;
  existingMember: Member | null = null;
  
  avatarColors: string[] = [
    '#6C5CE7', '#00B894', '#0984E3', '#E17055', 
    '#D63031', '#E84393', '#00CEC9', '#FDCB6E'
  ];

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
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.memberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id');
    
    if (this.memberId) {
      this.isEditMode = true;
      this.existingMember = this.members.find(m => m.id === this.memberId) || null;
      
      if (this.existingMember) {
        // Populate form with existing member data
        this.memberForm.patchValue({
          name: this.existingMember.name,
          email: this.existingMember.email || '',
          role: this.existingMember.role,
          status: this.existingMember.status
        });
      } else {
        // Member not found, redirect to members list
        this.router.navigate(['/members']);
      }
    }
  }

  onSubmit(): void {
    if (this.memberForm.valid) {
      const formValue = this.memberForm.value;
      
      if (this.isEditMode && this.existingMember) {
        // Update existing member
        const updatedMember: Member = {
          ...this.existingMember,
          name: formValue.name,
          email: formValue.email,
          role: formValue.role,
          status: formValue.status,
          // Update initials if name changed
          initials: this.getInitials(formValue.name)
        };

        // TODO: Update member in service/store
        console.log('Updated member:', updatedMember);
        
        // Navigate back to member detail view
        this.router.navigate(['/members', this.memberId]);
      } else {
        // Create new member
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
      }
    } else {
      this.memberForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.memberId) {
      // Navigate back to member detail view
      this.router.navigate(['/members', this.memberId]);
    } else {
      // Navigate back to members list
      this.router.navigate(['/members']);
    }
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

