import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { ENDPOINTS } from './api.collection';
import { Task, TaskSection, TaskComment, TaskStatus, PriorityLabel } from '../task.model';

export interface BackendTask {
  id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  assignee?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    avatar_color?: string;
    initials?: string;
  };
  start_date?: string;
  due_date?: string;
  priority_label_id?: number | null;
  task_status_id?: number | null;
  priorityLabel?: PriorityLabel;
  taskStatus?: TaskStatus;
  // Legacy fields for backward compatibility
  priority?: string;
  status?: string;
  completed?: boolean;
  comments_count?: number;
  section_id?: number;
  project_id?: number;
  position?: number;
  subtasks?: BackendTask[];
  comments?: BackendComment[];
  created_at?: string;
  updated_at?: string;
}

export interface BackendSection {
  id: number;
  title?: string;
  name?: string; // Backend uses 'name' field
  project_id: number;
  position?: number;
  tasks?: BackendTask[];
  created_at?: string;
  updated_at?: string;
}

export interface BackendComment {
  id: number;
  message: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  constructor(private httpService: HttpService) {}

  /**
   * Convert backend task to frontend task
   */
  private mapBackendTaskToTask(backendTask: BackendTask): Task {
    const comments: TaskComment[] = (backendTask.comments || []).map(comment => ({
      id: comment.id.toString(),
      author: comment.user?.full_name || 'Unknown',
      message: comment.message,
      createdAt: comment.created_at,
      avatar: comment.user?.avatar_url
    }));

    // Handle subtasks - check both subtasks array, childTasks, and parent_id
    let subtasks: Task[] = [];
    if (backendTask.subtasks && Array.isArray(backendTask.subtasks)) {
      subtasks = backendTask.subtasks.map(subtask => this.mapBackendTaskToTask(subtask));
    } else if ((backendTask as any).childTasks && Array.isArray((backendTask as any).childTasks)) {
      // Subtasks stored as tasks with parent_id
      subtasks = (backendTask as any).childTasks.map((subtask: BackendTask) => this.mapBackendTaskToTask(subtask));
    }

    return {
      id: backendTask.id.toString(),
      name: backendTask.title,
      assignee: backendTask.assignee?.full_name,
      assigneeAvatar: backendTask.assignee?.initials,
      startDate: backendTask.start_date,
      dueDate: backendTask.due_date,
      position: backendTask.position ? parseFloat(backendTask.position.toString()) : undefined,
      // New: Use IDs and objects from backend
      priority_label_id: backendTask.priority_label_id ?? null,
      task_status_id: backendTask.task_status_id ?? null,
      priorityLabel: backendTask.priorityLabel,
      taskStatus: backendTask.taskStatus,
      // Legacy: Map from objects for backward compatibility
      priority: backendTask.priorityLabel?.name || (backendTask.priority as any) || 'Medium',
      status: backendTask.taskStatus?.name || (backendTask.status as any) || 'To Do',
      description: backendTask.description,
      commentsCount: backendTask.comments_count || comments.length,
      completed: backendTask.completed || false,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      comments: comments.length > 0 ? comments : undefined
    };
  }

  /**
   * Convert frontend task to backend task
   */
  private mapTaskToBackendTask(task: Partial<Task>, projectId: string, sectionId?: string, assigneeId?: number): any {
    const payload: any = {};
    
    // Only include fields that are explicitly provided (not undefined)
    if (task.name !== undefined && task.name !== null) payload.title = task.name;
    if (task.description !== undefined) payload.description = task.description; // Allow empty string
    if (task.startDate !== undefined) {
      // Allow null to unset start date
      payload.start_date = task.startDate === null || task.startDate === '' ? null : task.startDate;
    }
    if (task.dueDate !== undefined) {
      // Allow null to unset due date
      payload.due_date = task.dueDate === null || task.dueDate === '' ? null : task.dueDate;
    }
    
    // New: Use IDs instead of string values
    // Only include if explicitly provided (undefined means don't update this field)
    if (task.priority_label_id !== undefined) {
      // Allow null to unset, preserve 0 as a valid ID
      if (task.priority_label_id === null) {
        payload.priority_label_id = null;
      } else {
        const parsed = typeof task.priority_label_id === 'string' 
          ? parseInt(task.priority_label_id) 
          : task.priority_label_id;
        payload.priority_label_id = isNaN(parsed) ? null : parsed;
      }
    }
    if (task.task_status_id !== undefined) {
      // Allow null to unset, preserve 0 as a valid ID
      if (task.task_status_id === null) {
        payload.task_status_id = null;
      } else {
        const parsed = typeof task.task_status_id === 'string' 
          ? parseInt(task.task_status_id) 
          : task.task_status_id;
        payload.task_status_id = isNaN(parsed) ? null : parsed;
      }
    }
    
    // Legacy: Support old priority/status strings for backward compatibility
    // (These will be ignored if priority_label_id/task_status_id are provided)
    if (task.priority !== undefined && task.priority !== null && task.priority_label_id === undefined) {
      payload.priority = task.priority;
    }
    if (task.status !== undefined && task.status !== null && task.task_status_id === undefined) {
      payload.status = task.status;
    }
    
    if (task.completed !== undefined) payload.completed = task.completed;
    if (sectionId) payload.section_id = parseInt(sectionId);
    if (projectId) payload.project_id = parseInt(projectId);
    // Allow null to unset assignee
    if (assigneeId !== undefined) {
      payload.assigned_to = assigneeId === null || assigneeId === 0 ? null : assigneeId;
    }
    
    return payload;
  }

  /**
   * Get sections with tasks for a project
   */
  getSectionsByProject(projectId: string): Observable<TaskSection[]> {
    const url = ENDPOINTS.getSectionsByProject;
    return this.httpService.post(url, { project_id: parseInt(projectId) }).pipe(
      map((response: any) => {
        // Handle unified response format: { success: true, data: { sections: [...] } }
        let sections: BackendSection[] = [];
        
        if (response.success && response.data && response.data.sections) {
          sections = response.data.sections;
        } else if (Array.isArray(response)) {
          // Fallback for direct array response
          sections = response;
        } else if (response.data && Array.isArray(response.data)) {
          sections = response.data;
        }

        return sections.map((section: BackendSection) => {
          // Sort tasks by position to ensure correct ordering
          const tasks = (section.tasks || [])
            .map((task: BackendTask) => this.mapBackendTaskToTask(task))
            .sort((a, b) => {
              // Sort by position (ascending), with fallback for tasks without position
              const posA = a.position ?? 0;
              const posB = b.position ?? 0;
              return posA - posB;
            });
          
          return {
            id: section.id.toString(),
            title: (section as any).title || (section as any).name || 'Untitled Section',
            expanded: true,
            tasks: tasks
          };
        });
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get task by ID
   */
  getTaskById(taskId: string): Observable<Task> {
    // Use POST with body to support the new route structure
    const url = ENDPOINTS.getTaskById.replace(':taskId', taskId);
    // Try GET first, fallback to POST if needed
    return this.httpService.get(url).pipe(
      map((response: any) => {
        // Handle unified response format
        const task = response.success && response.data?.task ? response.data.task : response;
        return this.mapBackendTaskToTask(task);
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Create a new section
   */
  createSection(projectId: string, title: string, position?: number): Observable<TaskSection> {
    return this.httpService.post(ENDPOINTS.createSection, {
      project_id: parseInt(projectId),
      name: title, // Backend uses 'name' field
      position: position || 0
    }).pipe(
      map((response: any) => {
        // Handle unified response format
        const section = response.success && response.data?.section ? response.data.section : response;
        return {
          id: section.id.toString(),
          title: section.name || section.title || title,
          expanded: true,
          tasks: []
        };
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update section title
   */
  updateSectionTitle(sectionId: string, title: string): Observable<void> {
    const url = ENDPOINTS.updateSectionTitle;
    return this.httpService.patch(url, { section_id: sectionId, name: title }).pipe( // Backend uses 'name' field
      map(() => {}),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Create a new task
   */
  createTask(projectId: string, sectionId: string, task: Partial<Task>, assigneeId?: number, parentId?: string): Observable<Task> {
    const payload = this.mapTaskToBackendTask(task, projectId, sectionId, assigneeId);
    if (parentId) {
      payload.parent_id = parseInt(parentId);
    }
    return this.httpService.post(ENDPOINTS.createTask, payload).pipe(
      map((response: any) => {
        // Handle unified response format
        const backendTask = response.success && response.data?.task ? response.data.task : response;
        return this.mapBackendTaskToTask(backendTask);
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update task
   */
  updateTask(taskId: string, updates: Partial<Task>, projectId?: string, sectionId?: string, assigneeId?: number): Observable<Task> {
    const url = ENDPOINTS.updateTask; // No need to replace :taskId anymore
    const payload = this.mapTaskToBackendTask(updates, projectId || '', sectionId, assigneeId);
    // Add task_id to body
    payload.task_id = parseInt(taskId);
    
    return this.httpService.put(url, payload).pipe(
      map((response: any) => {
        // Handle unified response format
        const backendTask = response.success && response.data?.task ? response.data.task : response;
        return this.mapBackendTaskToTask(backendTask);
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Delete task
   */
  deleteTask(taskId: string): Observable<void> {
    // Use DELETE with taskId in URL, but controller supports body too
    const url = ENDPOINTS.deleteTask.replace(':taskId', taskId);
    return this.httpService.delete(url).pipe(
      map(() => {}),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Toggle task completion
   */
  toggleTaskCompletion(taskId: string): Observable<Task> {
    const url = ENDPOINTS.toggleTaskCompletion.replace(':taskId', taskId);
    return this.httpService.patch(url, {}).pipe(
      map((response: any) => {
        // Handle unified response format
        const backendTask = response.success && response.data?.task ? response.data.task : response;
        return this.mapBackendTaskToTask(backendTask);
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Create a task comment
   */
  createTaskComment(taskId: string, message: string): Observable<TaskComment> {
    return this.httpService.post(ENDPOINTS.createTaskComment, {
      task_id: parseInt(taskId),
      message
    }).pipe(
      map((response: any) => {
        const comment = response.data?.comment || response;
        return {
          id: comment.id.toString(),
          author: comment.user?.full_name || 'Unknown',
          message: comment.message,
          createdAt: comment.created_at,
          avatar: comment.user?.avatar_url
        };
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get task comments
   */
  getTaskComments(taskId: string): Observable<TaskComment[]> {
    const url = ENDPOINTS.getTaskComments.replace(':taskId', taskId);
    return this.httpService.get(url).pipe(
      map((response: any) => {
        const comments = response.data?.comments || response || [];
        return comments.map((comment: BackendComment) => ({
          id: comment.id.toString(),
          author: comment.user?.full_name || 'Unknown',
          message: comment.message,
          createdAt: comment.created_at,
          avatar: comment.user?.avatar_url
        }));
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Delete task comment
   */
  deleteTaskComment(commentId: string): Observable<void> {
    const url = ENDPOINTS.deleteTaskComment.replace(':commentId', commentId);
    return this.httpService.delete(url).pipe(
      map(() => {}),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Reorder tasks within a section (for drag-and-drop within same section)
   */
  reorderTasksInSection(sectionId: string, taskPositions: Array<{ task_id: string; position: number }>): Observable<any> {
    return this.httpService.post(ENDPOINTS.reorderTasksInSection, {
      section_id: parseInt(sectionId),
      task_positions: taskPositions.map(tp => ({
        task_id: parseInt(tp.task_id),
        position: tp.position
      }))
    }).pipe(
      map((response: any) => {
        return response.success && response.data ? response.data : response;
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Move task to a different section (for drag-and-drop between sections)
   */
  moveTaskToSection(taskId: string, newSectionId: string, position: number): Observable<Task> {
    return this.httpService.post(ENDPOINTS.moveTaskToSection, {
      task_id: parseInt(taskId),
      new_section_id: parseInt(newSectionId),
      position: position
    }).pipe(
      map((response: any) => {
        const task = response.success && response.data?.task ? response.data.task : response;
        return this.mapBackendTaskToTask(task);
      }),
      catchError((error) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Move task with before/after task support (Asana-style drag & drop)
   */
  moveTask(taskId: string, options: { taskId?: string; sectionId?: string; beforeTaskId?: string; afterTaskId?: string }): Observable<Task> {
    const url = ENDPOINTS.moveTask;
    // Build request body, only including defined values
    const body: any = {};
    
    // Always include taskId from options if provided, otherwise use the taskId parameter
    const taskIdToUse = options.taskId || taskId;
    if (taskIdToUse) {
      const taskIdNum = parseInt(String(taskIdToUse));
      if (!isNaN(taskIdNum)) {
        body.taskId = taskIdNum;
      }
    }
    
    // ALWAYS include sectionId - this is the target section where the task is being moved to
    // Example: task is in section 3, moved to section 2, then sectionId = 2
    if (options.sectionId !== undefined && options.sectionId !== null && options.sectionId !== '') {
      const sectionIdNum = parseInt(String(options.sectionId));
      if (!isNaN(sectionIdNum)) {
        body.sectionId = sectionIdNum;
      }
    }
    
    // Check and add beforeTaskId (optional, for positioning)
    if (options.beforeTaskId !== undefined && options.beforeTaskId !== null && options.beforeTaskId !== '') {
      const beforeTaskIdNum = parseInt(String(options.beforeTaskId));
      if (!isNaN(beforeTaskIdNum)) {
        body.beforeTaskId = beforeTaskIdNum;
      }
    }
    
    // Check and add afterTaskId (optional, for positioning)
    if (options.afterTaskId !== undefined && options.afterTaskId !== null && options.afterTaskId !== '') {
      const afterTaskIdNum = parseInt(String(options.afterTaskId));
      if (!isNaN(afterTaskIdNum)) {
        body.afterTaskId = afterTaskIdNum;
      }
    }
    
    // Debug: Log the request body
    console.log('moveTask API call:', {
      url,
      taskId,
      options,
      body,
      bodyKeys: Object.keys(body),
      bodyLength: Object.keys(body).length
    });
    
    // Ensure body is not empty - we always need taskId and sectionId
    // sectionId is the target section where the task is being moved to
    if (!body.taskId || !body.sectionId) {
      console.error('moveTask: Request body is missing required fields!', { 
        taskId, 
        options,
        body,
        hasTaskId: !!body.taskId,
        hasSectionId: !!body.sectionId,
        sectionIdValue: options.sectionId
      });
      return throwError(() => new Error('Cannot move task: taskId and sectionId (target section) are required.'));
    }
    
    return this.httpService.patch(url, body).pipe(
      map((response: any) => {
        const task = response.success && response.data?.task ? response.data.task : response;
        return this.mapBackendTaskToTask(task);
      }),
      catchError((error) => {
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

