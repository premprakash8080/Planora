import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MailService } from '../../services/mail.service';
import { MailComposeComponent } from '../mail-compose/mail-compose.component';
import { MailTabComponent } from '../mail-tab/mail-tab.component';

@Component({
  selector: 'app-mail-list',
  templateUrl: './mail-list.component.html',
  styleUrls: ['./mail-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailListComponent implements OnInit, AfterViewInit {
  @ViewChild('mailTab') mailTab!: MailTabComponent;

  filterType: 'all' | 'unread' | 'starred' | 'archived' = 'all';
  
  // Filter counts
  filterCounts = {
    all: 0,
    unread: 0,
    starred: 0,
    archived: 0
  };

  constructor(
    private readonly mailService: MailService,
    private readonly dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFilterCounts();
  }

  ngAfterViewInit(): void {
    // Ensure change detection runs after view initialization
    this.cdr.markForCheck();
  }

  /**
   * Load filter counts
   */
  loadFilterCounts(): void {
    // Load all mails to calculate counts
    this.mailService.getAllMails().subscribe({
      next: (allMails) => {
        // Create new object reference for OnPush change detection
        this.filterCounts = {
          all: allMails.length,
          unread: allMails.filter(m => !m.isRead).length,
          starred: allMails.filter(m => m.isStarred).length,
          archived: allMails.filter(m => m.isArchived).length
        };
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading filter counts:', error);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Open compose dialog
   */
  openCompose(): void {
    const dialogRef = this.dialog.open(MailComposeComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((sent) => {
      if (sent) {
        this.refreshMails();
        this.loadFilterCounts();
      }
    });
  }

  /**
   * Change filter
   */
  onFilterChange(filter: 'all' | 'unread' | 'starred' | 'archived'): void {
    this.filterType = filter;
  }

  /**
   * Refresh mails
   */
  refreshMails(): void {
    if (this.mailTab) {
      this.mailTab.refresh();
    }
    this.loadFilterCounts();
  }

  /**
   * Handle mail deleted event
   */
  onMailDeleted(): void {
    this.loadFilterCounts();
  }

  /**
   * Handle mail starred event
   */
  onMailStarred(): void {
    this.loadFilterCounts();
  }

  /**
   * Get empty message based on filter type
   */
  getEmptyMessage(): string {
    switch (this.filterType) {
      case 'all':
        return 'Your inbox is empty. Start by composing a new mail.';
      case 'unread':
        return 'You have no unread mails.';
      case 'starred':
        return 'You have no starred mails.';
      case 'archived':
        return 'You have no archived mails.';
      default:
        return 'No mails found.';
    }
  }
}
