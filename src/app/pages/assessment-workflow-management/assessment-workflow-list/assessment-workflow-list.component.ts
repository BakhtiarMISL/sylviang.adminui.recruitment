import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IAssessmentStage, IAssessmentWorkflowResponse } from '@app/@core/interfaces/recruitment-management/assessment-workflow.interface';
import { AssessmentWorkflowService } from '@app/@core/services/recruitment/assessment-workflow/assessment-workflow.service';
import { ConfirmationService } from 'primeng/api';
import { StageTypeLabels } from '../manage-assessment-workflow/manage-assessment-workflow.component.constants';

@Component({
  selector: 'app-assessment-workflow-list',
  standalone: false,
  templateUrl: './assessment-workflow-list.component.html',
  styleUrl: './assessment-workflow-list.component.scss',
})
export class AssessmentWorkflowListComponent implements OnInit {
  constructor(
    private assessmentWorkflowService: AssessmentWorkflowService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  workflows: IAssessmentWorkflowResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  stageTypeLabel(stage: IAssessmentStage): string {
    return StageTypeLabels[stage.stageType];
  }

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.loading = true;
    this.assessmentWorkflowService.getAll().subscribe({
      next: (response) => {
        this.workflows = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.workflows = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleActive(workflow: IAssessmentWorkflowResponse): void {
    const nextState = !workflow.isActive;
    this.assessmentWorkflowService.setActive(workflow.assessmentWorkflowId, nextState).subscribe({
      next: () => {
        workflow.isActive = nextState;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating workflow active state:', error);
      },
    });
  }

  deleteWorkflow(workflow: IAssessmentWorkflowResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete workflow: ${workflow.name}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.assessmentWorkflowService.delete(workflow.assessmentWorkflowId).subscribe({
          next: () => {
            this.loadWorkflows();
          },
          error: (error) => {
            console.error('Error deleting workflow:', error);
          },
        });
      },
    });
  }
}
