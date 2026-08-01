import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { ExportRequestListComponent } from './export-request-list/export-request-list.component';

const hrRoleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'export-request-list',
    component: ExportRequestListComponent,
    canActivate: [RoleGuard],
    data: hrRoleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportRequestManagementRoutingModule {}
