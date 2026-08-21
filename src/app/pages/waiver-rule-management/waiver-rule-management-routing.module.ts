import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { WaiverRuleListComponent } from './waiver-rule-list/waiver-rule-list.component';
import { WaiverRuleFormComponent } from './waiver-rule-form/waiver-rule-form.component';

const roleData = { roles: [UserRoleEnum.Admin] };

const routes: Routes = [
  { path: 'waiver-rule-list', component: WaiverRuleListComponent, canActivate: [RoleGuard], data: roleData },
  { path: 'manage-waiver-rule', component: WaiverRuleFormComponent, canActivate: [RoleGuard], data: roleData },
  { path: 'manage-waiver-rule/:id', component: WaiverRuleFormComponent, canActivate: [RoleGuard], data: roleData },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaiverRuleManagementRoutingModule {}
