import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICandidateProfileDetailResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { BreadcrumbService } from '@app/@core/services';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-candidate-detail',
  standalone: false,
  templateUrl: './candidate-detail.component.html',
  styleUrl: './candidate-detail.component.scss',
})
export class CandidateDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private candidateProfileService: CandidateProfileService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  candidateProfileId!: number;
  profile: ICandidateProfileDetailResponse | null = null;
  loading = true;
  loadError = '';

  hrNotes = '';
  savingNotes = false;
  notesSaveError = '';
  notesSaveSuccess = false;

  ngOnInit(): void {
    this.candidateProfileId = Number(this.route.snapshot.paramMap.get('id'));
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Candidates', icon: 'fa-solid fa-users', href: '/candidates' },
      { title: 'Candidate Profile', icon: 'fa-solid fa-id-card', href: `/candidates/${this.candidateProfileId}` },
    ]);
    this.loadProfile();
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
}
