import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { CandidateRecommendationManagementRoutingModule } from './candidate-recommendation-management-routing.module';
import { CandidateRecommendationListComponent } from './candidate-recommendation-list/candidate-recommendation-list.component';

@NgModule({
  declarations: [CandidateRecommendationListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    CandidateRecommendationManagementRoutingModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SkeletonModule,
    TextareaModule,
  ],
})
export class CandidateRecommendationManagementModule {}
