import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService, Project } from '../../../layout/tasks/services/project.service';

export interface ProjectDialogData {
  project?: Project;
}

@Component({
  selector: 'app-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.scss']
})
export class ProjectDialogComponent {
  projectForm: FormGroup;
  saving = false;
  isEditMode = false;

  // Color options for projects
  colorOptions = [
    { value: '#4285F4', label: 'Blue' },
    { value: '#34A853', label: 'Green' },
    { value: '#FBBC04', label: 'Yellow' },
    { value: '#EA4335', label: 'Red' },
    { value: '#9C27B0', label: 'Purple' },
    { value: '#FF9800', label: 'Orange' },
    { value: '#00BCD4', label: 'Cyan' },
    { value: '#795548', label: 'Brown' }
  ];

  constructor(
    private readonly dialogRef: MatDialogRef<ProjectDialogComponent>,
    private readonly projectService: ProjectService,
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ProjectDialogData | null
  ) {
    const project = data?.project;
    this.isEditMode = !!project;

    this.projectForm = this.fb.group({
      name: [project?.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [project?.description || ''],
      color: [project?.color || this.colorOptions[0].value],
      status: [project?.status || 'not-started'],
      due_date: [project?.due_date || null]
    });
  }

  /**
   * Save project
   */
  save(): void {
    if (this.projectForm.invalid) {
      return;
    }

    this.saving = true;
    const formValue = this.projectForm.value;

    const projectData: Partial<Project> = {
      name: formValue.name,
      description: formValue.description || undefined,
      color: formValue.color,
      status: formValue.status,
      due_date: formValue.due_date || undefined
    };

    const operation = this.isEditMode && this.data?.project
      ? this.projectService.updateProject(this.data.project.id.toString(), projectData)
      : this.projectService.createProject(projectData);

    operation.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error saving project:', error);
        this.saving = false;
      }
    });
  }

  /**
   * Cancel dialog
   */
  cancel(): void {
    this.dialogRef.close(false);
  }
}

