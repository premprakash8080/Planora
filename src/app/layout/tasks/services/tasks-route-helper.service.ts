import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Helper service to determine if we're in "My Tasks" mode vs Project Tasks mode
 */
@Injectable({
  providedIn: 'root'
})
export class TasksRouteHelperService {
  constructor(private router: Router) {}

  /**
   * Check if current route is "my-tasks" mode
   */
  isMyTasksMode(route: ActivatedRoute): boolean {
    let current: ActivatedRoute | null = route;
    while (current) {
      const url = this.router.url;
      // Check if URL contains "my-tasks" and doesn't have projectId
      if (url.includes('/my-tasks') && !current.snapshot.paramMap.has('projectId')) {
        return true;
      }
      // If we find a projectId param, we're in project mode
      if (current.snapshot.paramMap.has('projectId')) {
        return false;
      }
      current = current.parent;
    }
    // Check URL directly as fallback
    return this.router.url.includes('/my-tasks');
  }

  /**
   * Get projectId from route if in project mode, null if in my-tasks mode
   */
  getProjectId(route: ActivatedRoute): string | null {
    if (this.isMyTasksMode(route)) {
      return null;
    }
    
    let current: ActivatedRoute | null = route;
    while (current) {
      if (current.snapshot.paramMap.has('projectId')) {
        return current.snapshot.paramMap.get('projectId');
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * Find the route that contains projectId (for project mode)
   */
  findProjectRoute(route: ActivatedRoute): ActivatedRoute | null {
    let current: ActivatedRoute | null = route;
    while (current) {
      if (current.snapshot.paramMap.has('projectId')) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }
}

