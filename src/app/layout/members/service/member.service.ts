import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

export interface Member {
  id: number;
  full_name: string;
  email: string;
  role?: string; // Team role (owner, admin, member)
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  avatar_color?: string;
  initials?: string;
  projectsAssigned?: number; // Calculated on frontend
  team_id?: number; // If viewing team members
  password?: string; // Password for the member
}

export interface MemberResponse {
  success: boolean;
  data: {
    members?: Member[];
    member?: Member;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  constructor(
    private httpService: HttpService,
    private snackBarService: SnackBarService
  ) {}

  /**
   * Get all members (users)
   */
  getMembers(): Observable<Member[]> {
    return this.httpService.get(ENDPOINTS.getMembers).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response && response.success && response.data && response.data.members) {
          return response.data.members.map((member: any) => this.mapUserToMember(member));
        }
        // Fallback: check if response.data.users is an array
        if (response && response.data && Array.isArray(response.data)) {
          return response.data.map((member: any) => this.mapUserToMember(member));
        }
        // Fallback: check if response is directly an array
        if (Array.isArray(response)) {
          return response.map((member: any) => this.mapUserToMember(member));
        }
        console.warn('Unexpected response format:', response);
        return [];
      }),
      catchError((error) => {
        console.error('Error in getMembers:', error);
        this.snackBarService.showError('Failed to load members');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get member by ID
   */
  getMemberById(memberId: number): Observable<Member> {
    return this.httpService.post(ENDPOINTS.getMemberById.replace(':id', memberId.toString()), { id: memberId }).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data && response.data.member) {
          return this.mapUserToMember(response.data.member);
        }
        // Fallback for direct member object
        if (response.id) {
          return this.mapUserToMember(response);
        }
        throw new Error('Member not found');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load member');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get team members
   */
  getTeamMembers(teamId: number): Observable<Member[]> {
    return this.httpService.get(ENDPOINTS.getTeamMembers.replace(':teamId', teamId.toString())).pipe(
      map((response: MemberResponse) => {
        if (response.success && response.data.members) {
          return response.data.members;
        }
        return [];
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to load team members');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Create/Invite member (register user)
   */
  createMember(memberData: Partial<Member>): Observable<Member> {
    // Map member data to user registration format
    const userData = {
      full_name: memberData.full_name,
      email: memberData.email,
      password: memberData.password,
    };

    return this.httpService.post(ENDPOINTS.createMember, userData).pipe(
      map((response: any) => {
        // Handle unified response format from register endpoint
        if (response.success && response.data && response.data.user) {
          this.snackBarService.showSuccess(response.message || 'Member created successfully');
          return this.mapUserToMember(response.data.user);
        }
        throw new Error('Failed to create member');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to create member');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update member
   */
  updateMember(memberId: number, memberData: Partial<Member>): Observable<Member> {
    // Map member data to user update format (exclude password and role)
    const userData: any = {};
    if (memberData.full_name) userData.full_name = memberData.full_name;
    if (memberData.email) userData.email = memberData.email;
    if (memberData.status) userData.status = memberData.status;
    if (memberData.avatar_url !== undefined) userData.avatar_url = memberData.avatar_url;
    if (memberData.avatar_color !== undefined) userData.avatar_color = memberData.avatar_color;

    return this.httpService.put(ENDPOINTS.updateMember.replace(':id', memberId.toString()), userData).pipe(
      map((response: any) => {
        // Handle unified response format
        if (response.success && response.data && response.data.user) {
          this.snackBarService.showSuccess(response.message || 'Member updated successfully');
          return this.mapUserToMember(response.data.user);
        }
        throw new Error('Failed to update member');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to update member');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Delete member
   */
  deleteMember(memberId: number): Observable<void> {
    return this.httpService.delete(ENDPOINTS.deleteMember.replace(':id', memberId.toString())).pipe(
      map(() => {
        this.snackBarService.showSuccess('Member removed successfully');
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to remove member');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get projects count for a member
   */
  getMemberProjectsCount(memberId: number): Observable<number> {
    return this.httpService.get(ENDPOINTS.getMemberProjectsCount.replace(':id', memberId.toString())).pipe(
      map((response: { success: boolean; data: { count: number } }) => {
        return response.data?.count || 0;
      }),
      catchError(() => {
        return [0];
      })
    );
  }

  /**
   * Get available members for a project (users not already in the project)
   */
  getAvailableMembersForProject(projectId: number): Observable<Member[]> {
    return this.httpService.post(ENDPOINTS.getAvailableMembersForProject, { project_id: projectId }).pipe(
      map((response: any) => {
        if (response.success && response.data && response.data.members) {
          return response.data.members.map((user: any) => this.mapUserToMember(user));
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error in getAvailableMembersForProject:', error);
        this.snackBarService.showError('Failed to load available members');
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Convert backend user to frontend member format
   */
  convertToMember(user: any, role?: string, projectsCount?: number): Member {
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: role || 'member',
      status: user.status || 'active',
      avatar_url: user.avatar_url,
      avatar_color: user.avatar_color,
      initials: user.initials,
      projectsAssigned: projectsCount || 0
    };
  }

  /**
   * Map user from backend to member format
   */
  private mapUserToMember(user: any): Member {
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role || 'member', // Note: role may not exist in user model
      status: user.status || 'active',
      avatar_url: user.avatar_url,
      avatar_color: user.avatar_color,
      initials: user.initials,
      projectsAssigned: user.projectsAssigned !== undefined ? parseInt(user.projectsAssigned) || 0 : 0
    };
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

