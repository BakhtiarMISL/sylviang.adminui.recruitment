import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { ICandidateProfileResponse, ICandidateResumeParseResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { PersonalInfoSectionComponent } from './sections/personal-info-section/personal-info-section.component';
import { ContactSectionComponent } from './sections/contact-section/contact-section.component';
import { EducationSectionComponent } from './sections/education-section/education-section.component';
import { WorkExperienceSectionComponent } from './sections/work-experience-section/work-experience-section.component';
import { SkillsSectionComponent } from './sections/skills-section/skills-section.component';

const RESUME_ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const RESUME_MAX_SIZE_BYTES = 10 * 1024 * 1024;

@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent implements OnInit {
  @ViewChild(PersonalInfoSectionComponent) personalInfoSection?: PersonalInfoSectionComponent;
  @ViewChild(ContactSectionComponent) contactSection?: ContactSectionComponent;
  @ViewChild(EducationSectionComponent) educationSection?: EducationSectionComponent;
  @ViewChild(WorkExperienceSectionComponent) workExperienceSection?: WorkExperienceSectionComponent;
  @ViewChild(SkillsSectionComponent) skillsSection?: SkillsSectionComponent;

  constructor(
    private candidateProfileService: CandidateProfileService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  profile: ICandidateProfileResponse | null = null;
  loading = true;
  loadError = '';

  parsingResume = false;
  resumeError = '';
  resumeParsed = false;
  resumeDegradedNotice = '';
  selectedResumeName = '';

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      {
        title: 'My Profile',
        icon: 'fa-solid fa-id-card',
        href: '/candidate-profile',
      },
    ]);
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.loadError = '';
    this.candidateProfileService.getMyProfile().subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.profile = response.content;
        } else {
          this.loadError = response?.decentMessage || 'Failed to load your profile.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load your profile.';
      },
    });
  }

  // Each section saves independently; re-fetching the whole profile afterwards keeps
  // completenessPercentage and every other section's read-only view in sync (AC2).
  onSectionSaved(): void {
    this.loadProfile();
  }

  onResumeFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.resumeError = '';
    this.resumeParsed = false;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!RESUME_ALLOWED_EXTENSIONS.includes(extension)) {
      this.resumeError = `Resume must be one of: ${RESUME_ALLOWED_EXTENSIONS.join(', ')}`;
      input.value = '';
      return;
    }

    if (file.size > RESUME_MAX_SIZE_BYTES) {
      this.resumeError = 'Resume file size must not exceed 10MB';
      input.value = '';
      return;
    }

    this.selectedResumeName = file.name;
    this.parsingResume = true;
    this.resumeDegradedNotice = '';
    this.candidateProfileService.parseResume(file).subscribe({
      next: (response) => {
        this.parsingResume = false;
        input.value = '';
        if (response && !response.hasError && response.content) {
          this.applyResumePrefill(response.content);
          this.resumeParsed = true;
        } else {
          this.resumeError = response?.decentMessage || 'Failed to parse resume';
        }
      },
      error: (error) => {
        this.parsingResume = false;
        input.value = '';
        this.resumeError = error?.error?.decentMessage || 'Failed to parse resume';
      },
    });
  }

  // Prefills every section's form/suggestions from the parsed resume. Nothing is persisted here
  // — each section still requires its own explicit Save (or "Use"/"Use All" for list sections).
  private applyResumePrefill(parsed: ICandidateResumeParseResponse): void {
    this.personalInfoSection?.applyPrefill(parsed.fullName, parsed.dateOfBirth, parsed.gender);
    this.contactSection?.applyPrefill(parsed.email, parsed.phone, parsed.presentAddress);
    this.educationSection?.stagePrefill(parsed.educations);
    this.workExperienceSection?.stagePrefill(parsed.workExperiences);
    this.skillsSection?.stagePrefill(parsed.skills);
    this.resumeDegradedNotice = parsed.aiParsingDegraded
      ? 'AI parsing was unavailable, so we used basic extraction instead. Please double-check the suggested details below.'
      : '';
  }
}
