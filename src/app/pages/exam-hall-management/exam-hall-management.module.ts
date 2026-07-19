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
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { ExamHallManagementRoutingModule } from './exam-hall-management-routing.module';
import { ExamHallListComponent } from './exam-hall-list/exam-hall-list.component';
import { ManageExamHallComponent } from './manage-exam-hall/manage-exam-hall.component';

@NgModule({
  declarations: [ExamHallListComponent, ManageExamHallComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ExamHallManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    FloatLabelModule,
    SkeletonModule,
  ],
})
export class ExamHallManagementModule {}
