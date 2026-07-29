import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ExportRequestManagementRoutingModule } from './export-request-management-routing.module';
import { ExportRequestListComponent } from './export-request-list/export-request-list.component';

@NgModule({
  declarations: [ExportRequestListComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ExportRequestManagementRoutingModule,
    ButtonModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
  ],
})
export class ExportRequestManagementModule {}
