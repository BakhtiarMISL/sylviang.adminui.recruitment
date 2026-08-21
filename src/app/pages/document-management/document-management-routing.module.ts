import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
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

const roleData = { roles: [UserRoleEnum.Admin] };

// EP-12 F2b/F3: HR's core onboarding data-entry + document-generation screens, following
// FinalSelectionPoolController's Admin,HR pairing convention rather than this module's existing
// Admin-only routes above.
const adminHrRoleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'document-template-list',
    component: DocumentTemplateListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-document-template',
    component: DocumentTemplateFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-document-template/:id',
    component: DocumentTemplateFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'offer-letter-list',
    component: OfferLetterListComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'manage-offer-letter',
    component: OfferLetterFormComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'appointment-letter-list',
    component: AppointmentLetterListComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'manage-appointment-letter',
    component: AppointmentLetterFormComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'document-tracking-list',
    component: DocumentTrackingListComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'joining-booklet-list',
    component: JoiningBookletListComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'joining-booklet-batch-generate',
    component: JoiningBookletBatchGenerateComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'manage-medical-letter',
    component: MedicalLetterFormComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'manage-target-letter',
    component: TargetLetterFormComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'manage-fitment-data',
    component: FitmentDataFormComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'office-note-list',
    component: OfficeNoteListComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
  {
    path: 'manage-office-note',
    component: OfficeNoteGenerateComponent,
    canActivate: [RoleGuard],
    data: adminHrRoleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentManagementRoutingModule {}
