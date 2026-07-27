import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { NotificationTemplateListComponent } from './notification-template-list/notification-template-list.component';
import { NotificationTemplateFormComponent } from './notification-template-form/notification-template-form.component';
import { EventTemplateMappingListComponent } from './event-template-mapping-list/event-template-mapping-list.component';
import { EventTemplateMappingFormComponent } from './event-template-mapping-form/event-template-mapping-form.component';
import { NotificationLogListComponent } from './notification-log-list/notification-log-list.component';

const roleData = { roles: [UserRoleEnum.Admin] };
const hrRoleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'notification-template-list',
    component: NotificationTemplateListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-notification-template',
    component: NotificationTemplateFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-notification-template/:id',
    component: NotificationTemplateFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'event-template-mapping-list',
    component: EventTemplateMappingListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-event-template-mapping',
    component: EventTemplateMappingFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-event-template-mapping/:id',
    component: EventTemplateMappingFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'notification-log-list',
    component: NotificationLogListComponent,
    canActivate: [RoleGuard],
    data: hrRoleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationManagementRoutingModule {}
