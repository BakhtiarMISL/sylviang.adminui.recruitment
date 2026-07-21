import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CompletenessRingComponent } from './components/completeness-ring/completeness-ring.component';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { PublicFooterComponent } from './components/public-footer/public-footer.component';
import { PublicNavbarComponent } from './components/public-navbar/public-navbar.component';

@NgModule({
  declarations: [CompletenessRingComponent, FilterPanelComponent, PublicNavbarComponent, PublicFooterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    RadioButtonModule,
    SkeletonModule,
    TableModule,
    TooltipModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CompletenessRingComponent,
    FilterPanelComponent,
    PublicNavbarComponent,
    PublicFooterComponent,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    RadioButtonModule,
    SkeletonModule,
    TableModule,
    TooltipModule,
  ],
})
export class SharedModule {}
