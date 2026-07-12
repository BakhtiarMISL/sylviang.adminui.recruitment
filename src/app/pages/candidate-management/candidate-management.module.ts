import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CandidateManagementRoutingModule } from './candidate-management-routing.module';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { CandidateDetailComponent } from './candidate-detail/candidate-detail.component';

@NgModule({
  declarations: [CandidateListComponent, CandidateDetailComponent],
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
    ButtonModule,
    FloatLabelModule,
    SkeletonModule,
    TextareaModule,
    TooltipModule,
  ],
})
export class CandidateManagementModule {}
