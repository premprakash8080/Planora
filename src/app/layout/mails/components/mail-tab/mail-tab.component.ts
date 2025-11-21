import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mail, MailService } from '../../services/mail.service';

@Component({
  selector: 'app-mail-tab',
  templateUrl: './mail-tab.component.html',
  styleUrls: ['./mail-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailTabComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() filterType: 'all' | 'unread' | 'starred' | 'archived' = 'all';
  @Input() emptyMessage: string = 'No mails found';
  @Output() mailDeleted = new EventEmitter<void>();
  @Output() mailStarred = new EventEmitter<void>();

  mails: Mail[] = [];
  loading = false;

  constructor(
    private readonly mailService: MailService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMails();
  }

  ngAfterViewInit(): void {
    // Ensure change detection runs after view initialization
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterType'] && !changes['filterType'].firstChange) {
      this.loadMails();
    }
  }

  /**
   * Load mails based on filter type
   */
  loadMails(): void {
    this.loading = true;
    this.cdr.markForCheck();

    let mailObservable;
    switch (this.filterType) {
      case 'all':
        mailObservable = this.mailService.getAllMails();
        break;
      case 'unread':
        mailObservable = this.mailService.getUnreadMails();
        break;
      case 'starred':
        mailObservable = this.mailService.getStarredMails();
        break;
      case 'archived':
        mailObservable = this.mailService.getArchivedMails();
        break;
      default:
        mailObservable = this.mailService.getAllMails();
    }

    mailObservable.subscribe({
      next: (mails) => {
        // Create new array reference for OnPush change detection
        this.mails = [...mails];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(`Error loading ${this.filterType} mails:`, error);
        this.mails = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Open mail detail view
   */
  openMail(mail: Mail): void {
    this.router.navigate([mail.id], { relativeTo: this.route });
  }

  /**
   * Toggle star
   */
  toggleStar(mail: Mail, event: Event): void {
    event.stopPropagation();
    const newStarredState = !mail.isStarred;
    this.mailService.toggleStar(mail.id, newStarredState).subscribe({
      next: () => {
        // Update mail in array with new reference
        const mailIndex = this.mails.findIndex(m => m.id === mail.id);
        if (mailIndex !== -1) {
          this.mails = [
            ...this.mails.slice(0, mailIndex),
            { ...this.mails[mailIndex], isStarred: newStarredState },
            ...this.mails.slice(mailIndex + 1)
          ];
        }
        this.mailStarred.emit();
        // Reload if we're on starred tab and unstarring
        if (this.filterType === 'starred' && !newStarredState) {
          this.loadMails();
        } else {
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
  deleteMail(mail: Mail, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this mail?')) {
      this.mailService.deleteMail(mail.id).subscribe({
        next: () => {
          // Create new array reference for OnPush change detection
          this.mails = this.mails.filter(m => m.id !== mail.id);
          this.mailDeleted.emit();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error deleting mail:', error);
          this.cdr.markForCheck();
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
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Refresh mails
   */
  refresh(): void {
    this.loadMails();
  }

  /**
   * TrackBy function for *ngFor performance
   */
  trackByMailId(index: number, mail: Mail): string {
    return mail.id;
  }
}

