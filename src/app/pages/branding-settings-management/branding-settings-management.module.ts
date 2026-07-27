import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { InputNumberModule } from 'primeng/inputnumber';
import { BrandingSettingsManagementRoutingModule } from './branding-settings-management-routing.module';
import { BrandingSettingsComponent } from './branding-settings/branding-settings.component';

@NgModule({
  declarations: [BrandingSettingsComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, SharedModule, BrandingSettingsManagementRoutingModule, InputNumberModule],
})
export class BrandingSettingsManagementModule {}
