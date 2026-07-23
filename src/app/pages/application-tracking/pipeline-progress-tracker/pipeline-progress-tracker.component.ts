import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RecommendationStatusEnum, StageProgressStatusEnum } from '@app/@core/enums/recruitment.enum';
import { ICandidateRecommendationResponse } from '@app/@core/interfaces/recruitment-management/candidate-recommendation.interface';
import { IInterviewResponse } from '@app/@core/interfaces/recruitment-management/interview.interface';
import { IJobApplicationPipelineProgress, IPipelineStageProgress } from '@app/@core/interfaces/recruitment-management/pipeline-progress.interface';
import { CandidateRecommendationService } from '@app/@core/services/recruitment/candidate-recommendation/candidate-recommendation.service';
import { InterviewService } from '@app/@core/services/recruitment/interview/interview.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { ToastService } from '@app/@core/services/misc/toast.service';

interface StageEditState {
  status: StageProgressStatusEnum;
  scheduledDate: Date | null;
  meetingLink: string;
  notes: string;
}

@Component({
  selector: 'app-pipeline-progress-tracker',
  standalone: false,
  templateUrl: './pipeline-progress-tracker.component.html',
  styleUrl: './pipeline-progress-tracker.component.scss',
})
export class PipelineProgressTrackerComponent implements OnInit, OnChanges {
  constructor(
    private jobApplicationService: JobApplicationService,
    private candidateRecommendationService: CandidateRecommendationService,
    private interviewService: InterviewService,
    private toast: ToastService,
  ) {}

  @Input() jobApplicationId!: number;

  progress: IJobApplicationPipelineProgress | null = null;
  loading = true;
  loadError = '';

  statusOptions = Object.values(StageProgressStatusEnum).map((value) => ({ label: this.formatEnumLabel(value), value }));

  editingStageId: number | null = null;
  editState: StageEditState | null = null;
  saving = false;

  // Final selection recommendation (US-049)
  recommendation: ICandidateRecommendationResponse | null = null;
  recommendDialogVisible = false;
  recommendJustification = '';
  submittingRecommendation = false;

  // EP-08: interviews scheduled for this job application - not scoped per stage since the
  // schedule-interview form doesn't set PipelineStageId (soft ref, optional), so shown as one
  // flat list rather than attached to a specific stage card.
  interviews: IInterviewResponse[] = [];
  loadingInterviews = false;

  ngOnInit(): void {
    this.load();
    this.loadRecommendation();
    this.loadInterviews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobApplicationId'] && !changes['jobApplicationId'].firstChange) {
      this.load();
      this.loadRecommendation();
      this.loadInterviews();
    }
  }

  get hasInterviewStage(): boolean {
    return !!this.progress?.stages?.some((s) => (s.stageType || '').toLowerCase().includes('interview'));
  }

  loadInterviews(): void {
    if (!this.jobApplicationId) return;

    this.loadingInterviews = true;
    this.interviewService.getByJobApplication(this.jobApplicationId).subscribe({
      next: (response) => {
        this.interviews = response && !response.hasError && response.content ? response.content : [];
        this.loadingInterviews = false;
      },
      error: () => {
        this.interviews = [];
        this.loadingInterviews = false;
      },
    });
  }

  load(): void {
    if (!this.jobApplicationId) return;

    this.loading = true;
    this.loadError = '';
    this.editingStageId = null;
    this.jobApplicationService.getPipelineProgress(this.jobApplicationId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError) {
          this.progress = response.content;
        } else {
          this.loadError = response?.decentMessage || 'Failed to load pipeline tracker.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load pipeline tracker.';
      },
    });
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  startEdit(stage: IPipelineStageProgress): void {
    this.editingStageId = stage.pipelineStageId;
    this.editState = {
      status: stage.status,
      scheduledDate: stage.scheduledDate ? new Date(stage.scheduledDate) : null,
      meetingLink: stage.meetingLink || '',
      notes: stage.notes || '',
    };
  }

  cancelEdit(): void {
    this.editingStageId = null;
    this.editState = null;
  }

  saveEdit(stage: IPipelineStageProgress): void {
    if (!this.editState) return;

    this.saving = true;
    this.jobApplicationService
      .updateStageProgress(this.jobApplicationId, stage.pipelineStageId, {
        status: this.editState.status,
        scheduledDate: this.editState.scheduledDate ? this.editState.scheduledDate.toISOString() : undefined,
        meetingLink: this.editState.meetingLink || undefined,
        notes: this.editState.notes || undefined,
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          if (response && !response.hasError) {
            this.toast.success({ detail: 'Stage updated.' });
            this.load();
          } else {
            this.toast.error({ detail: response?.decentMessage || 'Failed to update stage.' });
          }
        },
        error: (error) => {
          this.saving = false;
          this.toast.error({ detail: error?.error?.decentMessage || 'Failed to update stage.' });
        },
      });
  }

  // ── Final selection recommendation (US-049) ─────────────────────

  loadRecommendation(): void {
    if (!this.jobApplicationId) return;

    this.candidateRecommendationService.getLatest(this.jobApplicationId).subscribe({
      next: (response) => {
        this.recommendation = response && !response.hasError ? response.content : null;
      },
    });
  }

  canRecommend(): boolean {
    return !this.recommendation || this.recommendation.status !== RecommendationStatusEnum.Pending;
  }

  openRecommendDialog(): void {
    this.recommendJustification = '';
    this.recommendDialogVisible = true;
  }

  confirmRecommend(): void {
    if (!this.recommendJustification.trim()) return;

    this.submittingRecommendation = true;
    this.candidateRecommendationService.create(this.jobApplicationId, { justification: this.recommendJustification.trim() }).subscribe({
      next: () => {
        this.submittingRecommendation = false;
        this.recommendDialogVisible = false;
        this.toast.success({ detail: 'Recommendation submitted for review.' });
        this.loadRecommendation();
      },
      error: (error) => {
        this.submittingRecommendation = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to submit recommendation.' });
      },
    });
  }
}
