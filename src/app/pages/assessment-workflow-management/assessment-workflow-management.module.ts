import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { AssessmentWorkflowManagementRoutingModule } from './assessment-workflow-management-routing.module';
import { AssessmentWorkflowListComponent } from './assessment-workflow-list/assessment-workflow-list.component';
import { ManageAssessmentWorkflowComponent } from './manage-assessment-workflow/manage-assessment-workflow.component';

@NgModule({
  declarations: [AssessmentWorkflowListComponent, ManageAssessmentWorkflowComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    DragDropModule,
    AssessmentWorkflowManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TextareaModule,
    CheckboxModule,
    TooltipModule,
  ],
})
export class AssessmentWorkflowManagementModule {}
