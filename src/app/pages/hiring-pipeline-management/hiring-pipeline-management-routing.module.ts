import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { HiringPipelineListComponent } from './hiring-pipeline-list/hiring-pipeline-list.component';
import { ManageHiringPipelineComponent } from './manage-hiring-pipeline/manage-hiring-pipeline.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'hiring-pipeline-list',
    component: HiringPipelineListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-hiring-pipeline',
    component: ManageHiringPipelineComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-hiring-pipeline/:id',
    component: ManageHiringPipelineComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HiringPipelineManagementRoutingModule {}
