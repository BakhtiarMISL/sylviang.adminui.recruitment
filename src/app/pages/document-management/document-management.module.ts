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
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { DocumentManagementRoutingModule } from './document-management-routing.module';
import { DocumentTemplateListComponent } from './document-template-list/document-template-list.component';
import { DocumentTemplateFormComponent } from './document-template-form/document-template-form.component';
import { OfferLetterListComponent } from './offer-letter-list/offer-letter-list.component';
import { OfferLetterFormComponent } from './offer-letter-form/offer-letter-form.component';
import { AppointmentLetterListComponent } from './appointment-letter-list/appointment-letter-list.component';
import { AppointmentLetterFormComponent } from './appointment-letter-form/appointment-letter-form.component';
import { DocumentTrackingListComponent } from './document-tracking-list/document-tracking-list.component';
import { JoiningBookletListComponent } from './joining-booklet-list/joining-booklet-list.component';
import { JoiningBookletBatchGenerateComponent } from './joining-booklet-batch-generate/joining-booklet-batch-generate.component';
import { MedicalLetterFormComponent } from './medical-letter-form/medical-letter-form.component';
import { TargetLetterFormComponent } from './target-letter-form/target-letter-form.component';
import { FitmentDataFormComponent } from './fitment-data-form/fitment-data-form.component';
import { OfficeNoteListComponent } from './office-note-list/office-note-list.component';
import { OfficeNoteGenerateComponent } from './office-note-generate/office-note-generate.component';

@NgModule({
  declarations: [
    DocumentTemplateListComponent,
    DocumentTemplateFormComponent,
    OfferLetterListComponent,
    OfferLetterFormComponent,
    AppointmentLetterListComponent,
    AppointmentLetterFormComponent,
    DocumentTrackingListComponent,
    JoiningBookletListComponent,
    JoiningBookletBatchGenerateComponent,
    MedicalLetterFormComponent,
    TargetLetterFormComponent,
    FitmentDataFormComponent,
    OfficeNoteListComponent,
    OfficeNoteGenerateComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    DocumentManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
    TextareaModule,
  ],
})
export class DocumentManagementModule {}
