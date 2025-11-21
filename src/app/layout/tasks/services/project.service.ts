import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';
import { environment } from 'src/environments/environment';

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'owner' | 'manager' | 'member';
  user: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    avatar_color?: string;
    initials?: string;
  };
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  color?: string;
  status?: string;
  due_date?: string;
  is_archived?: boolean;
  is_favorite?: boolean;
  created_by?: number;
  team_id?: number;
  creator?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    avatar_color?: string;
    initials?: string;
  };
  members?: ProjectMember[];
  created_at?: string;
  updated_at?: string;
}

export interface ProjectResponse {
  success: boolean;
  data: {
    projects?: Project[];
    project?: Project;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/projects`;

  constructor(
    private httpService: HttpService,
    private snackBarService: SnackBarService
  ) {}

  /**
   * Get all projects
   */
  getProjects(includeArchived = false): Observable<Project[]> {
    return this.httpService.get(this.baseUrl, { includeArchived }).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.projects) {
          return response.data.projects;
        }
        // Fallback for direct array response (backward compatibility)
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load projects');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get project by ID
   */
  getProjectById(projectId: string): Observable<Project> {
    return this.httpService.get(`${this.baseUrl}/${projectId}`).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.project) {
          return response.data.project;
        }
        // Fallback for direct object response
        if (response.id) {
          return response;
        }
        throw new Error('Project not found');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load project');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Create new project
   */
  createProject(projectData: Partial<Project>): Observable<Project> {
    return this.httpService.post(this.baseUrl, projectData).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.project) {
          this.snackBarService.showSuccess(response.message || 'Project created successfully');
          return response.data.project;
        }
        // Fallback for direct object response
        if (response.id) {
          this.snackBarService.showSuccess('Project created successfully');
          return response;
        }
        throw new Error('Failed to create project');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to create project');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update project
   */
  updateProject(projectId: string, updates: Partial<Project>): Observable<Project> {
    return this.httpService.put(`${this.baseUrl}/${projectId}`, updates).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.project) {
          this.snackBarService.showSuccess(response.message || 'Project updated successfully');
          return response.data.project;
        }
        // Fallback for direct object response
        if (response.id) {
          this.snackBarService.showSuccess('Project updated successfully');
          return response;
        }
        throw new Error('Failed to update project');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to update project');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Delete project
   */
  deleteProject(projectId: string): Observable<void> {
    return this.httpService.delete(`${this.baseUrl}/${projectId}`).pipe(
      map(() => {
        this.snackBarService.showSuccess('Project deleted successfully');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to delete project');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Toggle project favorite
   */
  toggleFavorite(projectId: string): Observable<boolean> {
    return this.httpService.patch(`${this.baseUrl}/${projectId}/toggle-favorite`, {}).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data?.is_favorite !== undefined) {
          return response.data.is_favorite;
        }
        // Fallback
        if (response.is_favorite !== undefined) {
          return response.is_favorite;
        }
        throw new Error('Failed to toggle favorite');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to update favorite');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Add member to project
   */
  addProjectMember(projectId: string, userId: number, role: 'owner' | 'manager' | 'member' = 'member'): Observable<ProjectMember> {
    return this.httpService.post(`${this.baseUrl}/${projectId}/members`, { user_id: userId, role }).pipe(
      map((response: any) => {
        if (response.success && response.data?.member) {
          this.snackBarService.showSuccess(response.message || 'Member added successfully');
          return response.data.member;
        }
        throw new Error('Failed to add member');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to add member');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Remove member from project
   */
  removeProjectMember(projectId: string, memberId: number): Observable<void> {
    return this.httpService.delete(`${this.baseUrl}/${projectId}/members/${memberId}`).pipe(
      map((response: any) => {
        if (response.success) {
          this.snackBarService.showSuccess(response.message || 'Member removed successfully');
        }
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to remove member');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get project overview data
   */
  getProjectOverview(projectId: string): Observable<any> {
    return this.httpService.get(`${this.baseUrl}/${projectId}/overview`).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to load project overview');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load project overview');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get project activities
   */
  getProjectActivities(projectId: string, limit: number = 50): Observable<any[]> {
    return this.httpService.get(`${this.baseUrl}/${projectId}/activities`, { limit }).pipe(
      map((response: any) => {
        if (response.success && response.data?.activities) {
          return response.data.activities;
        }
        return [];
      }),
      catchError((error) => {
        console.error('Failed to load project activities:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update project overview data
   */
  updateProjectOverview(projectId: string, updates: { description?: string; health_status?: string; due_date?: string | null }): Observable<any> {
    return this.httpService.patch(`${this.baseUrl}/${projectId}/overview`, updates).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          this.snackBarService.showSuccess(response.message || 'Project overview updated successfully');
          return response.data;
        }
        throw new Error('Failed to update project overview');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to update project overview');
        return throwError(() => this.handleError(error));
      })
    );
  }

  private handleError(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}

