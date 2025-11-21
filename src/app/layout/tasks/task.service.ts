import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of, throwError } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Task, TaskSection, TaskComment } from './task.model';
import { TaskApiService } from './services/task-api.service';
import { MemberService } from '../members/service/member.service';
import { SnackBarService } from 'src/app/shared/services/snackbar.service';

type ProjectSectionsDictionary = Record<string, BehaviorSubject<TaskSection[]>>;

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly projectSections = new Map<string, BehaviorSubject<TaskSection[]>>();
  private readonly loadingStates = new Map<string, BehaviorSubject<boolean>>();

  constructor(
    private taskApiService: TaskApiService,
    private memberService: MemberService,
    private snackBarService: SnackBarService
  ) {}

  /**
   * Get sections for a project (with API integration)
   */
  getSections(projectId: string): Observable<TaskSection[]> {
    return this.getProjectSubject(projectId).asObservable();
  }

  /**
   * Load sections from API
   */
  loadSections(projectId: string): Observable<TaskSection[]> {
    const loadingSubject = this.getLoadingSubject(projectId);
    loadingSubject.next(true);

    return this.taskApiService.getSectionsByProject(projectId).pipe(
      tap(sections => {
        const subject = this.getProjectSubject(projectId);
        subject.next(sections);
        loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error loading sections:', error);
        this.snackBarService.showError('Failed to load tasks');
        loadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Filter tasks by search query
   */
  filterTasks(projectId: string, query: string): Observable<TaskSection[]> {
    const normalized = query.trim().toLowerCase();
    const sections$ = this.getProjectSubject(projectId).asObservable();

    if (!normalized) {
      // If no query, ensure data is loaded
      if (!this.projectSections.has(projectId) || this.getProjectSubject(projectId).value.length === 0) {
        this.loadSections(projectId).subscribe();
      }
      return sections$;
    }

    return sections$.pipe(
      map(sections =>
        sections.map(section => ({
          ...section,
          tasks: section.tasks.filter(task =>
            task.name.toLowerCase().includes(normalized) ||
            (task.assignee ?? '').toLowerCase().includes(normalized) ||
            (task.description ?? '').toLowerCase().includes(normalized)
          )
        }))
      )
    );
  }

  /**
   * Toggle section expanded state
   */
  toggleSection(projectId: string, sectionId: string): void {
    const subject = this.getProjectSubject(projectId);
    subject.next(
      subject.value.map(section =>
        section.id === sectionId ? { ...section, expanded: !section.expanded } : section
      )
    );
  }

  /**
   * Update section title
   */
  updateSectionTitle(projectId: string, sectionId: string, title: string): void {
    // Optimistic update
    const subject = this.getProjectSubject(projectId);
    subject.next(
      subject.value.map(section =>
        section.id === sectionId ? { ...section, title } : section
      )
    );

    // API call
    this.taskApiService.updateSectionTitle(sectionId, title).subscribe({
      next: () => {
        // Reload to get fresh data
        this.loadSections(projectId).subscribe();
      },
      error: (error) => {
        console.error('Error updating section title:', error);
        this.snackBarService.showError('Failed to update section title');
        // Revert optimistic update
        this.loadSections(projectId).subscribe();
      }
    });
  }

  /**
   * Update task
   */
  updateTask(projectId: string, sectionId: string, taskId: string, changes: Partial<Task>, assigneeId?: number): Observable<Task> {
    // Optimistic update
    const subject = this.getProjectSubject(projectId);
    const currentSections = subject.value;
    const currentTask = currentSections
      .find(s => s.id === sectionId)
      ?.tasks.find(t => t.id === taskId);
    
    subject.next(
      currentSections.map(section => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          tasks: section.tasks.map(task => {
            if (task.id !== taskId) {
              return task;
            }
            // Preserve taskStatus and priorityLabel objects if they exist and aren't being changed
            const updatedTask = {
              ...task,
              ...changes,
              // Preserve objects unless they're being explicitly updated
              taskStatus: changes.task_status_id !== undefined 
                ? undefined // Will be set from API response
                : task.taskStatus,
              priorityLabel: changes.priority_label_id !== undefined
                ? undefined // Will be set from API response
                : task.priorityLabel,
            };
            return updatedTask;
          })
        };
      })
    );

    // API call - return Observable so caller can handle the response
    return this.taskApiService.updateTask(taskId, changes, projectId, sectionId, assigneeId).pipe(
      tap((updatedTask) => {
        // Update with server response
        const currentSections = subject.value;
        subject.next(
          currentSections.map(section => {
            if (section.id !== sectionId) {
              return section;
            }
            return {
              ...section,
              tasks: section.tasks.map(task =>
                task.id === taskId ? updatedTask : task
              )
            };
          })
        );
      }),
      catchError((error) => {
        console.error('Error updating task:', error);
        this.snackBarService.showError('Failed to update task');
        // Revert optimistic update
        this.loadSections(projectId).subscribe();
        return throwError(() => error);
      })
    );
  }

  /**
   * Create task comment
   */
  createTaskComment(taskId: string, message: string): Observable<TaskComment> {
    return this.taskApiService.createTaskComment(taskId, message).pipe(
      tap(() => {
        // Reload sections to get updated comment count
        // Find which project this task belongs to
        for (const [projectId, subject] of this.projectSections.entries()) {
          const section = subject.value.find(s => 
            s.tasks.some(t => t.id === taskId)
          );
          if (section) {
            this.loadSections(projectId).subscribe();
            break;
          }
        }
      })
    );
  }

  /**
   * Get task comments
   */
  getTaskComments(taskId: string): Observable<TaskComment[]> {
    return this.taskApiService.getTaskComments(taskId);
  }

  /**
   * Delete task comment
   */
  deleteTaskComment(commentId: string, taskId: string): Observable<void> {
    return this.taskApiService.deleteTaskComment(commentId).pipe(
      tap(() => {
        // Reload sections to get updated comment count
        for (const [projectId, subject] of this.projectSections.entries()) {
          const section = subject.value.find(s => 
            s.tasks.some(t => t.id === taskId)
          );
          if (section) {
            this.loadSections(projectId).subscribe();
            break;
          }
        }
      })
    );
  }

  /**
   * Add task
   */
  addTask(projectId: string, sectionId: string, task: Task, parentId?: string): void {
    // Optimistic update
    const subject = this.getProjectSubject(projectId);
    
    if (parentId) {
      // Adding subtask - find parent task and add to its subtasks
      subject.next(
        subject.value.map(section => {
          if (section.id !== sectionId) {
            return section;
          }
          return {
            ...section,
            tasks: section.tasks.map(t => {
              if (t.id === parentId) {
                return {
                  ...t,
                  subtasks: [...(t.subtasks || []), task]
                };
              }
              return t;
            })
          };
        })
      );
    } else {
      // Adding regular task
    subject.next(
      subject.value.map(section =>
        section.id === sectionId
            ? { ...section, tasks: [...section.tasks, task] }
          : section
      )
    );
  }

    // API call
    this.taskApiService.createTask(projectId, sectionId, task, undefined, parentId).subscribe({
      next: (createdTask) => {
        // Replace optimistic task with server response
        const currentSections = subject.value;
        if (parentId) {
          subject.next(
            currentSections.map(section => {
              if (section.id !== sectionId) {
                return section;
              }
              return {
                ...section,
                tasks: section.tasks.map(t => {
                  if (t.id === parentId) {
                    return {
                      ...t,
                      subtasks: (t.subtasks || []).map(st => st.id === task.id ? createdTask : st)
                    };
                  }
                  return t;
                })
              };
            })
          );
        } else {
          subject.next(
            currentSections.map(section => {
              if (section.id !== sectionId) {
                return section;
              }
              return {
                ...section,
                tasks: section.tasks.map(t => t.id === task.id ? createdTask : t)
              };
            })
          );
        }
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.snackBarService.showError('Failed to create task');
        // Revert optimistic update
        this.loadSections(projectId).subscribe();
      }
    });
  }

  /**
   * Delete task
   */
  deleteTask(projectId: string, sectionId: string, taskId: string): void {
    // Optimistic update
    const subject = this.getProjectSubject(projectId);
    subject.next(
      subject.value.map(section =>
        section.id === sectionId
          ? { ...section, tasks: section.tasks.filter(task => task.id !== taskId) }
          : section
      )
    );

    // API call
    this.taskApiService.deleteTask(taskId).subscribe({
      next: () => {
        // Success - optimistic update is already applied
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.snackBarService.showError('Failed to delete task');
        // Revert optimistic update
        this.loadSections(projectId).subscribe();
      }
    });
  }

  /**
   * Add section
   */
  addSection(projectId: string, title?: string): void {
    const sectionTitle = title || 'New Section';
    
    // Optimistic update
    const subject = this.getProjectSubject(projectId);
    const newSection: TaskSection = {
      id: `temp-${Date.now()}`,
      title: sectionTitle,
      tasks: [],
      expanded: true
    };
    subject.next([...subject.value, newSection]);

    // API call
    this.taskApiService.createSection(projectId, sectionTitle).subscribe({
      next: (createdSection) => {
        // Replace optimistic section with server response
        const currentSections = subject.value;
        subject.next(
          currentSections.map(section =>
            section.id === newSection.id ? createdSection : section
          )
        );
      },
      error: (error) => {
        console.error('Error creating section:', error);
        this.snackBarService.showError('Failed to create section');
        // Revert optimistic update
        this.loadSections(projectId).subscribe();
      }
    });
  }

  /**
   * Update subtask
   */
  updateSubtask(projectId: string, sectionId: string, parentTaskId: string, subtaskId: string, changes: Partial<Task>): Observable<Task> {
    // Optimistic update
    const subject = this.getProjectSubject(projectId);
    subject.next(
      subject.value.map(section => {
        if (section.id !== sectionId) {
          return section;
        }

        return {
          ...section,
          tasks: section.tasks.map(task => {
            if (task.id !== parentTaskId) {
              return task;
            }

            const nextSubtasks = (task.subtasks ?? []).map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, ...changes }
                : subtask
            );

            return { ...task, subtasks: nextSubtasks };
          })
        };
      })
    );

    // API call - subtasks are handled as regular tasks with parent_id
    return this.taskApiService.updateTask(subtaskId, changes, projectId, sectionId).pipe(
      tap((updatedSubtask) => {
        // Update with server response
        const currentSections = subject.value;
        subject.next(
          currentSections.map(section => {
            if (section.id !== sectionId) {
              return section;
            }
            return {
              ...section,
              tasks: section.tasks.map(task => {
                if (task.id !== parentTaskId) {
                  return task;
                }
                return {
                  ...task,
                  subtasks: (task.subtasks ?? []).map(subtask =>
                    subtask.id === subtaskId ? updatedSubtask : subtask
                  )
                };
              })
            };
          })
        );
      }),
      catchError((error) => {
        console.error('Error updating subtask:', error);
        this.snackBarService.showError('Failed to update subtask');
        // Revert optimistic update
        this.loadSections(projectId).subscribe();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get task by ID (for detail view)
   */
  getTaskById(taskId: string): Observable<Task> {
    return this.taskApiService.getTaskById(taskId);
  }

  /**
   * Get loading state for a project
   */
  getLoadingState(projectId: string): Observable<boolean> {
    return this.getLoadingSubject(projectId).asObservable();
  }

  private getProjectSubject(projectId: string): BehaviorSubject<TaskSection[]> {
    let subject = this.projectSections.get(projectId);
    if (!subject) {
      subject = new BehaviorSubject<TaskSection[]>([]);
      this.projectSections.set(projectId, subject);
      // Auto-load on first access
      this.loadSections(projectId).subscribe();
    }
    return subject;
  }

  private getLoadingSubject(projectId: string): BehaviorSubject<boolean> {
    let subject = this.loadingStates.get(projectId);
    if (!subject) {
      subject = new BehaviorSubject<boolean>(false);
      this.loadingStates.set(projectId, subject);
    }
    return subject;
  }
}
