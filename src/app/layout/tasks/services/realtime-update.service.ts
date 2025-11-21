import { Injectable } from '@angular/core';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { switchMap, startWith, catchError, tap } from 'rxjs/operators';
import { TaskService } from '../task.service';
import { TaskSection } from '../task.model';

export interface UpdateEvent {
  type: 'task' | 'section' | 'comment' | 'activity';
  action: 'created' | 'updated' | 'deleted';
  projectId: string;
  data: any;
}

/**
 * Real-time Update Service
 * Polls for updates and emits events when changes are detected
 * 
 * For production, consider replacing with WebSockets:
 * - Socket.io for Node.js backend
 * - @angular/websocket for frontend
 */
@Injectable({
  providedIn: 'root'
})
export class RealtimeUpdateService {
  private updateSubject = new Subject<UpdateEvent>();
  private pollingSubscriptions = new Map<string, Subscription>();
  private lastUpdateTimestamps = new Map<string, number>();
  private readonly POLL_INTERVAL = 5000; // 5 seconds

  constructor(private taskService: TaskService) {}

  /**
   * Start polling for updates for a project
   */
  startPolling(projectId: string): void {
    if (this.pollingSubscriptions.has(projectId)) {
      return; // Already polling
    }

    const subscription = interval(this.POLL_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => this.checkForUpdates(projectId)),
        catchError(error => {
          console.error('Polling error:', error);
          return [];
        })
      )
      .subscribe();

    this.pollingSubscriptions.set(projectId, subscription);
  }

  /**
   * Stop polling for a project
   */
  stopPolling(projectId: string): void {
    const subscription = this.pollingSubscriptions.get(projectId);
    if (subscription) {
      subscription.unsubscribe();
      this.pollingSubscriptions.delete(projectId);
      this.lastUpdateTimestamps.delete(projectId);
    }
  }

  /**
   * Get update events as observable
   */
  getUpdates(): Observable<UpdateEvent> {
    return this.updateSubject.asObservable();
  }

  /**
   * Check for updates by comparing current data with last known state
   */
  private checkForUpdates(projectId: string): Observable<void> {
    return this.taskService.getSections(projectId).pipe(
      tap(sections => {
        const lastTimestamp = this.lastUpdateTimestamps.get(projectId) || 0;
        const currentTimestamp = this.getMaxTimestamp(sections);

        if (currentTimestamp > lastTimestamp) {
          // Changes detected - emit update event
          this.updateSubject.next({
            type: 'task',
            action: 'updated',
            projectId,
            data: { sections }
          });
        }

        this.lastUpdateTimestamps.set(projectId, currentTimestamp);
      }),
      switchMap(() => [])
    );
  }

  /**
   * Get maximum timestamp from sections and tasks
   */
  private getMaxTimestamp(sections: TaskSection[]): number {
    let maxTimestamp = 0;

    for (const section of sections) {
      for (const task of section.tasks) {
        // Check task updated_at if available
        // For now, use current time as placeholder
        maxTimestamp = Math.max(maxTimestamp, Date.now());
      }
    }

    return maxTimestamp;
  }

  /**
   * Manually trigger an update check
   */
  checkNow(projectId: string): void {
    this.checkForUpdates(projectId).subscribe();
  }

  /**
   * Cleanup all subscriptions
   */
  destroy(): void {
    this.pollingSubscriptions.forEach(sub => sub.unsubscribe());
    this.pollingSubscriptions.clear();
    this.lastUpdateTimestamps.clear();
  }
}

