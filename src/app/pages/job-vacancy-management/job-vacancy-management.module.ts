import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { JobVacancyManagementRoutingModule } from './job-vacancy-management-routing.module';
import { JobVacancyListComponent } from './job-vacancy-list/job-vacancy-list.component';
import { ManageJobVacancyComponent } from './manage-job-vacancy/manage-job-vacancy.component';

@NgModule({
  declarations: [JobVacancyListComponent, ManageJobVacancyComponent],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    SharedModule,
    JobVacancyManagementRoutingModule,
    RouterModule,
    TranslateModule,
    ConfirmDialogModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    FloatLabelModule,
    SelectModule,
    SkeletonModule,
    InputNumberModule,
    TextareaModule,
    TooltipModule,
    DatePickerModule,
    AutoCompleteModule,
  ],
})
export class JobVacancyManagementModule {}
