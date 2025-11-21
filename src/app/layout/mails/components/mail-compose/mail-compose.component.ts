import { Component, Inject, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComposeMail, MailService } from '../../services/mail.service';
import { MemberService, Member } from '../../../members/service/member.service';
import { DropdownPopoverItem } from '../../../../shared/ui/dropdown-popover/dropdown-popover.component';

export interface MailComposeData {
  to?: string;
  subject?: string;
}

@Component({
  selector: 'app-mail-compose',
  templateUrl: './mail-compose.component.html',
  styleUrls: ['./mail-compose.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailComposeComponent implements OnInit {
  form: ComposeMail = {
    to: this.data?.to || '',
    subject: this.data?.subject || '',
    body: ''
  };
  sending = false;

  // User selection
  users: Member[] = [];
  userItems: DropdownPopoverItem<Member>[] = [];
  selectedUser: Member | null = null;
  loadingUsers = false;

  constructor(
    private readonly dialogRef: MatDialogRef<MailComposeComponent>,
    private readonly mailService: MailService,
    private readonly memberService: MemberService,
    @Inject(MAT_DIALOG_DATA) public data: MailComposeData | null,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load users for recipient selection
   */
  loadUsers(): void {
    this.loadingUsers = true;
    this.cdr.markForCheck();
    
    this.memberService.getMembers().subscribe({
      next: (members) => {
        // Create new array references for OnPush change detection
        this.users = [...members];
        this.userItems = members.map(member => ({
          id: member.email,
          label: member.full_name,
          description: member.email,
          avatarText: member.initials || this.getInitials(member.full_name),
          avatarUrl: member.avatar_url,
          avatarColor: member.avatar_color || '#2563eb',
          data: member
        }));
        this.loadingUsers = false;
        
        // If initial 'to' email is provided, try to find matching user after users are loaded
        if (this.data?.to) {
          this.findUserByEmail(this.data.to);
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Find user by email
   */
  findUserByEmail(email: string): void {
    const user = this.users.find(u => u.email === email);
    if (user) {
      this.selectedUser = user;
      this.form.to = user.email;
    } else {
      // If user not found but email is provided, keep the email in form.to
      this.form.to = email;
    }
  }

  /**
   * Handle user selection from dropdown
   */
  onUserSelect(item: DropdownPopoverItem<Member>): void {
    const user = item.data || this.users.find(u => u.email === item.id);
    if (user) {
      this.selectedUser = user;
      this.form.to = user.email;
    }
  }

  /**
   * Get initials from full name
   */
  getInitials(fullName: string): string {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  /**
   * Get selected user display name
   */
  getSelectedUserName(): string {
    if (this.selectedUser) {
      return this.selectedUser.full_name;
    }
    if (this.form.to) {
      return this.form.to;
    }
    return 'Select recipient';
  }

  /**
   * Get selected user email
   */
  getSelectedUserEmail(): string {
    if (this.selectedUser) {
      return this.selectedUser.email;
    }
    return this.form.to || '';
  }

  /**
   * Send mail
   */
  send(): void {
    if (!this.form.to || !this.form.subject || !this.form.body) {
      return;
    }

    this.sending = true;
    this.cdr.markForCheck();
    
    this.mailService.sendMail({ ...this.form }).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error sending mail:', error);
        this.sending = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Cancel compose
   */
  cancel(): void {
    this.dialogRef.close(false);
  }
}
