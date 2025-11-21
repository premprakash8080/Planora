import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { InboxService, InboxUpdate } from '../service/inbox.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

/**
 * Inbox Component
 * 
 * Displays task-related updates similar to Asana's Inbox or activity feed.
 * Shows task updates with information like task name, project name, update type, and time.
 */
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, AfterViewInit {
  inboxUpdates: InboxUpdate[] = [];
  loading = false;

  constructor(
    private inboxService: InboxService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadInboxActivities();
  }

  ngAfterViewInit(): void {
    // Ensure change detection runs after view initialization
    this.cdr.detectChanges();
  }

  /**
   * Load inbox activities from API
   */
  loadInboxActivities(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.inboxService.getInboxActivities(50, 0).subscribe({
      next: (activities) => {
        this.ngZone.run(() => {
          this.inboxUpdates = activities;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading inbox activities:', error);
        this.ngZone.run(() => {
          this.snackBarService.showError('Failed to load inbox activities');
          this.loading = false;
          // Fallback to empty array
          this.inboxUpdates = [];
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Handle click on an inbox item
   */
  onUpdateClick(update: InboxUpdate): void {
    // TODO: Navigate to task detail page
    console.log('Clicked update:', update);
  }
}
