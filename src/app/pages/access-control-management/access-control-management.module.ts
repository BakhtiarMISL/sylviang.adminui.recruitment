import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { AccessControlManagementRoutingModule } from './access-control-management-routing.module';
import { UserAccountListComponent } from './user-account-list/user-account-list.component';
import { UserAccountFormComponent } from './user-account-form/user-account-form.component';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';

@NgModule({
  declarations: [UserAccountListComponent, UserAccountFormComponent, RoleListComponent, RoleFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    AccessControlManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
    CheckboxModule,
    MultiSelectModule,
    SelectModule,
  ],
})
export class AccessControlManagementModule {}
