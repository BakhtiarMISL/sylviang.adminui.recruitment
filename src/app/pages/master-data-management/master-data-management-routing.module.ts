import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { MasterDataListComponent } from './master-data-list/master-data-list.component';
import { MasterDataFormComponent } from './master-data-form/master-data-form.component';
import { MASTER_DATA_CONFIGS } from './master-data.config';

const roleData = { roles: [UserRoleEnum.Admin] };

// One list route + two form routes (add/edit) per entity, all pointing to the same two
// generic components - only route `data.config` differs per entity, see master-data.config.ts.
const routes: Routes = Object.values(MASTER_DATA_CONFIGS).flatMap((config) => [
  {
    path: `${config.routeKey}-list`,
    component: MasterDataListComponent,
    canActivate: [RoleGuard],
    data: { ...roleData, config },
  },
  {
    path: `manage-${config.routeKey}`,
    component: MasterDataFormComponent,
    canActivate: [RoleGuard],
    data: { ...roleData, config },
  },
  {
    path: `manage-${config.routeKey}/:id`,
    component: MasterDataFormComponent,
    canActivate: [RoleGuard],
    data: { ...roleData, config },
  },
]);

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterDataManagementRoutingModule {}
