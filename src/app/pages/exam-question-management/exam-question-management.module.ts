import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { ExamQuestionManagementRoutingModule } from './exam-question-management-routing.module';
import { QuestionGroupListComponent } from './question-group-list/question-group-list.component';
import { ManageQuestionGroupComponent } from './manage-question-group/manage-question-group.component';
import { ExamQuestionListComponent } from './exam-question-list/exam-question-list.component';
import { ManageExamQuestionComponent } from './manage-exam-question/manage-exam-question.component';

@NgModule({
  declarations: [QuestionGroupListComponent, ManageQuestionGroupComponent, ExamQuestionListComponent, ManageExamQuestionComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ExamQuestionManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TextareaModule,
  ],
})
export class ExamQuestionManagementModule {}
