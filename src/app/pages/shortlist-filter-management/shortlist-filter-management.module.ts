import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { ShortlistFilterManagementRoutingModule } from './shortlist-filter-management-routing.module';
import { ShortlistFilterListComponent } from './shortlist-filter-list/shortlist-filter-list.component';
import { ManageShortlistFilterComponent } from './manage-shortlist-filter/manage-shortlist-filter.component';

@NgModule({
  declarations: [ShortlistFilterListComponent, ManageShortlistFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ShortlistFilterManagementRoutingModule,
    ConfirmDialogModule,
    AutoCompleteModule,
    ChipModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TextareaModule,
  ],
})
export class ShortlistFilterManagementModule {}
// force rebuild

