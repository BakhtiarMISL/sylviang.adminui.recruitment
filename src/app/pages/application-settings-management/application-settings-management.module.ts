import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { ApplicationSettingsManagementRoutingModule } from './application-settings-management-routing.module';
import { ApplicationSettingsComponent } from './application-settings/application-settings.component';

@NgModule({
  declarations: [ApplicationSettingsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ApplicationSettingsManagementRoutingModule,
    ButtonModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
  ],
})
export class ApplicationSettingsManagementModule {}
