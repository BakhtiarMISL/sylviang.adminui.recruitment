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
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ExamManagementRoutingModule } from './exam-management-routing.module';
import { ExamListComponent } from './exam-list/exam-list.component';
import { ScheduleExamComponent } from './schedule-exam/schedule-exam.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';

@NgModule({
  declarations: [ExamListComponent, ScheduleExamComponent, ExamDetailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ExamManagementRoutingModule,
    ConfirmDialogModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
  ],
})
export class ExamManagementModule {}
