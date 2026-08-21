import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICandidateProfileSummaryResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { ITalentPoolDetailResponse } from '@app/@core/interfaces/recruitment-management/talent-pool.interface';
import { TalentPoolService } from '@app/@core/services/recruitment/talent-pool/talent-pool.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { JobStatusEnum } from '@app/@core/enums/recruitment.enum';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-talent-pool-detail',
  standalone: false,
  templateUrl: './talent-pool-detail.component.html',
  styleUrl: './talent-pool-detail.component.scss',
})
export class TalentPoolDetailComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private talentPoolService: TalentPoolService,
    private jobVacancyService: JobVacancyService,
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  talentPoolId!: number;
  pool: ITalentPoolDetailResponse | null = null;
  loading = true;
  loadError = '';

  selectedCandidateIds: number[] = [];

  openVacancies: IJobVacancyResponse[] = [];
  showFastTrackDialog = false;
  selectedJobPostingId: number | null = null;
  fastTracking = false;
  fastTrackError = '';
  fastTrackResult: { fastTrackedCount: number; alreadyAppliedCount: number; skippedCount: number } | null = null;

  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    // Subscribed rather than a one-time snapshot read - RouteReusableStrategy reuses this
    // component instance across navigations between two talent-pool ids.
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.talentPoolId = Number(params.get('id'));
      this.breadcrumbService.setBreadcrumbs([
        { title: 'Talent Pools', icon: 'fa-solid fa-users', href: '/talent-pools' },
        { title: 'Pool Detail', icon: 'fa-solid fa-users', href: `/talent-pools/talent-pool-detail/${this.talentPoolId}` },
      ]);
      this.loadPool();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadPool(): void {
    this.loading = true;
    this.loadError = '';
    this.selectedCandidateIds = [];

    this.talentPoolService.getById(this.talentPoolId).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.hasError && response.content) {
          this.pool = response.content;
        } else {
          this.loadError = response.decentMessage || 'Failed to load talent pool.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load talent pool.';
        this.cdr.detectChanges();
      },
    });
  }

  isSelected(candidateProfileId: number): boolean {
    return this.selectedCandidateIds.includes(candidateProfileId);
  }

  toggleSelection(candidateProfileId: number): void {
    this.selectedCandidateIds = this.isSelected(candidateProfileId)
      ? this.selectedCandidateIds.filter((id) => id !== candidateProfileId)
      : [...this.selectedCandidateIds, candidateProfileId];
  }

  toggleSelectAll(candidates: ICandidateProfileSummaryResponse[]): void {
    this.selectedCandidateIds = this.selectedCandidateIds.length === candidates.length ? [] : candidates.map((c) => c.candidateProfileId);
  }

  removeCandidate(candidate: ICandidateProfileSummaryResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Remove ${candidate.fullName} from this pool?`,
      header: 'Remove Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.talentPoolService.removeCandidate(this.talentPoolId, candidate.candidateProfileId).subscribe({
          next: () => this.loadPool(),
          error: (error) => console.error('Error removing candidate from pool:', error),
        });
      },
    });
  }

  openFastTrackDialog(): void {
    this.fastTrackError = '';
    this.fastTrackResult = null;
    this.selectedJobPostingId = null;
    this.showFastTrackDialog = true;

    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.openVacancies = !response.hasError && response.content ? response.content.filter((v) => v.status === JobStatusEnum.Open) : [];
        this.selectedJobPostingId = this.pool?.jobPostingId ?? null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.openVacancies = [];
        this.cdr.detectChanges();
      },
    });
  }

  fastTrack(): void {
    if (!this.selectedJobPostingId || this.selectedCandidateIds.length === 0) return;

    this.fastTracking = true;
    this.fastTrackError = '';

    this.talentPoolService
      .fastTrack({ candidateProfileIds: this.selectedCandidateIds, jobPostingId: this.selectedJobPostingId })
      .subscribe({
        next: (response) => {
          this.fastTracking = false;
          if (!response.hasError && response.content) {
            this.fastTrackResult = response.content;
            this.selectedCandidateIds = [];
          } else {
            this.fastTrackError = response.decentMessage || 'Failed to fast-track candidates.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.fastTracking = false;
          this.fastTrackError = error?.error?.decentMessage || 'Failed to fast-track candidates.';
          this.cdr.detectChanges();
        },
      });
  }
}
