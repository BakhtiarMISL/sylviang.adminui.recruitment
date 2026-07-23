import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TalentPoolManagementRoutingModule } from './talent-pool-management-routing.module';
import { TalentPoolListComponent } from './talent-pool-list/talent-pool-list.component';
import { TalentPoolDetailComponent } from './talent-pool-detail/talent-pool-detail.component';

@NgModule({
  declarations: [TalentPoolListComponent, TalentPoolDetailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    TalentPoolManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
    DialogModule,
    SelectModule,
  ],
})
export class TalentPoolManagementModule {}
