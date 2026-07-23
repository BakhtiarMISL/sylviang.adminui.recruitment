import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { ExamListComponent } from './exam-list/exam-list.component';
import { ScheduleExamComponent } from './schedule-exam/schedule-exam.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'exam-list',
    component: ExamListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'schedule-exam',
    component: ScheduleExamComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'exam/:id',
    component: ExamDetailComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamManagementRoutingModule {}
