import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IInterviewRoundConfigRequest } from '@app/@core/interfaces/recruitment-management/interview-round-config.interface';
import { IScorecardLookupResponse } from '@app/@core/interfaces/recruitment-management/scorecard.interface';
import { InterviewRoundConfigService } from '@app/@core/services/recruitment/interview-round-config/interview-round-config.service';
import { ScorecardService } from '@app/@core/services/recruitment/scorecard/scorecard.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { BreadcrumbService } from '@app/@core/services';
import { ToastService } from '@app/@core/services/misc/toast.service';

interface RoundRow extends IInterviewRoundConfigRequest {
  panelistEmployeeIdsText: string;
}

@Component({
  selector: 'app-interview-round-config',
  standalone: false,
  templateUrl: './interview-round-config.component.html',
  styleUrl: './interview-round-config.component.scss',
})
export class InterviewRoundConfigComponent implements OnInit {
  constructor(
    private interviewRoundConfigService: InterviewRoundConfigService,
    private scorecardService: ScorecardService,
    private jobVacancyService: JobVacancyService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  jobPostingId!: number;
  jobPostingTitle = '';
  scorecardOptions: IScorecardLookupResponse[] = [];
  rounds: RoundRow[] = [];

  loading = false;
  saving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('jobPostingId');
      if (!idParam) {
        this.router.navigate(['/job-vacancy/job-vacancy-list']);
        return;
      }
      this.jobPostingId = +idParam;
      this.loadJobPosting();
      this.loadRounds();
    });

    this.scorecardService.getLookup().subscribe({
      next: (response) => {
        this.scorecardOptions = !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/job-vacancy/job-vacancy-list' },
      { title: 'Job Vacancies', icon: 'fa-solid fa-list', href: '/job-vacancy/job-vacancy-list' },
      {
        title: this.jobPostingTitle ? `Interview Rounds - ${this.jobPostingTitle}` : 'Interview Rounds',
        icon: 'fa-solid fa-layer-group',
        href: `/interviews/interview-round-config/${this.jobPostingId}`,
      },
    ]);
  }

  private loadJobPosting(): void {
    this.jobVacancyService.getJobVacancyById(this.jobPostingId).subscribe({
      next: (response) => {
        this.jobPostingTitle = !response.hasError && response.content ? response.content.title : '';
        this.setBreadcrumbs();
        this.cdr.detectChanges();
      },
    });
  }

  private loadRounds(): void {
    this.loading = true;
    this.interviewRoundConfigService.getAllByJobPosting(this.jobPostingId).subscribe({
      next: (response) => {
        const rounds = !response.hasError && response.content ? response.content : [];
        this.rounds = rounds
          .sort((a, b) => a.sequence - b.sequence)
          .map((r) => ({
            interviewRoundConfigId: r.interviewRoundConfigId,
            name: r.name,
            sequence: r.sequence,
            scorecardId: r.scorecardId,
            panelistEmployeeIds: r.panelistEmployeeIds,
            panelistEmployeeIdsText: r.panelistEmployeeIds.join(', '),
          }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.rounds = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  addRound(): void {
    this.rounds.push({
      interviewRoundConfigId: null,
      name: '',
      sequence: this.rounds.length + 1,
      scorecardId: null,
      panelistEmployeeIds: [],
      panelistEmployeeIdsText: '',
    });
  }

  removeRound(index: number): void {
    this.rounds.splice(index, 1);
    this.rounds.forEach((r, i) => (r.sequence = i + 1));
  }

  moveUp(index: number): void {
    if (index === 0) return;
    [this.rounds[index - 1], this.rounds[index]] = [this.rounds[index], this.rounds[index - 1]];
    this.rounds.forEach((r, i) => (r.sequence = i + 1));
  }

  moveDown(index: number): void {
    if (index === this.rounds.length - 1) return;
    [this.rounds[index], this.rounds[index + 1]] = [this.rounds[index + 1], this.rounds[index]];
    this.rounds.forEach((r, i) => (r.sequence = i + 1));
  }

  private parsePanelistIds(text: string): number[] {
    return text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => +s)
      .filter((n) => !isNaN(n));
  }

  private hasInvalidRounds(): boolean {
    return this.rounds.some((r) => !r.name || !r.name.trim());
  }

  save(): void {
    this.errorMessage = '';

    if (this.hasInvalidRounds()) {
      this.errorMessage = 'Every round needs a name.';
      return;
    }

    this.saving = true;
    this.interviewRoundConfigService
      .replace(this.jobPostingId, {
        rounds: this.rounds.map((r) => ({
          interviewRoundConfigId: r.interviewRoundConfigId,
          name: r.name,
          sequence: r.sequence,
          scorecardId: r.scorecardId,
          panelistEmployeeIds: this.parsePanelistIds(r.panelistEmployeeIdsText),
        })),
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          if (response && !response.hasError) {
            this.toast.success({ detail: 'Interview rounds saved.' });
            this.loadRounds();
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to save interview rounds.';
          }
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error?.error?.decentMessage || 'Failed to save interview rounds.';
        },
      });
  }
}
