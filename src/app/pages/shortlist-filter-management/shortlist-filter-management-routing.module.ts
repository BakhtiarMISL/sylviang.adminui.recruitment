import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { ShortlistFilterListComponent } from './shortlist-filter-list/shortlist-filter-list.component';
import { ManageShortlistFilterComponent } from './manage-shortlist-filter/manage-shortlist-filter.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'shortlist-filter-list',
    component: ShortlistFilterListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-shortlist-filter',
    component: ManageShortlistFilterComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-shortlist-filter/:id',
    component: ManageShortlistFilterComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShortlistFilterManagementRoutingModule {}
