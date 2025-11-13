import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, TaskSection } from './task.model';

type ProjectSectionsDictionary = Record<string, TaskSection[]>;

const PROJECT_SECTION_TEMPLATES: ProjectSectionsDictionary = {
  '1': [
    {
      id: 'section-1',
      title: 'Client Query',
      expanded: true,
      tasks: [
        {
          id: 't1',
          name: 'Design Login Page',
          assignee: 'John Doe',
          dueDate: '2025-11-12',
          priority: 'High',
          status: 'In Progress',
          description: 'Finalize responsive login screens and states.',
          completed: false,
          subtasks: [
            { id: 't1-1', name: 'Audit existing flows', completed: true, status: 'Done' },
            { id: 't1-2', name: 'Create responsive wireframes', completed: false, status: 'In Progress' },
            { id: 't1-3', name: 'Review with stakeholders', completed: false, status: 'To Do' }
          ],
          comments: [
            {
              id: 't1-c1',
              author: 'Sarah Johnson',
              message: 'Please incorporate the new password strength helper.',
              createdAt: '2025-10-28T09:45:00Z'
            },
            {
              id: 't1-c2',
              author: 'John Doe',
              message: 'Working on responsive tweaks for mobile review.',
              createdAt: '2025-10-30T14:20:00Z'
            }
          ],
          commentsCount: 2
        },
        {
          id: 't2',
          name: 'Set up Database Backups',
          assignee: 'Priya Patel',
          dueDate: '2025-11-05',
          priority: 'Medium',
          status: 'To Do',
          completed: false,
          subtasks: [
            { id: 't2-1', name: 'Provision backup storage', completed: true, status: 'Done' },
            { id: 't2-2', name: 'Configure nightly snapshot', completed: false, status: 'To Do' }
          ],
          comments: [
            {
              id: 't2-c1',
              author: 'Priya Patel',
              message: 'Waiting on infra credentials from DevOps.',
              createdAt: '2025-10-27T11:10:00Z'
            }
          ],
          commentsCount: 1
        }
      ]
    },
    {
      id: 'section-2',
      title: 'UI Loading',
      expanded: true,
      tasks: [
        {
          id: 't3',
          name: 'Customer Interviews',
          assignee: 'Lucas Nguyen',
          dueDate: '2025-12-01',
          priority: 'Low',
          status: 'Done',
          completed: true,
          subtasks: [
            { id: 't3-1', name: 'Recruit participants', completed: true, status: 'Done' },
            { id: 't3-2', name: 'Synthesize findings', completed: true, status: 'Done' }
          ],
          comments: [],
          commentsCount: 0
        },
        {
          id: 't4',
          name: 'Build Analytics Dashboard',
          assignee: 'Sarah Johnson',
          dueDate: '2025-11-25',
          priority: 'High',
          status: 'In Progress',
          completed: false,
          subtasks: [
            { id: 't4-1', name: 'Define core metrics', completed: true, status: 'Done' },
            { id: 't4-2', name: 'Design KPI widgets', completed: false, status: 'In Progress' },
            { id: 't4-3', name: 'Implement drill-down view', completed: false, status: 'To Do' }
          ],
          comments: [
            {
              id: 't4-c1',
              author: 'Lucas Nguyen',
              message: 'Need confirmation on the funnel conversion metric.',
              createdAt: '2025-10-31T16:05:00Z'
            },
            {
              id: 't4-c2',
              author: 'Sarah Johnson',
              message: 'Will push first iteration to staging tomorrow.',
              createdAt: '2025-11-01T09:15:00Z'
            },
            {
              id: 't4-c3',
              author: 'Priya Patel',
              message: 'Data source connection validated ✅',
              createdAt: '2025-11-02T12:40:00Z'
            }
          ],
          commentsCount: 3
        }
      ]
    },
    {
      id: 'section-3',
      title: 'Client Issues (6th August 2024)',
      expanded: true,
      tasks: [
        {
          id: 't5',
          name: 'Update API Documentation',
          assignee: 'Michael Chen',
          dueDate: '2025-11-18',
          priority: 'Medium',
          status: 'To Do',
          commentsCount: 1,
          completed: false
        },
        {
          id: 't6',
          name: 'Implement Feature Flags',
          assignee: 'Aisha Khan',
          dueDate: '2025-11-22',
          priority: 'High',
          status: 'In Progress',
          commentsCount: 6,
          completed: false
        },
        {
          id: 't7',
          name: 'QA Regression Suite',
          assignee: 'Emily Rodriguez',
          dueDate: '2025-11-15',
          priority: 'Medium',
          status: 'To Do',
          commentsCount: 4,
          completed: false
        },
        {
          id: 't8',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't9',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't10',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't11',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't12',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't13',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        } 
      ]
    },
    {
      id: 'section-3',
      title: 'Client Issues (6th August 2024)',
      expanded: true,
      tasks: [
        {
          id: 't5',
          name: 'Update API Documentation',
          assignee: 'Michael Chen',
          dueDate: '2025-11-18',
          priority: 'Medium',
          status: 'To Do',
          commentsCount: 1,
          completed: false
        },
        {
          id: 't6',
          name: 'Implement Feature Flags',
          assignee: 'Aisha Khan',
          dueDate: '2025-11-22',
          priority: 'High',
          status: 'In Progress',
          commentsCount: 6,
          completed: false
        },
        {
          id: 't7',
          name: 'QA Regression Suite',
          assignee: 'Emily Rodriguez',
          dueDate: '2025-11-15',
          priority: 'Medium',
          status: 'To Do',
          commentsCount: 4,
          completed: false
        },
        {
          id: 't8',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't9',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't10',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't11',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't12',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        },
        {
          id: 't13',
          name: 'Marketing Launch Plan',
          assignee: 'Oliver Brown',
          dueDate: '2025-11-30',
          priority: 'High',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        } 
      ]
    }
  ],
  '2': [
    {
      id: 'p2-section-1',
      title: 'Sprint Backlog',
      expanded: true,
      tasks: [
        {
          id: 'p2-t1',
          name: 'Finalize API contracts',
          assignee: 'Jacob Rivera',
          dueDate: '2025-11-07',
          priority: 'High',
          status: 'In Progress',
          commentsCount: 3,
          completed: false
        },
        {
          id: 'p2-t2',
          name: 'Implement session persistence',
          assignee: 'Mina Clarke',
          dueDate: '2025-11-15',
          priority: 'Medium',
          status: 'To Do',
          commentsCount: 1,
          completed: false
        },
        {
          id: 'p2-t3',
          name: 'QA automation smoke suite',
          assignee: 'Deepak Rao',
          dueDate: '2025-11-19',
          priority: 'High',
          status: 'To Do',
          commentsCount: 4,
          completed: false
        }
      ]
    },
    {
      id: 'p2-section-2',
      title: 'Release Prep',
      expanded: true,
      tasks: [
        {
          id: 'p2-t4',
          name: 'Create launch checklist',
          assignee: 'Ana Gomez',
          dueDate: '2025-11-20',
          priority: 'Medium',
          status: 'In Progress',
          commentsCount: 2,
          completed: false
        },
        {
          id: 'p2-t5',
          name: 'Coordinate beta feedback session',
          assignee: 'Leo Park',
          dueDate: '2025-11-12',
          priority: 'Low',
          status: 'Done',
          commentsCount: 6,
          completed: true
        }
      ]
    }
  ],
  '3': [
    {
      id: 'p3-section-1',
      title: 'Experiment Queue',
      expanded: true,
      tasks: [
        {
          id: 'p3-t1',
          name: 'Homepage hero test',
          assignee: 'Sophie Turner',
          dueDate: '2025-11-09',
          priority: 'High',
          status: 'In Progress',
          commentsCount: 8,
          completed: false
        },
        {
          id: 'p3-t2',
          name: 'Pricing page copy variation',
          assignee: 'Marcus Lee',
          dueDate: '2025-11-14',
          priority: 'Medium',
          status: 'To Do',
          commentsCount: 2,
          completed: false
        }
      ]
    },
    {
      id: 'p3-section-2',
      title: 'Insights & Follow-up',
      expanded: false,
      tasks: [
        {
          id: 'p3-t3',
          name: 'Summarize Q4 growth insights',
          assignee: 'Irene Adler',
          dueDate: '2025-11-22',
          priority: 'High',
          status: 'To Do',
          commentsCount: 0,
          completed: false
        },
        {
          id: 'p3-t4',
          name: 'Plan next experiment batch',
          assignee: 'Nikhil Sharma',
          dueDate: '2025-11-27',
          priority: 'Medium',
          status: 'To Do',
          commentsCount: 1,
          completed: false
        }
      ]
    }
  ],
  '4': [
    {
      id: 'p4-section-1',
      title: 'Customer Success Ops',
      expanded: true,
      tasks: [
        {
          id: 'p4-t1',
          name: 'Implement onboarding checklist',
          assignee: 'Harper Mills',
          dueDate: '2025-11-08',
          priority: 'High',
          status: 'In Progress',
          commentsCount: 5,
          completed: false
        },
        {
          id: 'p4-t2',
          name: 'Draft QBR templates',
          assignee: 'Zara Ali',
          dueDate: '2025-11-16',
          priority: 'Medium',
          status: 'To Do',
          commentsCount: 3,
          completed: false
        },
        {
          id: 'p4-t3',
          name: 'Escalated issue review',
          assignee: 'Kenzo Tanaka',
          dueDate: '2025-11-06',
          priority: 'High',
          status: 'Done',
          commentsCount: 7,
          completed: true
        }
      ]
    },
    {
      id: 'p4-section-2',
      title: 'Playbooks',
      expanded: false,
      tasks: [
        {
          id: 'p4-t4',
          name: 'Update health score rubric',
          assignee: 'Ruth Okafor',
          dueDate: '2025-11-18',
          priority: 'Low',
          status: 'In Progress',
          commentsCount: 1,
          completed: false
        }
      ]
    }
  ]
};

const EMPTY_TEMPLATE: TaskSection[] = [
  {
    id: 'default-section',
    title: 'General',
    expanded: true,
    tasks: []
  }
];

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly projectSections = new Map<string, BehaviorSubject<TaskSection[]>>();

  constructor() {
    Object.entries(PROJECT_SECTION_TEMPLATES).forEach(([projectId, sections]) => {
      this.projectSections.set(projectId, new BehaviorSubject<TaskSection[]>(this.cloneSections(sections)));
    });
  }

  getSections(projectId: string): Observable<TaskSection[]> {
    return this.getProjectSubject(projectId).asObservable();
  }

  toggleSection(projectId: string, sectionId: string): void {
    const subject = this.getProjectSubject(projectId);
    subject.next(
      subject.value.map(section =>
        section.id === sectionId ? { ...section, expanded: !section.expanded } : section
      )
    );
  }

  updateTask(projectId: string, sectionId: string, taskId: string, changes: Partial<Task>): void {
    const subject = this.getProjectSubject(projectId);
    subject.next(
      subject.value.map(section => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          tasks: section.tasks.map(task =>
            task.id === taskId
              ? this.applyTaskChanges(task, changes)
              : task
          )
        };
      })
    );
  }

  addTask(projectId: string, sectionId: string, task: Task): void {
    const subject = this.getProjectSubject(projectId);
    subject.next(
      subject.value.map(section =>
        section.id === sectionId
          ? { ...section, tasks: [...section.tasks, this.cloneTask(task)] }
          : section
      )
    );
  }

  deleteTask(projectId: string, sectionId: string, taskId: string): void {
    const subject = this.getProjectSubject(projectId);
    subject.next(
      subject.value.map(section =>
        section.id === sectionId
          ? { ...section, tasks: section.tasks.filter(task => task.id !== taskId) }
          : section
      )
    );
  }

  filterTasks(projectId: string, query: string): Observable<TaskSection[]> {
    const normalized = query.trim().toLowerCase();
    const sections$ = this.getProjectSubject(projectId).asObservable();

    if (!normalized) {
      return sections$;
    }

    return sections$.pipe(
      map(sections =>
        sections.map(section => ({
          ...section,
          tasks: section.tasks.filter(task =>
            task.name.toLowerCase().includes(normalized) ||
            (task.assignee ?? '').toLowerCase().includes(normalized)
          )
        }))
      )
    );
  }

  private getProjectSubject(projectId: string): BehaviorSubject<TaskSection[]> {
    let subject = this.projectSections.get(projectId);
    if (!subject) {
      subject = new BehaviorSubject<TaskSection[]>(this.cloneSections(PROJECT_SECTION_TEMPLATES[projectId] ?? EMPTY_TEMPLATE));
      this.projectSections.set(projectId, subject);
    }
    return subject;
  }

  private cloneSections(sections: TaskSection[]): TaskSection[] {
    return sections.map(section => ({
      ...section,
      tasks: section.tasks.map(task => this.cloneTask(task))
    }));
  }

  private cloneTask(task: Task, parentId?: string): Task {
    const subtasks = task.subtasks?.map(subtask => this.cloneTask(subtask, task.id)) ?? [];
    const comments = task.comments?.map(comment => ({ ...comment })) ?? [];

    return {
      ...task,
      parentId: parentId ?? task.parentId ?? undefined,
      subtasks,
      comments,
      commentsCount: comments.length || task.commentsCount || 0
    };
  }

  private applyTaskChanges(task: Task, changes: Partial<Task>): Task {
    const next: Task = {
      ...task,
      ...changes
    };

    if (changes.subtasks) {
      next.subtasks = changes.subtasks.map(subtask => this.cloneTask(subtask, next.id));
    }

    if (changes.comments) {
      next.comments = changes.comments.map(comment => ({ ...comment }));
      next.commentsCount = next.comments.length;
    }

    if (changes.dueDate !== undefined) {
      next.dueDate = changes.dueDate;
    }

    if (changes.assignee !== undefined) {
      next.assignee = changes.assignee;
    }

    next.parentId = next.parentId ?? task.parentId ?? undefined;

    return next;
  }

  updateSubtask(projectId: string, sectionId: string, parentTaskId: string, subtaskId: string, changes: Partial<Task>): void {
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
                ? this.applyTaskChanges(subtask, { ...changes, parentId: parentTaskId })
                : subtask
            );

            return this.applyTaskChanges(task, { subtasks: nextSubtasks });
          })
        };
      })
    );
  }
}
