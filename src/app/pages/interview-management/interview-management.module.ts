import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { InterviewManagementRoutingModule } from './interview-management-routing.module';
import { InterviewListComponent } from './interview-list/interview-list.component';
import { ScheduleInterviewComponent } from './schedule-interview/schedule-interview.component';
import { InterviewDetailComponent } from './interview-detail/interview-detail.component';
import { EvaluateInterviewComponent } from './evaluate-interview/evaluate-interview.component';
import { InterviewResultsComponent } from './interview-results/interview-results.component';
import { InterviewRoundConfigComponent } from './interview-round-config/interview-round-config.component';

@NgModule({
  declarations: [
    InterviewListComponent,
    ScheduleInterviewComponent,
    InterviewDetailComponent,
    EvaluateInterviewComponent,
    InterviewResultsComponent,
    InterviewRoundConfigComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    InterviewManagementRoutingModule,
    ConfirmDialogModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
    SelectModule,
    TextareaModule,
  ],
})
export class InterviewManagementModule {}
