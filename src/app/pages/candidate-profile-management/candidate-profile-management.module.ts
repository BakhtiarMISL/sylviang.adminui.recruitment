import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { CandidateProfileManagementRoutingModule } from './candidate-profile-management-routing.module';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { MyOfferLettersComponent } from './my-offer-letters/my-offer-letters.component';
import { MyOfferLetterDetailComponent } from './my-offer-letter-detail/my-offer-letter-detail.component';
import { MyAppointmentLettersComponent } from './my-appointment-letters/my-appointment-letters.component';
import { MyAppointmentLetterDetailComponent } from './my-appointment-letter-detail/my-appointment-letter-detail.component';
import { PersonalInfoSectionComponent } from './my-profile/sections/personal-info-section/personal-info-section.component';
import { ContactSectionComponent } from './my-profile/sections/contact-section/contact-section.component';
import { EducationSectionComponent } from './my-profile/sections/education-section/education-section.component';
import { WorkExperienceSectionComponent } from './my-profile/sections/work-experience-section/work-experience-section.component';
import { SkillsSectionComponent } from './my-profile/sections/skills-section/skills-section.component';
import { CertificationsSectionComponent } from './my-profile/sections/certifications-section/certifications-section.component';
import { DocumentsSectionComponent } from './my-profile/sections/documents-section/documents-section.component';
import { PhotoSignatureUploadComponent } from './my-profile/photo-signature-upload/photo-signature-upload.component';
import { PreBoardingFormComponent } from './pre-boarding-form/pre-boarding-form.component';

@NgModule({
  declarations: [
    MyProfileComponent,
    PersonalInfoSectionComponent,
    ContactSectionComponent,
    EducationSectionComponent,
    WorkExperienceSectionComponent,
    SkillsSectionComponent,
    CertificationsSectionComponent,
    DocumentsSectionComponent,
    PhotoSignatureUploadComponent,
    MyOfferLettersComponent,
    MyOfferLetterDetailComponent,
    MyAppointmentLettersComponent,
    MyAppointmentLetterDetailComponent,
    PreBoardingFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    TranslateModule,
    CandidateProfileManagementRoutingModule,
    AccordionModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FloatLabelModule,
    DatePickerModule,
    SelectModule,
    SkeletonModule,
    CheckboxModule,
    InputNumberModule,
    AutoCompleteModule,
    TableModule,
    DialogModule,
  ],
})
export class CandidateProfileManagementModule {}
