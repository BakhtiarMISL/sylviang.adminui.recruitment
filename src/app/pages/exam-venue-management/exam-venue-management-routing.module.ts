import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { ExamVenueListComponent } from './exam-venue-list/exam-venue-list.component';
import { ManageExamVenueComponent } from './manage-exam-venue/manage-exam-venue.component';
import { ExamRoomListComponent } from './exam-room-list/exam-room-list.component';
import { ManageExamRoomComponent } from './manage-exam-room/manage-exam-room.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'exam-venue-list',
    component: ExamVenueListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-exam-venue',
    component: ManageExamVenueComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-exam-venue/:id',
    component: ManageExamVenueComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'exam-venue/:venueId/rooms',
    component: ExamRoomListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'exam-venue/:venueId/manage-room',
    component: ManageExamRoomComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'exam-venue/:venueId/manage-room/:id',
    component: ManageExamRoomComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamVenueManagementRoutingModule {}
