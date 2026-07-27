import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IInterviewResponse } from '@app/@core/interfaces/recruitment-management/interview.interface';
import { IJobApplicationDetail } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { IScorecardLookupResponse, IScorecardResponse } from '@app/@core/interfaces/recruitment-management/scorecard.interface';
import { InterviewService } from '@app/@core/services/recruitment/interview/interview.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { ScorecardService } from '@app/@core/services/recruitment/scorecard/scorecard.service';
import { InterviewEvaluationService } from '@app/@core/services/recruitment/interview-evaluation/interview-evaluation.service';
import { BreadcrumbService } from '@app/@core/services';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { Base_URL } from '@env/environment';

interface CriterionScoreRow {
  scorecardCriterionId: number;
  name: string;
  weight: number;
  maxScore: number;
  score: number | null;
}

@Component({
  selector: 'app-evaluate-interview',
  standalone: false,
  templateUrl: './evaluate-interview.component.html',
  styleUrl: './evaluate-interview.component.scss',
})
export class EvaluateInterviewComponent implements OnInit {
  constructor(
    private interviewService: InterviewService,
    private jobApplicationService: JobApplicationService,
    private scorecardService: ScorecardService,
    private interviewEvaluationService: InterviewEvaluationService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  interviewId!: number;
  interview: IInterviewResponse | null = null;
  jobApplication: IJobApplicationDetail | null = null;
  scorecardOptions: IScorecardLookupResponse[] = [];
  selectedScorecard: IScorecardResponse | null = null;

  selectedEmployeeId: number | null = null;
  selectedScorecardId: number | null = null;
  scoreRows: CriterionScoreRow[] = [];
  overallComments = '';

  loading = false;
  scorecardLoading = false;
  saving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/interviews/interview-list']);
        return;
      }
      this.interviewId = +idParam;
      this.loadInterview();
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
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/interviews/interview-list' },
      { title: 'Interviews', icon: 'fa-solid fa-people-arrows', href: '/interviews/interview-list' },
      { title: this.interview?.candidateName || 'Evaluate', icon: 'fa-solid fa-star', href: `/interviews/interview/${this.interviewId}/evaluate` },
    ]);
  }

  private loadInterview(): void {
    this.loading = true;
    this.interviewService.getById(this.interviewId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.interview = response.content;
          this.loadJobApplication(this.interview.jobApplicationId);
        } else {
          this.router.navigate(['/interviews/interview-list']);
        }
        this.setBreadcrumbs();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/interviews/interview-list']);
      },
    });
  }

  private loadJobApplication(jobApplicationId: number): void {
    this.jobApplicationService.getDetail(jobApplicationId).subscribe({
      next: (response) => {
        this.jobApplication = !response.hasError && response.content ? response.content : null;
        this.cdr.detectChanges();
      },
    });
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '';
    return `${Base_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  onScorecardChange(): void {
    this.scoreRows = [];
    this.selectedScorecard = null;
    if (!this.selectedScorecardId) {
      return;
    }
    this.scorecardLoading = true;
    this.scorecardService.getById(this.selectedScorecardId).subscribe({
      next: (response) => {
        this.scorecardLoading = false;
        if (response && !response.hasError && response.content) {
          this.selectedScorecard = response.content;
          this.scoreRows = response.content.criteria
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((c) => ({
              scorecardCriterionId: c.scorecardCriterionId,
              name: c.name,
              weight: c.weight,
              maxScore: c.maxScore,
              score: null,
            }));
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.scorecardLoading = false;
      },
    });
  }

  get canSubmit(): boolean {
    return (
      !!this.selectedEmployeeId &&
      !!this.selectedScorecardId &&
      this.scoreRows.length > 0 &&
      this.scoreRows.every((r) => r.score !== null && r.score >= 0 && r.score <= r.maxScore) &&
      !this.saving
    );
  }

  submit(): void {
    if (!this.canSubmit || !this.selectedEmployeeId || !this.selectedScorecardId) {
      return;
    }

    this.errorMessage = '';
    this.saving = true;
    this.interviewEvaluationService
      .submit(this.interviewId, {
        employeeId: this.selectedEmployeeId,
        scorecardId: this.selectedScorecardId,
        scores: this.scoreRows.map((r) => ({ scorecardCriterionId: r.scorecardCriterionId, score: r.score as number })),
        overallComments: this.overallComments || null,
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          if (response && !response.hasError) {
            this.toast.success({ detail: 'Evaluation submitted.' });
            this.router.navigate(['/interviews/interview', this.interviewId, 'results']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to submit evaluation.';
          }
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error?.error?.decentMessage || 'Failed to submit evaluation.';
        },
      });
  }
}
