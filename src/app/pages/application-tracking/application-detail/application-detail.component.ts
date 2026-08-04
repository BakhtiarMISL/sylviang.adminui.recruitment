import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationStatusEnum, OfferLetterStatusEnum, RecommendationStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IApplicationStatusReason, IJobApplicationDetail } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { CandidateRecommendationService } from '@app/@core/services/recruitment/candidate-recommendation/candidate-recommendation.service';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
import { BreadcrumbService } from '@app/@core/services';
import { Base_URL } from '@env/environment';
import { ApplicationStatusOptions, ApplicationStatusTransitions, StatusesRequiringReason } from '../application-status-transitions.constants';
import { IPipelineTrackerNextStepState } from '../pipeline-progress-tracker/pipeline-progress-tracker.component';

type NextStepTone = 'info' | 'warning' | 'success' | 'danger' | 'neutral';

interface NextStep {
  text: string;
  tone: NextStepTone;
  icon: string;
}

type StepState = 'done' | 'current' | 'upcoming';

// Matching pair per tone: outer card background/border, and icon/text accent color - kept as one
// table so a new tone can't accidentally end up with a card/icon color mismatch.
const NEXT_STEP_TONE_CLASSES: Record<NextStepTone, { card: string; accent: string }> = {
  info: { card: 'bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800', accent: 'text-info-600 dark:text-info-400' },
  warning: { card: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800', accent: 'text-warning-700 dark:text-warning-400' },
  success: { card: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800', accent: 'text-success-700 dark:text-success-400' },
  danger: { card: 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800', accent: 'text-danger-600 dark:text-danger-400' },
  neutral: { card: 'bg-light dark:bg-white/5 border-borderLight dark:border-borderDark', accent: 'text-neutral dark:text-white/70' },
};

@Component({
  selector: 'app-application-detail',
  standalone: false,
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss',
})
export class ApplicationDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobApplicationService: JobApplicationService,
    private candidateRecommendationService: CandidateRecommendationService,
    private offerLetterService: OfferLetterService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  jobApplicationId!: number;
  application: IJobApplicationDetail | null = null;
  loading = true;
  loadError = '';

  // Mirrors offer-letter-form.component.ts's own gate - shown here too so HR sees the button is
  // blocked before clicking through into the form, not after.
  recommendationAccepted: boolean | null = null;

  // Mirrors medical-letter-form.component.ts's / target-letter-form.component.ts's own gate -
  // same reasoning as recommendationAccepted above.
  offerLetterAccepted: boolean | null = null;

  // Whether ANY offer letter has been generated yet (regardless of status) - separate from
  // offerLetterAccepted above, needed to tell "not generated yet" apart from "generated, waiting
  // on candidate" in the next-step banner.
  hasOfferLetter = false;

  // Fed by app-pipeline-progress-tracker's (nextStepStateChange) output - that component already
  // loads stages/recommendation/interviews, no reason to re-fetch any of it up here.
  trackerState: IPipelineTrackerNextStepState | null = null;

  nextStatusOptions: { label: string; value: ApplicationStatusEnum }[] = [];
  selectedNextStatus: ApplicationStatusEnum | null = null;
  reasonOptions: IApplicationStatusReason[] = [];
  selectedReasonId: number | null = null;
  note = '';
  updating = false;
  updateError = '';
  updateSuccess = false;

  ngOnInit(): void {
    this.jobApplicationId = Number(this.route.snapshot.paramMap.get('id'));
    this.breadcrumbService.setBreadcrumbs([
      { title: 'ATS Dashboard', icon: 'fa-solid fa-list-check', href: '/applications' },
      { title: 'Application Detail', icon: 'fa-solid fa-file-lines', href: `/applications/${this.jobApplicationId}` },
    ]);
    this.loadApplication();
    this.loadRecommendation();
    this.loadOfferLetterStatus();
  }

  private loadRecommendation(): void {
    this.candidateRecommendationService.getLatest(this.jobApplicationId).subscribe({
      next: (response) => {
        const recommendation = response && !response.hasError ? response.content : null;
        this.recommendationAccepted = recommendation?.status === RecommendationStatusEnum.Accepted;
      },
      error: () => {
        this.recommendationAccepted = false;
      },
    });
  }

  private loadOfferLetterStatus(): void {
    this.offerLetterService.getAll(this.jobApplicationId).subscribe({
      next: (response) => {
        const offerLetters = response && !response.hasError && response.content ? response.content : [];
        this.hasOfferLetter = offerLetters.length > 0;
        this.offerLetterAccepted = offerLetters.some((o) => o.status === OfferLetterStatusEnum.Accepted);
      },
      error: () => {
        this.hasOfferLetter = false;
        this.offerLetterAccepted = false;
      },
    });
  }

  onTrackerStateChange(state: IPipelineTrackerNextStepState): void {
    this.trackerState = state;
  }

  goToGenerateOfferLetter(): void {
    if (!this.recommendationAccepted) return;
    this.router.navigate(['/document-management/manage-offer-letter'], { queryParams: { jobApplicationId: this.jobApplicationId } });
  }

  goToGenerateMedicalLetter(): void {
    if (!this.offerLetterAccepted) return;
    this.router.navigate(['/document-management/manage-medical-letter'], { queryParams: { jobApplicationId: this.jobApplicationId } });
  }

  goToGenerateTargetLetter(): void {
    if (!this.offerLetterAccepted) return;
    this.router.navigate(['/document-management/manage-target-letter'], { queryParams: { jobApplicationId: this.jobApplicationId } });
  }

  loadApplication(): void {
    this.loading = true;
    this.loadError = '';
    this.jobApplicationService.getDetail(this.jobApplicationId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.application = response.content;
          this.nextStatusOptions = (ApplicationStatusTransitions[this.application.applicationStatus] || []).map((value) => ({
            label: ApplicationStatusOptions.find((o) => o.value === value)?.label || value,
            value,
          }));
        } else {
          this.loadError = response?.decentMessage || 'Failed to load application.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load application.';
      },
    });
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '';
    return `${Base_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  onNextStatusChange(status: ApplicationStatusEnum | null): void {
    this.selectedReasonId = null;
    this.reasonOptions = [];

    if (status && StatusesRequiringReason.includes(status)) {
      this.jobApplicationService.getStatusReasons(status).subscribe({
        next: (response) => {
          this.reasonOptions = response && !response.hasError && response.content ? response.content : [];
        },
      });
    }
  }

  requiresReason(): boolean {
    return !!this.selectedNextStatus && StatusesRequiringReason.includes(this.selectedNextStatus);
  }

  canUpdateStatus(): boolean {
    if (!this.selectedNextStatus) return false;
    return !this.requiresReason() || !!this.selectedReasonId;
  }

  updateStatus(): void {
    if (!this.selectedNextStatus) return;

    this.updating = true;
    this.updateError = '';
    this.updateSuccess = false;

    this.jobApplicationService
      .updateStatus(this.jobApplicationId, {
        toStatus: this.selectedNextStatus,
        reasonId: this.selectedReasonId ?? undefined,
        note: this.note || undefined,
      })
      .subscribe({
        next: () => {
          this.updating = false;
          this.updateSuccess = true;
          this.selectedNextStatus = null;
          this.selectedReasonId = null;
          this.note = '';
          this.loadApplication();
        },
        error: (error) => {
          this.updating = false;
          this.updateError = error?.error?.decentMessage || 'Failed to update status.';
        },
      });
  }

  // ── Next-step guidance banner ───────────────────────────────────────
  // Single source of truth for "what do I click next" - reads only state this component and
  // app-pipeline-progress-tracker already fetch for their own controls, so this can never say
  // something the buttons above/below it disagree with.

  private static readonly TERMINAL_STATUSES = [
    ApplicationStatusEnum.Hired,
    ApplicationStatusEnum.Rejected,
    ApplicationStatusEnum.Withdrawn,
    ApplicationStatusEnum.DuplicateDismissed,
  ];

  get isTerminalStatus(): boolean {
    return !!this.application && ApplicationDetailComponent.TERMINAL_STATUSES.includes(this.application.applicationStatus);
  }

  get nextStep(): NextStep {
    if (!this.application) return { text: '', tone: 'neutral', icon: 'fa-circle-notch' };

    switch (this.application.applicationStatus) {
      case ApplicationStatusEnum.Hired:
        return { text: 'Hired — application complete, no further action needed.', tone: 'success', icon: 'fa-circle-check' };
      case ApplicationStatusEnum.Rejected:
        return { text: 'Rejected — no further action needed.', tone: 'danger', icon: 'fa-circle-xmark' };
      case ApplicationStatusEnum.Withdrawn:
        return { text: 'Withdrawn by the candidate — no further action needed.', tone: 'neutral', icon: 'fa-circle-info' };
      case ApplicationStatusEnum.DuplicateDismissed:
        return { text: 'Marked as a duplicate — no further action needed.', tone: 'neutral', icon: 'fa-circle-info' };
    }

    const t = this.trackerState;

    if (t?.hasPipeline && t.blockingStageName) {
      if (t.blockingStageIsInterview) {
        return t.pendingInterviewRound
          ? { text: `Waiting: Round ${t.pendingInterviewRound} interview is scheduled — mark its result once it's done.`, tone: 'warning', icon: 'fa-hourglass-half' }
          : { text: `Next: Schedule an interview for the '${t.blockingStageName}' stage.`, tone: 'info', icon: 'fa-arrow-right-long' };
      }
      return { text: `Next: Complete the '${t.blockingStageName}' stage — click Update on that stage card below.`, tone: 'info', icon: 'fa-arrow-right-long' };
    }

    if (t?.hasPipeline && !t.hasRecommendation) {
      return { text: 'Next: Recommend this candidate for Final Selection.', tone: 'info', icon: 'fa-arrow-right-long' };
    }
    if (t?.recommendationStatus === 'Pending') {
      return { text: 'Waiting: the Final Selection recommendation is pending review.', tone: 'warning', icon: 'fa-hourglass-half' };
    }
    if (t?.recommendationStatus === 'Rejected') {
      return { text: 'Final Selection recommendation was rejected — decide the next status below.', tone: 'danger', icon: 'fa-circle-xmark' };
    }

    if (this.recommendationAccepted) {
      if (!this.hasOfferLetter) {
        return { text: 'Next: Generate the Offer Letter.', tone: 'info', icon: 'fa-arrow-right-long' };
      }
      if (!this.offerLetterAccepted) {
        return { text: "Waiting: candidate hasn't accepted the offer letter yet.", tone: 'warning', icon: 'fa-hourglass-half' };
      }
      return { text: 'Next: Generate the Medical Letter and Target Letter, then move status to Hired below.', tone: 'info', icon: 'fa-arrow-right-long' };
    }

    return { text: 'Next: use Update Status below to move this application forward.', tone: 'info', icon: 'fa-arrow-right-long' };
  }

  get nextStepClasses(): { card: string; accent: string } {
    return NEXT_STEP_TONE_CLASSES[this.nextStep.tone];
  }

  /** True once every mandatory pre-decision pipeline stage (which includes any interview-type
   * stage) is Completed - the interview categorically already happened at that point, even if
   * the live Interview entity's own status still reads "Scheduled" from an earlier round that
   * got superseded. Offer/Onboarding stages don't count (blockingStage already excludes them). */
  private get interviewStageCleared(): boolean {
    const t = this.trackerState;
    return !!t && t.hasPipeline && !t.blockingStageName;
  }

  /** One evidence check per forward hop, keyed by the status it fires FROM. Deliberately only
   * ever suggests the SINGLE next hop, never skips ahead even when evidence supports a much
   * later status (e.g. offer already accepted but current status is still Shortlisted) - HR
   * still has to walk the dropdown one real milestone at a time, same as the backend enforces,
   * so the suggestion does the same walk instead of trying to jump straight to the end. Applied
   * is deliberately excluded: its two legal forward hops (Screening or Shortlisted) are a genuine
   * either/or in this workflow that nothing here can safely pick between. */
  private get forwardHopEvidence(): Partial<Record<ApplicationStatusEnum, { hop: ApplicationStatusEnum; reached: boolean }>> {
    return {
      [ApplicationStatusEnum.Screening]: { hop: ApplicationStatusEnum.Shortlisted, reached: !!this.trackerState?.hasPipeline },
      [ApplicationStatusEnum.Shortlisted]: {
        hop: ApplicationStatusEnum.InterviewScheduled,
        reached: !!this.trackerState?.pendingInterviewRound || this.interviewStageCleared,
      },
      [ApplicationStatusEnum.InterviewScheduled]: { hop: ApplicationStatusEnum.Interviewed, reached: this.interviewStageCleared },
      [ApplicationStatusEnum.Interviewed]: { hop: ApplicationStatusEnum.Offered, reached: this.hasOfferLetter },
      [ApplicationStatusEnum.Offered]: { hop: ApplicationStatusEnum.Hired, reached: !!this.offerLetterAccepted },
    };
  }

  get suggestedStatus(): ApplicationStatusEnum | null {
    if (!this.application || this.isTerminalStatus) return null;
    const entry = this.forwardHopEvidence[this.application.applicationStatus];
    return entry?.reached ? entry.hop : null;
  }

  get suggestedStatusLabel(): string {
    const status = this.suggestedStatus;
    return status ? ApplicationStatusOptions.find((o) => o.value === status)?.label || status : '';
  }

  /** None of the statuses ever suggested here (Hired/Offered/Interviewed/InterviewScheduled) are
   * in StatusesRequiringReason, so this can fire straight through updateStatus() without opening
   * the Reason field the manual dropdown flow needs for Rejected/Withdrawn. */
  applySuggestedStatus(): void {
    const suggested = this.suggestedStatus;
    if (!suggested) return;
    this.selectedNextStatus = suggested;
    this.selectedReasonId = null;
    this.updateStatus();
  }

  get steps(): { label: string; state: StepState }[] {
    const t = this.trackerState;
    const stagesDone = !t || !t.hasPipeline || !t.blockingStageName;
    const recommendDone = t?.recommendationStatus === 'Accepted';
    const offerDone = this.hasOfferLetter;
    const acceptDone = !!this.offerLetterAccepted;
    const hiredDone = this.application?.applicationStatus === ApplicationStatusEnum.Hired;

    const stepState = (done: boolean, isCurrent: boolean): StepState => (done ? 'done' : isCurrent ? 'current' : 'upcoming');

    return [
      { label: 'Pipeline Stages', state: stepState(stagesDone, !stagesDone) },
      { label: 'Final Selection', state: stepState(recommendDone, stagesDone && !recommendDone) },
      { label: 'Offer Letter', state: stepState(offerDone, recommendDone && !offerDone) },
      { label: 'Offer Accepted', state: stepState(acceptDone, offerDone && !acceptDone) },
      { label: 'Hired', state: stepState(hiredDone, acceptDone && !hiredDone) },
    ];
  }
}
