import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { HiringPipelineManagementRoutingModule } from './hiring-pipeline-management-routing.module';
import { HiringPipelineListComponent } from './hiring-pipeline-list/hiring-pipeline-list.component';
import { ManageHiringPipelineComponent } from './manage-hiring-pipeline/manage-hiring-pipeline.component';

@NgModule({
  declarations: [HiringPipelineListComponent, ManageHiringPipelineComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    DragDropModule,
    HiringPipelineManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TextareaModule,
    CheckboxModule,
    AutoCompleteModule,
    TooltipModule,
  ],
})
export class HiringPipelineManagementModule {}
