import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Mail, MailService } from '../../services/mail.service';
import { MailComposeComponent, MailComposeData } from '../mail-compose/mail-compose.component';

@Component({
  selector: 'app-mail-view',
  templateUrl: './mail-view.component.html',
  styleUrls: ['./mail-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailViewComponent implements OnInit {
  mail: Mail | null = null;
  loading = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly mailService: MailService,
    private readonly dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const mailId = this.route.snapshot.paramMap.get('id');
    if (mailId) {
      this.loadMail(mailId);
    } else {
      this.router.navigate(['/mails']);
    }
  }

  /**
   * Load mail from API
   */
  loadMail(mailId: string): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.mailService.getMailById(mailId).subscribe({
      next: (mail) => {
        this.mail = mail;
        // Mark as read when viewing
        if (!mail.isRead) {
          this.mailService.markAsRead(mailId).subscribe({
            next: () => {
              if (this.mail) {
                this.mail = { ...this.mail, isRead: true };
                this.cdr.markForCheck();
              }
            }
          });
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading mail:', error);
        this.mail = null;
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/mails']);
      }
    });
  }

  /**
   * Go back to mail list
   */
  goBack(): void {
    this.router.navigate(['/mails']);
  }

  /**
   * Reply to mail
   */
  reply(): void {
    if (!this.mail) {
      return;
    }

    const dialogRef = this.dialog.open<MailComposeComponent, MailComposeData, boolean>(MailComposeComponent, {
      width: '600px',
      data: {
        to: this.mail.senderEmail,
        subject: `Re: ${this.mail.subject}`
      }
    });

    dialogRef.afterClosed().subscribe(sent => {
      if (sent) {
        this.router.navigate(['/mails']);
      }
    });
  }

  /**
   * Toggle star
   */
  toggleStar(): void {
    if (!this.mail) return;
    
    const newStarredState = !this.mail.isStarred;
    this.mailService.toggleStar(this.mail.id, newStarredState).subscribe({
      next: () => {
        if (this.mail) {
          // Create new object reference for OnPush change detection
          this.mail = { ...this.mail, isStarred: newStarredState };
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error toggling star:', error);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Delete mail
   */
  deleteMail(): void {
    if (!this.mail) return;

    if (confirm('Are you sure you want to delete this mail?')) {
      this.mailService.deleteMail(this.mail.id).subscribe({
        next: () => {
          this.router.navigate(['/mails']);
        },
        error: (error) => {
          console.error('Error deleting mail:', error);
        }
      });
    }
  }

  /**
   * Get avatar initials from sender name
   */
  getAvatarInitials(sender: string): string {
    return sender
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
