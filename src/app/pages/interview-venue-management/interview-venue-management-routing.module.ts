import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { InterviewVenueListComponent } from './interview-venue-list/interview-venue-list.component';
import { ManageInterviewVenueComponent } from './manage-interview-venue/manage-interview-venue.component';
import { InterviewRoomListComponent } from './interview-room-list/interview-room-list.component';
import { ManageInterviewRoomComponent } from './manage-interview-room/manage-interview-room.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'interview-venue-list',
    component: InterviewVenueListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-interview-venue',
    component: ManageInterviewVenueComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-interview-venue/:id',
    component: ManageInterviewVenueComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'interview-venue/:venueId/rooms',
    component: InterviewRoomListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'interview-venue/:venueId/manage-room',
    component: ManageInterviewRoomComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'interview-venue/:venueId/manage-room/:id',
    component: ManageInterviewRoomComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterviewVenueManagementRoutingModule {}
