import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IInterviewResponse } from '@app/@core/interfaces/recruitment-management/interview.interface';
import { IInterviewEvaluationResponse } from '@app/@core/interfaces/recruitment-management/interview-evaluation.interface';
import { InterviewService } from '@app/@core/services/recruitment/interview/interview.service';
import { InterviewEvaluationService } from '@app/@core/services/recruitment/interview-evaluation/interview-evaluation.service';
import { BreadcrumbService } from '@app/@core/services';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';

@Component({
  selector: 'app-interview-results',
  standalone: false,
  templateUrl: './interview-results.component.html',
  styleUrl: './interview-results.component.scss',
})
export class InterviewResultsComponent implements OnInit {
  constructor(
    private interviewService: InterviewService,
    private interviewEvaluationService: InterviewEvaluationService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  interviewId!: number;
  interview: IInterviewResponse | null = null;
  evaluations: IInterviewEvaluationResponse[] = [];
  loading = false;
  exporting = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/interviews/interview-list']);
        return;
      }
      this.interviewId = +idParam;
      this.loadInterview();
      this.loadEvaluations();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/interviews/interview-list' },
      { title: 'Interviews', icon: 'fa-solid fa-people-arrows', href: '/interviews/interview-list' },
      { title: this.interview?.candidateName || 'Results', icon: 'fa-solid fa-chart-simple', href: `/interviews/interview/${this.interviewId}/results` },
    ]);
  }

  private loadInterview(): void {
    this.interviewService.getById(this.interviewId).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.interview = response.content;
        }
        this.setBreadcrumbs();
        this.cdr.detectChanges();
      },
    });
  }

  private loadEvaluations(): void {
    this.loading = true;
    this.interviewEvaluationService.getByInterview(this.interviewId).subscribe({
      next: (response) => {
        this.evaluations = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.evaluations = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  averageWeightedScore(): number {
    if (this.evaluations.length === 0) return 0;
    return this.evaluations.reduce((sum, e) => sum + e.weightedScore, 0) / this.evaluations.length;
  }

  exportExcel(): void {
    this.exporting = true;
    this.interviewEvaluationService.exportResultsExcel(this.interviewId).subscribe({
      next: (response) => {
        this.exporting = false;
        saveFileResponse(response, `interview-${this.interviewId}-evaluation-results.xlsx`);
      },
      error: () => {
        this.exporting = false;
        this.toast.error({ detail: 'Failed to export evaluation results.' });
      },
    });
  }
}
