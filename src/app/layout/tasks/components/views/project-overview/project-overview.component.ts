import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, filter, tap } from 'rxjs/operators';
import { ProjectService } from '../../../services/project.service';
import { ProjectOverviewMember, ProjectOverviewActivity, ProjectOverviewData } from './project-overview.model';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent implements OnInit, OnDestroy {
  description = '';
  descriptionEditing = false;
  descriptionDraft = '';
  members: ProjectOverviewMember[] = [];
  status: 'on-track' | 'at-risk' | 'off-track' = 'on-track';
  dueDate: string | null = null;
  dueDateEditing = false;
  dueDateDraft: Date | null = null;
  activities: ProjectOverviewActivity[] = [];
  loading = false;
  error: string | null = null;
  dataLoaded = false;
  saving = false;

  private readonly destroy$ = new Subject<void>();
  private projectId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Get projectId from parent route params (projects/:projectId/tasks)
    this.route.parent?.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.projectId = params['projectId'];
      if (this.projectId) {
        this.loadProjectOverview();
      }
    });

    // Reload data when navigating to this route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap((event: NavigationEnd) => {
          if (event.urlAfterRedirects.includes('/overview') && !this.dataLoaded) {
            setTimeout(() => {
              if (this.projectId) {
                this.loadProjectOverview();
              }
            }, 50);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load project overview data
   */
  loadProjectOverview(): void {
    if (!this.projectId || this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.dataLoaded = false;

    this.projectService.getProjectOverview(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ProjectOverviewData) => {
          this.ngZone.run(() => {
            this.description = data.description || '';
            this.descriptionDraft = this.description;
            this.members = [...(data.members || [])];
            this.status = data.status || 'on-track';
            this.dueDate = data.dueDate || null;
            this.dueDateDraft = this.dueDate ? new Date(this.dueDate) : null;
            this.activities = [...(data.activities || [])];
            this.loading = false;
            this.dataLoaded = true;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error loading project overview:', error);
          this.ngZone.run(() => {
            this.error = 'Failed to load project overview';
            this.loading = false;
            this.dataLoaded = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  /**
   * Update project status
   */
  updateStatus(newStatus: 'on-track' | 'at-risk' | 'off-track'): void {
    if (!this.projectId || this.status === newStatus || this.saving) {
      return;
    }

    const oldStatus = this.status;
    this.status = newStatus; // Optimistic update

    this.projectService.updateProjectOverview(this.projectId, { health_status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.saving = false;
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.status = oldStatus; // Revert on error
          this.ngZone.run(() => {
            this.saving = false;
            this.snackBarService.showError('Failed to update project status');
            this.cdr.markForCheck();
          });
        }
      });
  }

  /**
   * Start editing description
   */
  startEditingDescription(): void {
    this.descriptionEditing = true;
    this.descriptionDraft = this.description;
  }

  /**
   * Save description
   */
  saveDescription(): void {
    if (!this.projectId || this.saving) {
      return;
    }

    const newDescription = this.descriptionDraft.trim();
    if (newDescription === this.description) {
      this.descriptionEditing = false;
      return;
    }

    this.saving = true;
    this.projectService.updateProjectOverview(this.projectId, { description: newDescription })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.description = newDescription;
            this.descriptionEditing = false;
            this.saving = false;
            this.snackBarService.showSuccess('Description updated');
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error updating description:', error);
          this.ngZone.run(() => {
            this.descriptionDraft = this.description; // Revert draft
            this.descriptionEditing = false;
            this.saving = false;
            this.snackBarService.showError('Failed to update description');
            this.cdr.markForCheck();
          });
        }
      });
  }

  /**
   * Cancel editing description
   */
  cancelEditingDescription(): void {
    this.descriptionEditing = false;
    this.descriptionDraft = this.description;
  }

  /**
   * Start editing due date
   */
  startEditingDueDate(): void {
    this.dueDateEditing = true;
    this.dueDateDraft = this.dueDate ? new Date(this.dueDate) : null;
  }

  /**
   * Save due date
   */
  saveDueDate(): void {
    if (!this.projectId || this.saving) {
      return;
    }

    const newDueDate = this.dueDateDraft ? this.dueDateDraft.toISOString().split('T')[0] : null;
    const currentDueDate = this.dueDate ? new Date(this.dueDate).toISOString().split('T')[0] : null;

    if (newDueDate === currentDueDate) {
      this.dueDateEditing = false;
      return;
    }

    this.saving = true;
    this.projectService.updateProjectOverview(this.projectId, { due_date: newDueDate })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.dueDate = newDueDate;
            this.dueDateEditing = false;
            this.saving = false;
            this.snackBarService.showSuccess('Due date updated');
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error updating due date:', error);
          this.ngZone.run(() => {
            this.dueDateDraft = this.dueDate ? new Date(this.dueDate) : null;
            this.dueDateEditing = false;
            this.saving = false;
            this.snackBarService.showError('Failed to update due date');
            this.cdr.markForCheck();
          });
        }
      });
  }

  /**
   * Cancel editing due date
   */
  cancelEditingDueDate(): void {
    this.dueDateEditing = false;
    this.dueDateDraft = this.dueDate ? new Date(this.dueDate) : null;
  }

  /**
   * Remove member from project
   */
  removeMember(memberId: string): void {
    if (!this.projectId || this.saving) {
      return;
    }

    if (!confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }

    this.saving = true;
    this.projectService.removeProjectMember(this.projectId, parseInt(memberId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.members = this.members.filter(m => m.id !== memberId);
            this.saving = false;
            this.snackBarService.showSuccess('Member removed');
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error removing member:', error);
          this.ngZone.run(() => {
            this.saving = false;
            this.snackBarService.showError('Failed to remove member');
            this.cdr.markForCheck();
          });
        }
      });
  }

  /** Human‑readable label for the current status */
  getStatusLabel(): string {
    switch (this.status) {
      case 'on-track':  return 'On track';
      case 'at-risk':   return 'At risk';
      case 'off-track': return 'Off track';
      default:          return 'On track';
    }
  }

  /** Token‑based colour for the current status */
  getStatusColor(): string {
    switch (this.status) {
      case 'on-track':  return '#10b981'; // accent
      case 'at-risk':   return '#f59e0b'; // warning
      case 'off-track': return '#ef4444'; // danger
      default:          return '#10b981';
    }
  }

  /**
   * Track by functions for ngFor
   */
  trackByMemberId(index: number, member: ProjectOverviewMember): string {
    return member.id;
  }

  trackByActivityId(index: number, activity: ProjectOverviewActivity): string {
    return activity.id;
  }

  /**
   * Get max date for date picker (no future dates restriction, but you can add if needed)
   */
  get maxDate(): Date | null {
    return null; // Allow any date, or set max date if needed
  }
}