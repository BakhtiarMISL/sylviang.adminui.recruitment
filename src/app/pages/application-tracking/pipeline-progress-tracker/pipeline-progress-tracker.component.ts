import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { InterviewStatusEnum, StageProgressStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IInterviewResponse } from '@app/@core/interfaces/recruitment-management/interview.interface';
import { IJobApplicationPipelineProgress, IPipelineStageProgress } from '@app/@core/interfaces/recruitment-management/pipeline-progress.interface';
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
 * from this tracker's own state rather than duplicating the pipeline/interview fetches up in the
 * parent - this component already knows all of it. */
export interface IPipelineTrackerNextStepState {
  hasPipeline: boolean;
  blockingStageName: string | null;
  blockingStageIsInterview: boolean;
  blockingStageIsExam: boolean;
  pendingInterviewRound: number | null;
  allStagesCompleted: boolean;
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

  // Stage cards are dense (description + passing criteria + required documents + duration, on
  // top of the action area) - collapsed by default so the card reads as name/status/action at a
  // glance, expandable per-card when HR actually needs the spec text.
  expandedStageIds = new Set<number>();

  toggleStageDetails(stage: IPipelineStageProgress): void {
    if (this.expandedStageIds.has(stage.pipelineStageId)) {
      this.expandedStageIds.delete(stage.pipelineStageId);
    } else {
      this.expandedStageIds.add(stage.pipelineStageId);
    }
  }

  isStageExpanded(stage: IPipelineStageProgress): boolean {
    return this.expandedStageIds.has(stage.pipelineStageId);
  }

  // EP-08: interviews scheduled for this job application, scoped per stage card via
  // interview.pipelineStageId - every interview-type stage now schedules through this same
  // Interview entity (not just the old TechnicalInterview-only flow), so each card filters down
  // to its own rounds instead of showing one flat list.
  interviews: IInterviewResponse[] = [];
  loadingInterviews = false;

  ngOnInit(): void {
    this.load();
    this.loadInterviews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobApplicationId'] && !changes['jobApplicationId'].firstChange) {
      this.load();
      this.loadInterviews();
    }
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
   * each of the two independent fetches (stages/interviews) settles, so the parent banner
   * updates incrementally rather than waiting on both every time. */
  private emitNextStepState(): void {
    const blocking = this.blockingStage;
    const blockingIsInterview = !!blocking && (blocking.stageType || '').toLowerCase().includes('interview');

    this.nextStepStateChange.emit({
      hasPipeline: !!this.progress?.hasPipeline,
      blockingStageName: blocking?.stageName ?? null,
      blockingStageIsInterview: blockingIsInterview,
      blockingStageIsExam: !!blocking && this.isExamDrivenStage(blocking),
      pendingInterviewRound: blockingIsInterview ? this.pendingInterviewForStage(blocking)?.round ?? null : null,
      allStagesCompleted: !!this.progress?.hasPipeline && !blocking,
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

  /** Interviews scheduled specifically for this stage card - every interview-type stage now goes
   * through the same Interview entity, tagged with the PipelineStageId it was scheduled for. */
  interviewsForStage(stage: IPipelineStageProgress): IInterviewResponse[] {
    return this.interviews.filter((i) => i.pipelineStageId === stage.pipelineStageId);
  }

  /** An already-scheduled round for THIS stage that hasn't resolved yet (Scheduled/Rescheduled).
   * Multi-round interviews are a real feature here, so this doesn't block scheduling forever -
   * only while the current round hasn't been marked Completed/Cancelled/NoShow, since scheduling
   * another round on top of an unresolved one would just double-book the candidate. */
  pendingInterviewForStage(stage: IPipelineStageProgress): IInterviewResponse | null {
    return (
      this.interviewsForStage(stage).find((i) => i.status === InterviewStatusEnum.Scheduled || i.status === InterviewStatusEnum.Rescheduled) ||
      null
    );
  }

  scheduleInterviewDisabled(stage: IPipelineStageProgress): boolean {
    return !!this.blockingPriorStage(stage) || !!this.pendingInterviewForStage(stage);
  }

  scheduleExamDisabled(stage: IPipelineStageProgress): boolean {
    return !!this.blockingPriorStage(stage);
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

  /** Whether this stage schedules/tracks through the real Interview entity (Schedule Interview
   * link, its own date/venue/meeting link, feeding MarkResultAsync's auto-complete) rather than
   * a manual date/score box - covers TechnicalInterview/HrInterview/PanelInterview/ManagerInterview/
   * etc, any stage type whose name contains "interview". */
  isInterviewStage(stage: IPipelineStageProgress): boolean {
    return (stage.stageType || '').toLowerCase().includes('interview');
  }

  /** Whether this stage's own manual "Scheduled Date" / "Meeting Link" fields apply - stages that
   * already schedule through a real module (Interview entity, Exams) don't need a second,
   * disconnected copy of the same data, and post-decision stages (Offer/Joining/Onboarding) don't
   * involve a live meeting at all. Everything else (SalaryNegotiation, ReferenceCheck,
   * BackgroundVerification, MedicalExamination, PhoneScreening, GroupDiscussion, ...) has no
   * dedicated backend module, so these generic fields are their only place to record scheduling. */
  stageNeedsScheduling(stage: IPipelineStageProgress): boolean {
    if (this.isInterviewStage(stage) || this.isExamDrivenStage(stage)) return false;
    const type = (stage.stageType || '').toLowerCase();
    return !PipelineProgressTrackerComponent.POST_DECISION_STAGE_TYPES.some((t) => t.toLowerCase() === type);
  }

  /** MaxMarks is only ever set on assessment-type stages (written test, aptitude test, etc. -
   * the merged-in AssessmentWorkflow feature); every other stage type (Offer, Joining,
   * Onboarding, plain interviews) leaves it null, so that's the real signal for whether a
   * numeric score applies here - not stage type substring matching. */
  stageNeedsScore(stage: IPipelineStageProgress): boolean {
    return stage.maxMarks != null;
  }

  // Mirrors JobApplicationStageProgressService.TechnicalAssessmentStageTypeAliases on the
  // backend - that service already auto-completes a stage of one of these types (score +
  // Completed status, LastUpdatedByUserName "system:exam-score") the moment an ExamEnrollment
  // tied to this candidate gets scored. The manual Update box below stays enabled regardless
  // (not every assessment stage is a formal system-run exam - paper tests, take-homes, etc.
  // have no other way to record a score), this hint just points HR at the system-backed path
  // first so a real exam isn't silently skipped in favor of typing a number in by hand.
  private static readonly EXAM_DRIVEN_STAGE_TYPES = [
    'technicalassessment', 'onlinetest', 'codingtest', 'writtentest', 'aptitudetest', 'psychometrictest', 'practicalassessment',
  ];

  isExamDrivenStage(stage: IPipelineStageProgress): boolean {
    return PipelineProgressTrackerComponent.EXAM_DRIVEN_STAGE_TYPES.includes((stage.stageType || '').toLowerCase());
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
}
