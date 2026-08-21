import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { BrandingSettingsComponent } from './branding-settings/branding-settings.component';

const roleData = { roles: [UserRoleEnum.Admin] };

const routes: Routes = [
  {
    path: '',
    component: BrandingSettingsComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BrandingSettingsManagementRoutingModule {}
