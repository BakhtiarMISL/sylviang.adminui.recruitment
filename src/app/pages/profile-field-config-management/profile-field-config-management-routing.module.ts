import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { ProfileFieldConfigListComponent } from './profile-field-config-list/profile-field-config-list.component';

const routes: Routes = [
  {
    path: 'profile-field-config-list',
    component: ProfileFieldConfigListComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRoleEnum.Admin] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileFieldConfigManagementRoutingModule {}
