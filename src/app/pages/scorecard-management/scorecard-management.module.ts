import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { ScorecardManagementRoutingModule } from './scorecard-management-routing.module';
import { ScorecardListComponent } from './scorecard-list/scorecard-list.component';
import { ManageScorecardComponent } from './manage-scorecard/manage-scorecard.component';

@NgModule({
  declarations: [ScorecardListComponent, ManageScorecardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ScorecardManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
  ],
})
export class ScorecardManagementModule {}
