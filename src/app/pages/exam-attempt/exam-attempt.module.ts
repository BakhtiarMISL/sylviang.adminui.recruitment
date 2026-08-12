import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { ExamAttemptRoutingModule } from './exam-attempt-routing.module';
import { ExamAttemptComponent } from './exam-attempt.component';

@NgModule({
  declarations: [ExamAttemptComponent],
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, ExamAttemptRoutingModule, ConfirmDialogModule, SkeletonModule, TextareaModule],
})
export class ExamAttemptModule {}
