import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { ExamHallListComponent } from './exam-hall-list/exam-hall-list.component';
import { ManageExamHallComponent } from './manage-exam-hall/manage-exam-hall.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'exam-hall-list',
    component: ExamHallListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-exam-hall',
    component: ManageExamHallComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-exam-hall/:id',
    component: ManageExamHallComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamHallManagementRoutingModule {}
