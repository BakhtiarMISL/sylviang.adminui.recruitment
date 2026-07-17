import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IAssessmentStage, IAssessmentWorkflowCreateRequest } from '@app/@core/interfaces/recruitment-management/assessment-workflow.interface';
import { AssessmentWorkflowService } from '@app/@core/services/recruitment/assessment-workflow/assessment-workflow.service';
import { BreadcrumbService } from '@app/@core/services';
import { newStage, StageTypeOptions } from './manage-assessment-workflow.component.constants';

@Component({
  selector: 'app-manage-assessment-workflow',
  standalone: false,
  templateUrl: './manage-assessment-workflow.component.html',
  styleUrl: './manage-assessment-workflow.component.scss',
})
export class ManageAssessmentWorkflowComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private assessmentWorkflowService: AssessmentWorkflowService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  workflowForm!: FormGroup;
  stages: IAssessmentStage[] = [];
  expandedStageIndex: number | null = null;

  formSubmitted = false;
  isEditMode = false;
  assessmentWorkflowId: number | null = null;
  errorMessage = '';

  stageTypeOptions = StageTypeOptions;

  ngOnInit(): void {
    this.workflowForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(200)]],
      description: [null],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.assessmentWorkflowId = +idParam;
        this.isEditMode = true;
        this.loadWorkflow(this.assessmentWorkflowId);
      } else {
        this.isEditMode = false;
        this.assessmentWorkflowId = null;
        this.stages = [newStage(0)];
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/assessment-workflow/assessment-workflow-list' },
      { title: 'Assessment Workflows', icon: 'fa-solid fa-clipboard-check', href: '/assessment-workflow/assessment-workflow-list' },
      { title: this.isEditMode ? 'Edit Workflow' : 'Add Workflow', icon: 'fa-solid fa-edit', href: '/assessment-workflow/manage-assessment-workflow' },
    ]);
  }

  private loadWorkflow(id: number): void {
    this.assessmentWorkflowService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.workflowForm.patchValue({ name: response.content.name, description: response.content.description });
          this.stages = [...response.content.stages].sort((a, b) => a.displayOrder - b.displayOrder);
        } else {
          this.router.navigate(['/assessment-workflow/assessment-workflow-list']);
        }
      },
      error: () => {
        this.router.navigate(['/assessment-workflow/assessment-workflow-list']);
      },
    });
  }

  get f() {
    return this.workflowForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.workflowForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  toggleStageExpanded(index: number): void {
    this.expandedStageIndex = this.expandedStageIndex === index ? null : index;
  }

  addStage(): void {
    this.stages.push(newStage(this.stages.length));
    this.expandedStageIndex = this.stages.length - 1;
  }

  removeStage(index: number): void {
    this.stages.splice(index, 1);
    this.stages.forEach((s, i) => (s.displayOrder = i));
    this.expandedStageIndex = null;
  }

  onStageDrop(event: CdkDragDrop<IAssessmentStage[]>): void {
    moveItemInArray(this.stages, event.previousIndex, event.currentIndex);
    this.stages.forEach((s, i) => (s.displayOrder = i));
  }

  stageIsInvalid(stage: IAssessmentStage): boolean {
    return !stage.stageType || stage.maxMarks <= 0 || stage.passMarks <= 0 || stage.passMarks > stage.maxMarks || stage.durationMinutes <= 0;
  }

  get hasInvalidStages(): boolean {
    return this.stages.length === 0 || this.stages.some((s) => this.stageIsInvalid(s));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.workflowForm.invalid) {
      this.workflowForm.markAllAsTouched();
      return;
    }

    if (this.hasInvalidStages) {
      this.errorMessage = 'Every stage needs a type, positive marks and duration, and pass marks must not exceed max marks.';
      return;
    }

    const request: IAssessmentWorkflowCreateRequest = {
      name: this.workflowForm.value.name,
      description: this.workflowForm.value.description,
      stages: this.stages,
    };

    if (this.isEditMode && this.assessmentWorkflowId) {
      this.assessmentWorkflowService.update(this.assessmentWorkflowId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/assessment-workflow/assessment-workflow-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update workflow';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update workflow';
        },
      });
    } else {
      this.assessmentWorkflowService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/assessment-workflow/assessment-workflow-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create workflow';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create workflow';
        },
      });
    }
  }
}
