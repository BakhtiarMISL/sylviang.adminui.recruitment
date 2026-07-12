import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { ApplicationTrackingRoutingModule } from './application-tracking-routing.module';
import { AtsDashboardComponent } from './ats-dashboard/ats-dashboard.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplyOnBehalfComponent } from './apply-on-behalf/apply-on-behalf.component';

@NgModule({
  declarations: [AtsDashboardComponent, ApplicationDetailComponent, ApplyOnBehalfComponent],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    SharedModule,
    ApplicationTrackingRoutingModule,
    RouterModule,
    TranslateModule,
    AutoCompleteModule,
    ConfirmDialogModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    SelectModule,
    SkeletonModule,
    TextareaModule,
    TooltipModule,
    DatePickerModule,
  ],
})
export class ApplicationTrackingModule {}
