import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CandidateManagementRoutingModule } from './candidate-management-routing.module';
import { CandidateHubComponent } from './candidate-hub/candidate-hub.component';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { CandidateDetailComponent } from './candidate-detail/candidate-detail.component';
import { CvBankSearchComponent } from './cv-bank-search/cv-bank-search.component';

@NgModule({
  declarations: [CandidateHubComponent, CandidateListComponent, CandidateDetailComponent, CvBankSearchComponent],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    SharedModule,
    CandidateManagementRoutingModule,
    RouterModule,
    TranslateModule,
    TableModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    FloatLabelModule,
    SkeletonModule,
    TextareaModule,
    TooltipModule,
    AutoCompleteModule,
    MultiSelectModule,
    TabsModule,
  ],
})
export class CandidateManagementModule {}
