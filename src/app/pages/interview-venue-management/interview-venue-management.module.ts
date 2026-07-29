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
import { InterviewVenueManagementRoutingModule } from './interview-venue-management-routing.module';
import { InterviewVenueListComponent } from './interview-venue-list/interview-venue-list.component';
import { ManageInterviewVenueComponent } from './manage-interview-venue/manage-interview-venue.component';
import { InterviewRoomListComponent } from './interview-room-list/interview-room-list.component';
import { ManageInterviewRoomComponent } from './manage-interview-room/manage-interview-room.component';

@NgModule({
  declarations: [InterviewVenueListComponent, ManageInterviewVenueComponent, InterviewRoomListComponent, ManageInterviewRoomComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    InterviewVenueManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    FloatLabelModule,
    SkeletonModule,
  ],
})
export class InterviewVenueManagementModule {}
