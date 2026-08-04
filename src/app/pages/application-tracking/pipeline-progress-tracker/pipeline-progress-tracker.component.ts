import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { InterviewStatusEnum, RecommendationStatusEnum, StageProgressStatusEnum } from '@app/@core/enums/recruitment.enum';
import { ICandidateRecommendationResponse } from '@app/@core/interfaces/recruitment-management/candidate-recommendation.interface';
import { IInterviewResponse } from '@app/@core/interfaces/recruitment-management/interview.interface';
import { IJobApplicationPipelineProgress, IPipelineStageProgress } from '@app/@core/interfaces/recruitment-management/pipeline-progress.interface';
import { CandidateRecommendationService } from '@app/@core/services/recruitment/candidate-recommendation/candidate-recommendation.service';
import { InterviewService } from '@app/@core/services/recruitment/interview/interview.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';
import { Base_URL } from '@env/environment';

interface StageEditState {
  status: StageProgressStatusEnum;
  scheduledDate: Date | null;
  meetingLink: string;
  notes: string;
  score: number | null;
}

/** What the "what do I do next" banner on the parent Application Detail page needs, re-derived
 * from this tracker's own state rather than duplicating the pipeline/recommendation/interview
 * fetches up in the parent - this component already knows all of it. */
export interface IPipelineTrackerNextStepState {
  hasPipeline: boolean;
  blockingStageName: string | null;
  blockingStageIsInterview: boolean;
  pendingInterviewRound: number | null;
  hasRecommendation: boolean;
  recommendationStatus: string | null;
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
  @Input() resumeUrl?: string | null;
  @Output() nextStepStateChange = new EventEmitter<IPipelineTrackerNextStepState>();

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
        this.emitNextStepState();
      },
      error: () => {
        this.interviews = [];
        this.loadingInterviews = false;
        this.emitNextStepState();
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
        this.emitNextStepState();
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load pipeline tracker.';
        this.emitNextStepState();
      },
    });
  }

  /** Re-derives and emits the next-step summary from whatever's loaded so far - called after
   * each of the three independent fetches (stages/recommendation/interviews) settles, so the
   * parent banner updates incrementally rather than waiting on all three every time. */
  private emitNextStepState(): void {
    const blocking = this.blockingStage;
    const blockingIsInterview = !!blocking && (blocking.stageType || '').toLowerCase().includes('interview');

    this.nextStepStateChange.emit({
      hasPipeline: !!this.progress?.hasPipeline,
      blockingStageName: blocking?.stageName ?? null,
      blockingStageIsInterview: blockingIsInterview,
      pendingInterviewRound: blockingIsInterview && this.pendingInterview ? this.pendingInterview.round : null,
      hasRecommendation: !!this.recommendation,
      recommendationStatus: this.recommendation?.status ?? null,
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
      score: stage.score ?? null,
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
        scheduledDate: this.editState.scheduledDate
          ? DateTimeUtility.toLocalDateTimeString(this.editState.scheduledDate)
          : undefined,
        meetingLink: this.editState.meetingLink || undefined,
        notes: this.editState.notes || undefined,
        score: this.editState.score ?? undefined,
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
        this.emitNextStepState();
      },
    });
  }

  // Stage types that come AFTER the final-selection decision (offer/onboarding), not part of the
  // evaluation itself - mirrors PipelineStageTypes.PostDecision on the backend.
  private static readonly POST_DECISION_STAGE_TYPES = ['Offer', 'Joining', 'Onboarding'];

  // Subset of POST_DECISION_STAGE_TYPES the backend actually drives to Completed itself
  // (OfferLetterService.AcceptAsync / FinalSelectionPoolService.MarkHasJoinedAsync via
  // AutoCompleteStageByTypeAsync) - manual completion here would just race the real event and
  // leave the stage looking done before the candidate actually accepted/joined. "Joining" has no
  // such system hook, so it's left out and stays manually completable.
  private static readonly SYSTEM_MANAGED_STAGE_TYPES = ['Offer', 'Onboarding'];

  /** The mandatory evaluation stage still blocking recommendation, or null if none. */
  get blockingStage(): IPipelineStageProgress | null {
    if (!this.progress?.hasPipeline) return null;
    return (
      this.progress.stages.find(
        (s) =>
          s.isMandatory &&
          !PipelineProgressTrackerComponent.POST_DECISION_STAGE_TYPES.some((t) => t.toLowerCase() === (s.stageType || '').toLowerCase()) &&
          s.status !== StageProgressStatusEnum.Completed,
      ) || null
    );
  }

  /** Whatever's blocking the Technical Interview stage from starting (reuses blockingPriorStage
   * against that stage) - gates the Schedule Interview button. Pipelines without a
   * TechnicalInterview-typed stage aren't gated at all (nothing to block against). */
  get blockingStageBeforeInterview(): IPipelineStageProgress | null {
    const interviewStage = this.progress?.stages?.find((s) => (s.stageType || '').toLowerCase() === 'technicalinterview');
    return interviewStage ? this.blockingPriorStage(interviewStage) : null;
  }

  /** An already-scheduled round that hasn't resolved yet (Scheduled/Rescheduled). Multi-round
   * interviews are a real feature here, so this doesn't block scheduling forever - only while the
   * current round hasn't been marked Completed/Cancelled/NoShow, since scheduling another round on
   * top of an unresolved one would just double-book the candidate. */
  get pendingInterview(): IInterviewResponse | null {
    return this.interviews.find((i) => i.status === InterviewStatusEnum.Scheduled || i.status === InterviewStatusEnum.Rescheduled) || null;
  }

  get scheduleInterviewDisabled(): boolean {
    return !!this.blockingStageBeforeInterview || !!this.pendingInterview;
  }

  /** The earliest incomplete mandatory stage ahead of this one, blocking it from advancing - or null if clear. */
  blockingPriorStage(stage: IPipelineStageProgress): IPipelineStageProgress | null {
    if (!this.progress?.hasPipeline) return null;
    return (
      this.progress.stages
        .filter((s) => s.displayOrder < stage.displayOrder && s.isMandatory && s.status !== StageProgressStatusEnum.Completed)
        .sort((a, b) => a.displayOrder - b.displayOrder)[0] || null
    );
  }

  /** True for Offer/Onboarding stage cards - see SYSTEM_MANAGED_STAGE_TYPES. Disables the manual
   * Update button so HR can't mark these Completed out of step with the real event. */
  isSystemManagedStage(stage: IPipelineStageProgress): boolean {
    return PipelineProgressTrackerComponent.SYSTEM_MANAGED_STAGE_TYPES.some(
      (t) => t.toLowerCase() === (stage.stageType || '').toLowerCase(),
    );
  }

  /** Where the real completion event for a system-managed stage actually happens, shown in place
   * of the disabled Update button so HR isn't left wondering why it's greyed out. */
  systemManagedStageHint(stage: IPipelineStageProgress): string {
    switch ((stage.stageType || '').toLowerCase()) {
      case 'offer':
        return 'Completes automatically once the candidate accepts the offer letter.';
      case 'onboarding':
        return 'Completes automatically once the candidate is marked as joined (see Pre-Boarding).';
      default:
        return '';
    }
  }

  /** StageType is free text (admin-defined in the pipeline builder), so this is a substring
   * heuristic rather than an enum check - covers HrInterview/PanelInterview/ManagerInterview/etc.,
   * none of which have any dedicated backend module, so these generic fields are their only place
   * to record scheduling. TechnicalInterview is excluded on purpose: that one's scheduling is
   * already owned by the real Interview entity (Schedule Interview button, its own date/venue/
   * meeting link, feeding MarkResultAsync's auto-complete) - showing these fields too would just be
   * a second, disconnected copy of the same data. Screening/assessment/offer/onboarding stages
   * don't involve a live meeting at all, so they're excluded the same way. */
  stageNeedsScheduling(stage: IPipelineStageProgress): boolean {
    const type = (stage.stageType || '').toLowerCase();
    return type.includes('interview') && type !== 'technicalinterview';
  }

  /** MaxMarks is only ever set on assessment-type stages (written test, aptitude test, etc. -
   * the merged-in AssessmentWorkflow feature); every other stage type (Offer, Joining,
   * Onboarding, plain interviews) leaves it null, so that's the real signal for whether a
   * numeric score applies here - not stage type substring matching. */
  stageNeedsScore(stage: IPipelineStageProgress): boolean {
    return stage.maxMarks != null;
  }

  /** Required Documents is admin-entered free text (same as StageType) - matching against it
   * rather than hardcoding a stage-type list means this works for however the pipeline actually
   * labels its resume-review stage (CvScreening, ResumeReview, PhoneScreening, ...). */
  stageNeedsResumeLink(stage: IPipelineStageProgress): boolean {
    if (!this.resumeUrl) return false;
    const docs = (stage.requiredDocuments || '').toLowerCase();
    return docs.includes('resume') || docs.includes('cv');
  }

  getResumeFileUrl(): string {
    if (!this.resumeUrl) return '';
    return `${Base_URL}${this.resumeUrl.startsWith('/') ? '' : '/'}${this.resumeUrl}`;
  }

  canRecommend(): boolean {
    return !this.recommendation && !this.blockingStage;
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
