import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import {
  ICandidateProfileResponse,
  ICandidateResumeParsedEducation,
  ICandidateResumeParsedWorkExperience,
  ICandidateResumeParseResponse,
} from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { PersonalInfoSectionComponent } from './sections/personal-info-section/personal-info-section.component';
import { ContactSectionComponent } from './sections/contact-section/contact-section.component';
import { EducationSectionComponent } from './sections/education-section/education-section.component';
import { WorkExperienceSectionComponent } from './sections/work-experience-section/work-experience-section.component';
import { SkillsSectionComponent } from './sections/skills-section/skills-section.component';
import { DocumentsSectionComponent } from './sections/documents-section/documents-section.component';

const RESUME_ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const RESUME_MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Survives a page refresh so an uploaded resume's suggestions/auto-fill don't vanish before
// the candidate has reviewed and saved them. sessionStorage (not localStorage) so it clears
// itself once the tab closes rather than resurrecting a stale resume on a later visit.
const RESUME_PREFILL_STORAGE_KEY = 'candidateProfile.resumePrefill';

interface IStoredResumePrefill {
  selectedResumeName: string;
  resumeDegradedNotice: string;
  personalInfo: { fullName?: string | null; dateOfBirth?: string | null; gender?: string | null; religion?: string | null; maritalStatus?: string | null };
  contact: { email?: string | null; phone?: string | null; presentAddress?: string | null };
  educations: ICandidateResumeParsedEducation[];
  workExperiences: ICandidateResumeParsedWorkExperience[];
  skills: string[];
}

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
  @ViewChild(DocumentsSectionComponent) documentsSection?: DocumentsSectionComponent;

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

  private resumePrefillState: IStoredResumePrefill | null = null;

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

  loadProfile(showLoading = true): void {
    if (showLoading) this.loading = true;
    this.loadError = '';
    this.candidateProfileService.getMyProfile().subscribe({
      next: (response) => {
        if (showLoading) this.loading = false;
        if (response && !response.hasError && response.content) {
          this.profile = response.content;
          // Sections only exist in the DOM once profile is set (both are behind the same
          // *ngIf) - wait a tick so @ViewChild refs are populated before restoring into them.
          if (showLoading) setTimeout(() => this.restoreResumePrefill());
        } else {
          this.loadError = response?.decentMessage || 'Failed to load your profile.';
        }
      },
      error: (error) => {
        if (showLoading) this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load your profile.';
      },
    });
  }

  // Re-applies whatever was left unsaved from a resume parse after a page refresh. Personal
  // Info/Contact only reapply while their form is still pristine, so a refresh after Save
  // can't clobber a value the candidate already reviewed and persisted (or edited themselves).
  private restoreResumePrefill(): void {
    const raw = sessionStorage.getItem(RESUME_PREFILL_STORAGE_KEY);
    if (!raw) return;

    let state: IStoredResumePrefill;
    try {
      state = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(RESUME_PREFILL_STORAGE_KEY);
      return;
    }

    this.resumePrefillState = state;
    this.selectedResumeName = state.selectedResumeName;
    this.resumeDegradedNotice = state.resumeDegradedNotice;
    this.resumeParsed = true;

    if (this.personalInfoSection?.form.pristine) {
      this.personalInfoSection.applyPrefill(state.personalInfo.fullName, state.personalInfo.dateOfBirth, state.personalInfo.gender, state.personalInfo.religion, state.personalInfo.maritalStatus);
    }
    if (this.contactSection?.form.pristine) {
      this.contactSection.applyPrefill(state.contact.email, state.contact.phone, state.contact.presentAddress);
    }
    this.educationSection?.stagePrefill(state.educations);
    this.workExperienceSection?.stagePrefill(state.workExperiences);
    this.skillsSection?.stagePrefill(state.skills);
  }

  private persistResumePrefill(): void {
    if (!this.resumePrefillState) return;

    const { educations, workExperiences, skills } = this.resumePrefillState;
    if (educations.length === 0 && workExperiences.length === 0 && skills.length === 0) {
      sessionStorage.removeItem(RESUME_PREFILL_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(RESUME_PREFILL_STORAGE_KEY, JSON.stringify(this.resumePrefillState));
  }

  onEducationSuggestionsChanged(list: ICandidateResumeParsedEducation[]): void {
    if (!this.resumePrefillState) return;
    this.resumePrefillState.educations = list;
    this.persistResumePrefill();
  }

  onWorkExperienceSuggestionsChanged(list: ICandidateResumeParsedWorkExperience[]): void {
    if (!this.resumePrefillState) return;
    this.resumePrefillState.workExperiences = list;
    this.persistResumePrefill();
  }

  onSkillSuggestionsChanged(list: string[]): void {
    if (!this.resumePrefillState) return;
    this.resumePrefillState.skills = list;
    this.persistResumePrefill();
  }

  // Each section saves independently; re-fetching the whole profile afterwards keeps
  // completenessPercentage and every other section's read-only view in sync (AC2).
  // Skips the loading flag - toggling it destroys/recreates the whole accordion (it's
  // gated behind *ngIf="!loading && profile"), which would wipe every sibling section's
  // unsaved state (prefillSuggestions, in-progress form edits) just because one section saved.
  onSectionSaved(): void {
    this.loadProfile(false);
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

  // Prefills every section's form/suggestions from the parsed resume. Each section still
  // requires its own explicit Save (or "Use"/"Use All" for list sections) - the sessionStorage
  // snapshot below only guards against losing all of this to an accidental page refresh first.
  private applyResumePrefill(parsed: ICandidateResumeParseResponse): void {
    this.personalInfoSection?.applyPrefill(parsed.fullName, parsed.dateOfBirth, parsed.gender, parsed.religion, parsed.maritalStatus);
    this.contactSection?.applyPrefill(parsed.email, parsed.phone, parsed.presentAddress);
    this.educationSection?.stagePrefill(parsed.educations);
    this.workExperienceSection?.stagePrefill(parsed.workExperiences);
    this.skillsSection?.stagePrefill(parsed.skills);
    this.resumeDegradedNotice = parsed.aiParsingDegraded
      ? 'AI parsing was unavailable, so we used basic extraction instead. Please double-check the suggested details below.'
      : '';

    this.resumePrefillState = {
      selectedResumeName: this.selectedResumeName,
      resumeDegradedNotice: this.resumeDegradedNotice,
      personalInfo: { fullName: parsed.fullName, dateOfBirth: parsed.dateOfBirth, gender: parsed.gender, religion: parsed.religion, maritalStatus: parsed.maritalStatus },
      contact: { email: parsed.email, phone: parsed.phone, presentAddress: parsed.presentAddress },
      educations: parsed.educations,
      workExperiences: parsed.workExperiences,
      skills: parsed.skills,
    };
    this.persistResumePrefill();

    // The backend also saves the uploaded file itself as a Resume document in the same
    // request - refresh Documents so it shows up immediately instead of only after a
    // full page reload.
    if (parsed.resumeDocumentSaved) this.documentsSection?.loadDocuments();
  }
}
