import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import {
  IBloodGroupResponse,
  ICandidateProfileDetailResponse,
  ICandidateTagResponse,
  IDegreeResponse,
  IGenderResponse,
  IMaritalStatusResponse,
  IReligionResponse,
} from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import { BreadcrumbService } from '@app/@core/services';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-candidate-detail',
  standalone: false,
  templateUrl: './candidate-detail.component.html',
  styleUrl: './candidate-detail.component.scss',
})
export class CandidateDetailComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private candidateProfileService: CandidateProfileService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  candidateProfileId!: number;
  profile: ICandidateProfileDetailResponse | null = null;
  loading = true;
  loadError = '';

  // Dynamic admin-managed lookups (see @app/pages/master-data-management) - the profile response
  // only carries Ids now, so this read-only view resolves them to display names itself.
  private genders: IGenderResponse[] = [];
  private maritalStatuses: IMaritalStatusResponse[] = [];
  private religions: IReligionResponse[] = [];
  private bloodGroups: IBloodGroupResponse[] = [];
  private degrees: IDegreeResponse[] = [];

  hrNotes = '';
  savingNotes = false;
  notesSaveError = '';
  notesSaveSuccess = false;

  markingInternal = false;
  markInternalError = '';

  downloadingProfile = false;
  downloadProfileError = '';

  // ── Tags (US-041, HR-only) ─────────────────────────────────────
  tags: ICandidateTagResponse[] = [];
  tagSuggestions: string[] = [];
  newTagName = '';
  addingTag = false;
  addTagError = '';

  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    // The lookup fetches below don't depend on candidateProfileId, so they stay outside the
    // subscription and only run once. The id-dependent load calls are subscribed rather than
    // read from route.snapshot once, because RouteReusableStrategy reuses this component instance
    // when navigating between two candidate-detail URLs - a snapshot read left the page silently
    // showing the previous candidate's profile on that navigation.
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.candidateProfileId = Number(params.get('id'));
      this.breadcrumbService.setBreadcrumbs([
        { title: 'Candidates', icon: 'fa-solid fa-users', href: '/candidates' },
        { title: 'Candidate Profile', icon: 'fa-solid fa-id-card', href: `/candidates/${this.candidateProfileId}` },
      ]);
      this.loadProfile();
      this.loadTags();
    });

    this.candidateProfileService.getGenders().subscribe({ next: (r) => (this.genders = !r.hasError && r.content ? r.content : []) });
    this.candidateProfileService.getMaritalStatuses().subscribe({ next: (r) => (this.maritalStatuses = !r.hasError && r.content ? r.content : []) });
    this.candidateProfileService.getReligions().subscribe({ next: (r) => (this.religions = !r.hasError && r.content ? r.content : []) });
    this.candidateProfileService.getBloodGroups().subscribe({ next: (r) => (this.bloodGroups = !r.hasError && r.content ? r.content : []) });
    this.candidateProfileService.getDegrees().subscribe({ next: (r) => (this.degrees = !r.hasError && r.content ? r.content : []) });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  genderName(id?: number | null): string {
    return this.genders.find((g) => g.genderId === id)?.name ?? '';
  }

  maritalStatusName(id?: number | null): string {
    return this.maritalStatuses.find((m) => m.maritalStatusId === id)?.name ?? '';
  }

  religionName(id?: number | null): string {
    return this.religions.find((r) => r.religionId === id)?.name ?? '';
  }

  bloodGroupName(id?: number | null): string {
    return this.bloodGroups.find((b) => b.bloodGroupId === id)?.name ?? '';
  }

  degreeName(id?: number | null): string {
    return this.degrees.find((d) => d.degreeId === id)?.name ?? '';
  }

  loadProfile(): void {
    this.loading = true;
    this.loadError = '';
    this.candidateProfileService.getById(this.candidateProfileId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.profile = response.content;
          this.hrNotes = this.profile.hrNotes || '';
        } else {
          this.loadError = response?.decentMessage || 'Failed to load candidate profile.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load candidate profile.';
      },
    });
  }

  getPhotoUrl(): string {
    if (!this.profile?.profilePhotoPath) return '';
    return `${Base_URL}${this.profile.profilePhotoPath.startsWith('/') ? '' : '/'}${this.profile.profilePhotoPath}`;
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '';
    return `${Base_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  saveHrNotes(): void {
    this.notesSaveError = '';
    this.notesSaveSuccess = false;
    this.savingNotes = true;

    this.candidateProfileService.updateHrNotes(this.candidateProfileId, { hrNotes: this.hrNotes }).subscribe({
      next: (response) => {
        this.savingNotes = false;
        if (response && !response.hasError) {
          this.notesSaveSuccess = true;
        } else {
          this.notesSaveError = response?.decentMessage || 'Failed to save notes.';
        }
      },
      error: (error) => {
        this.savingNotes = false;
        this.notesSaveError = error?.error?.decentMessage || 'Failed to save notes.';
      },
    });
  }

  markInternal(): void {
    this.markInternalError = '';
    this.markingInternal = true;

    this.candidateProfileService.markInternal(this.candidateProfileId).subscribe({
      next: (response) => {
        this.markingInternal = false;
        if (response && !response.hasError) {
          if (this.profile) this.profile.isInternal = true;
        } else {
          this.markInternalError = response?.decentMessage || 'Failed to mark candidate as internal.';
        }
      },
      error: (error) => {
        this.markingInternal = false;
        this.markInternalError = error?.error?.decentMessage || 'Failed to mark candidate as internal.';
      },
    });
  }

  downloadProfile(): void {
    this.downloadProfileError = '';
    this.downloadingProfile = true;

    this.candidateProfileService.downloadProfilePdf(this.candidateProfileId).subscribe({
      next: (response) => {
        this.downloadingProfile = false;
        saveFileResponse(response, `${this.profile?.fullName || 'Candidate'}_Profile.pdf`);
      },
      error: () => {
        this.downloadingProfile = false;
        this.downloadProfileError = 'Failed to download profile.';
      },
    });
  }

  loadTags(): void {
    this.candidateProfileService.getTags(this.candidateProfileId).subscribe({
      next: (response) => {
        this.tags = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.tags = [];
      },
    });
  }

  filterTagSuggestions(event: AutoCompleteCompleteEvent): void {
    this.candidateProfileService.getTagSuggestions(event.query).subscribe({
      next: (response) => {
        this.tagSuggestions = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.tagSuggestions = [];
      },
    });
  }

  addTag(): void {
    const tagName = this.newTagName.trim();
    if (!tagName) return;

    this.addTagError = '';
    this.addingTag = true;

    this.candidateProfileService.addTag(this.candidateProfileId, { tagName }).subscribe({
      next: (response) => {
        this.addingTag = false;
        if (response && !response.hasError) {
          this.newTagName = '';
          this.loadTags();
        } else {
          this.addTagError = response?.decentMessage || 'Failed to add tag.';
        }
      },
      error: (error) => {
        this.addingTag = false;
        this.addTagError = error?.error?.decentMessage || 'Failed to add tag.';
      },
    });
  }

  removeTag(tag: ICandidateTagResponse): void {
    this.candidateProfileService.deleteTag(this.candidateProfileId, tag.candidateTagId).subscribe({
      next: () => this.loadTags(),
      error: (error) => {
        console.error('Error removing tag:', error);
      },
    });
  }
}
