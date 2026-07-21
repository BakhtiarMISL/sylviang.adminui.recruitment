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
import { ExamVenueManagementRoutingModule } from './exam-venue-management-routing.module';
import { ExamVenueListComponent } from './exam-venue-list/exam-venue-list.component';
import { ManageExamVenueComponent } from './manage-exam-venue/manage-exam-venue.component';
import { ExamRoomListComponent } from './exam-room-list/exam-room-list.component';
import { ManageExamRoomComponent } from './manage-exam-room/manage-exam-room.component';

@NgModule({
  declarations: [ExamVenueListComponent, ManageExamVenueComponent, ExamRoomListComponent, ManageExamRoomComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ExamVenueManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    FloatLabelModule,
    SkeletonModule,
  ],
})
export class ExamVenueManagementModule {}
