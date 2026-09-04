import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ProfileFieldConfigManagementRoutingModule } from './profile-field-config-management-routing.module';
import { ProfileFieldConfigListComponent } from './profile-field-config-list/profile-field-config-list.component';

@NgModule({
  declarations: [ProfileFieldConfigListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ProfileFieldConfigManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
    SelectModule,
  ],
})
export class ProfileFieldConfigManagementModule {}
