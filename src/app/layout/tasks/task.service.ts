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
   * Load my tasks from API (all tasks assigned to current user)
   * Groups tasks by project and section for display
   */
  loadMyTasks(): Observable<TaskSection[]> {
    const myTasksKey = '__my_tasks__';
    const loadingSubject = this.getLoadingSubject(myTasksKey);
    loadingSubject.next(true);

    return this.taskApiService.getMyTasks().pipe(
      map(tasks => {
        // Group tasks by project, then by section
        const projectMap = new Map<string, Map<string, Task[]>>();
        
        tasks.forEach(task => {
          // Extract project and section info from preserved backend data
          const backendTask = (task as any)._backend;
          if (!backendTask) {
            // Fallback if backend data not preserved
            return;
          }
          
          const projectId = backendTask.project?.id?.toString() || backendTask.project_id?.toString() || 'uncategorized';
          const sectionId = backendTask.section?.id?.toString() || backendTask.section_id?.toString() || 'uncategorized';
          
          if (!projectMap.has(projectId)) {
            projectMap.set(projectId, new Map());
          }
          
          const sectionMap = projectMap.get(projectId)!;
          if (!sectionMap.has(sectionId)) {
            sectionMap.set(sectionId, []);
          }
          
          // Remove _backend before adding to section
          const { _backend, ...cleanTask } = task as any;
          sectionMap.get(sectionId)!.push(cleanTask as Task);
        });

        // Convert to TaskSection array, grouping by project first
        const sections: TaskSection[] = [];
        projectMap.forEach((sectionMap, projectId) => {
          // Find project name from first task in project
          const firstTask = Array.from(sectionMap.values())[0]?.[0];
          const backendTask = firstTask ? (tasks.find(t => (t as any)._backend?.project?.id?.toString() === projectId) as any)?._backend : null;
          const projectName = backendTask?.project?.name || 'Uncategorized Project';
          
          sectionMap.forEach((taskList, sectionId) => {
            // Find section name from first task in section
            const backendTask = (tasks.find(t => {
              const bt = (t as any)._backend;
              return bt && (bt.section?.id?.toString() || bt.section_id?.toString()) === sectionId;
            }) as any)?._backend;
            const sectionName = backendTask?.section?.name || backendTask?.section?.title || 'Uncategorized';
            
            sections.push({
              id: `${projectId}_${sectionId}`,
              title: `${projectName} - ${sectionName}`,
              expanded: true,
              tasks: taskList
            });
          });
        });

        // Sort sections by project name, then section name
        sections.sort((a, b) => a.title.localeCompare(b.title));

        // If no sections, create a default one
        if (sections.length === 0) {
          sections.push({
            id: 'my-tasks-default',
            title: 'My Tasks',
            expanded: true,
            tasks: []
          });
        }

        const subject = this.getProjectSubject(myTasksKey);
        subject.next(sections);
        loadingSubject.next(false);
        return sections;
      }),
      catchError(error => {
        console.error('Error loading my tasks:', error);
        this.snackBarService.showError('Failed to load my tasks');
        loadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Filter my tasks by search query
   */
  filterMyTasks(query: string): Observable<TaskSection[]> {
    const myTasksKey = '__my_tasks__';
    const normalized = query.trim().toLowerCase();
    const sections$ = this.getProjectSubject(myTasksKey).asObservable();

    if (!normalized) {
      // If no query, ensure data is loaded
      if (!this.projectSections.has(myTasksKey) || this.getProjectSubject(myTasksKey).value.length === 0) {
        this.loadMyTasks().subscribe();
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
   * Reorder tasks within a section (for drag-and-drop within same section)
   */
  reorderTasksInSection(sectionId: string, taskPositions: Array<{ task_id: string; position: number }>): Observable<any> {
    return this.taskApiService.reorderTasksInSection(sectionId, taskPositions).pipe(
      tap(() => {
        // Reload sections to get updated positions
        // Find which project this section belongs to
        for (const [projectId, subject] of this.projectSections.entries()) {
          const section = subject.value.find(s => s.id === sectionId);
          if (section) {
            this.loadSections(projectId).subscribe();
            break;
          }
        }
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to reorder tasks');
        return throwError(() => error);
      })
    );
  }

  /**
   * Move task to a different section (for drag-and-drop between sections)
   */
  moveTaskToSection(taskId: string, newSectionId: string, position: number): Observable<Task> {
    return this.taskApiService.moveTaskToSection(taskId, newSectionId, position).pipe(
      tap((updatedTask) => {
        // Reload sections to get updated data
        // Find which project this section belongs to
        for (const [projectId, subject] of this.projectSections.entries()) {
          const section = subject.value.find(s => s.id === newSectionId);
          if (section) {
            this.loadSections(projectId).subscribe();
            break;
          }
        }
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to move task');
        return throwError(() => error);
      })
    );
  }

  /**
   * Move task with before/after task support (Asana-style drag & drop)
   * @param taskId - The task ID to move
   * @param options - Move options including sectionId (target section), beforeTaskId, afterTaskId
   */
  moveTask(taskId: string, options: { taskId?: string; sectionId?: string; beforeTaskId?: string; afterTaskId?: string }): Observable<Task> {
    return this.taskApiService.moveTask(taskId, options).pipe(
      tap((updatedTask) => {
        // Reload sections to get updated data
        // Find which project this task belongs to
        for (const [projectId] of this.projectSections.entries()) {
          this.loadSections(projectId).subscribe();
          break;
        }
      }),
      catchError((error) => {
        this.snackBarService.showError('Failed to move task');
        return throwError(() => error);
      })
    );
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
