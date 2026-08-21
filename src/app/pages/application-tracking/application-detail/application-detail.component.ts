import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationStatusEnum, OfferLetterStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IApplicationStatusReason, IJobApplicationDetail } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
import { BreadcrumbService } from '@app/@core/services';
import { Base_URL } from '@env/environment';
import { StatusesRequiringReason } from '../application-status-transitions.constants';
import { IPipelineTrackerNextStepState } from '../pipeline-progress-tracker/pipeline-progress-tracker.component';

type NextStepTone = 'info' | 'warning' | 'success' | 'danger' | 'neutral';

interface NextStep {
  text: string;
  tone: NextStepTone;
  icon: string;
}

type StepState = 'done' | 'current' | 'upcoming';

type DetailTab = 'pipeline' | 'documents' | 'status';

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
export class ApplicationDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly ApplicationStatusEnum = ApplicationStatusEnum;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobApplicationService: JobApplicationService,
    private offerLetterService: OfferLetterService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  jobApplicationId!: number;
  application: IJobApplicationDetail | null = null;
  loading = true;
  loadError = '';

  // Everything below the header (stage cards, doc generation, status/history) used to sit on one
  // long scroll - split into tabs so HR sees one task area at a time. Header/next-step/stepper
  // stay outside the tabs since those are "at a glance" info, not a task.
  readonly tabs: { key: DetailTab; label: string; icon: string }[] = [
    { key: 'pipeline', label: 'Pipeline Stages', icon: 'fa-solid fa-diagram-project' },
    { key: 'documents', label: 'Documents', icon: 'fa-solid fa-file-signature' },
    { key: 'status', label: 'Status & History', icon: 'fa-solid fa-clock-rotate-left' },
  ];
  activeTab: DetailTab = 'pipeline';

  // Measured from the real DOM rather than assumed-equal-width math - tab labels ("Status &
  // History" vs "Documents") aren't the same width, so a %-based indicator would land in the
  // wrong spot. Re-measured on view init and window resize; a tab switch itself doesn't move
  // any button, so it doesn't need to trigger a re-measure.
  @ViewChildren('tabBtnRef') private tabBtnEls!: QueryList<ElementRef<HTMLButtonElement>>;
  tabRects: { left: number; width: number }[] = [];

  ngAfterViewInit(): void {
    // Deferred to a macrotask (not just a microtask/Promise) in both cases - measuring
    // synchronously mutates tabRects (read by the template) after that same view has already
    // been checked, which Angular flags as NG0100 in dev mode; a Promise microtask can still
    // land inside the same zone.js task and trip the same check, setTimeout reliably lands in
    // the next one. QueryList.changes fires when the tab bar first renders (e.g. once the async
    // `application` load completes and the *ngIf reveals it) and again on any later structural
    // change, so both the initial measure and this subscription need the same deferral.
    this.tabBtnEls.changes.subscribe(() => setTimeout(() => this.measureTabs()));
    setTimeout(() => this.measureTabs());
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.measureTabs();
  }

  private measureTabs(): void {
    const els = this.tabBtnEls?.toArray() ?? [];
    if (!els.length) return;
    const barLeft = els[0].nativeElement.parentElement!.getBoundingClientRect().left;
    this.tabRects = els.map((el) => {
      const r = el.nativeElement.getBoundingClientRect();
      return { left: r.left - barLeft, width: r.width };
    });
  }

  setActiveTab(tab: DetailTab): void {
    this.activeTab = tab;
  }

  get activeTabIndex(): number {
    return this.tabs.findIndex((t) => t.key === this.activeTab);
  }

  get candidateInitials(): string {
    const name = this.application?.candidateName?.trim();
    if (!name) return '?';
    const parts = name.split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '')).toUpperCase();
  }

  // Mirrors medical-letter-form.component.ts's / target-letter-form.component.ts's own gate.
  offerLetterAccepted: boolean | null = null;

  // Whether ANY offer letter has been generated yet (regardless of status) - separate from
  // offerLetterAccepted above, needed to tell "not generated yet" apart from "generated, waiting
  // on candidate" in the next-step banner.
  hasOfferLetter = false;

  // Fed by app-pipeline-progress-tracker's (nextStepStateChange) output - that component already
  // loads stages/interviews, no reason to re-fetch any of it up here.
  trackerState: IPipelineTrackerNextStepState | null = null;

  // The only two manual status moves left for HR to make - every routine forward hop
  // (Shortlisted -> InterviewScheduled -> Interviewed -> Offered -> Hired) now auto-advances
  // server-side the moment its underlying event happens (interview scheduled, stages Completed,
  // offer generated/accepted - see InterviewService/JobApplicationStageProgressService/
  // OfferLetterService's AutoTransition helpers). Reject/Withdraw need a human judgment call and
  // a reason, so those stay manual.
  rejectWithdrawTarget: ApplicationStatusEnum.Rejected | ApplicationStatusEnum.Withdrawn | null = null;
  reasonOptions: IApplicationStatusReason[] = [];
  selectedReasonId: number | null = null;
  note = '';
  updating = false;
  updateError = '';
  updateSuccess = false;

  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    // Subscribes rather than reading route.snapshot once - RouteReusableStrategy reuses this
    // component instance when navigating between two application-detail URLs (same route,
    // different :id), so a one-time snapshot read left the page silently showing the previous
    // application's data on that navigation.
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.jobApplicationId = Number(params.get('id'));
      this.breadcrumbService.setBreadcrumbs([
        { title: 'ATS Dashboard', icon: 'fa-solid fa-list-check', href: '/applications' },
        { title: 'Application Detail', icon: 'fa-solid fa-file-lines', href: `/applications/${this.jobApplicationId}` },
      ]);
      this.loadApplication();
      this.loadOfferLetterStatus();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  // AppointmentLetterFormComponent is keyed by offerLetterId (not jobApplicationId, unlike
  // Medical/Target Letter) - needs the actual Accepted offer's id, not just a boolean.
  acceptedOfferLetterId: number | null = null;

  private loadOfferLetterStatus(): void {
    this.offerLetterService.getAll(this.jobApplicationId).subscribe({
      next: (response) => {
        const offerLetters = response && !response.hasError && response.content ? response.content : [];
        this.hasOfferLetter = offerLetters.length > 0;
        const accepted = offerLetters.find((o) => o.status === OfferLetterStatusEnum.Accepted);
        this.offerLetterAccepted = !!accepted;
        this.acceptedOfferLetterId = accepted?.offerLetterId ?? null;
      },
      error: () => {
        this.hasOfferLetter = false;
        this.offerLetterAccepted = false;
        this.acceptedOfferLetterId = null;
      },
    });
  }

  onTrackerStateChange(state: IPipelineTrackerNextStepState): void {
    this.trackerState = state;
  }

  get stagesCompleted(): boolean {
    return !!this.trackerState?.allStagesCompleted;
  }

  goToGenerateOfferLetter(): void {
    if (!this.stagesCompleted) return;
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

  goToGenerateAppointmentLetter(): void {
    if (!this.acceptedOfferLetterId) return;
    this.router.navigate(['/document-management/manage-appointment-letter'], { queryParams: { offerLetterId: this.acceptedOfferLetterId } });
  }

  loadApplication(): void {
    this.loading = true;
    this.loadError = '';
    this.jobApplicationService.getDetail(this.jobApplicationId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.application = response.content;
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

  openRejectWithdraw(status: ApplicationStatusEnum.Rejected | ApplicationStatusEnum.Withdrawn): void {
    this.rejectWithdrawTarget = status;
    this.selectedReasonId = null;
    this.note = '';
    this.updateError = '';
    this.updateSuccess = false;
    this.reasonOptions = [];

    this.jobApplicationService.getStatusReasons(status).subscribe({
      next: (response) => {
        this.reasonOptions = response && !response.hasError && response.content ? response.content : [];
      },
    });
  }

  cancelRejectWithdraw(): void {
    this.rejectWithdrawTarget = null;
  }

  canConfirmRejectWithdraw(): boolean {
    return !!this.rejectWithdrawTarget && StatusesRequiringReason.includes(this.rejectWithdrawTarget) && !!this.selectedReasonId;
  }

  confirmRejectWithdraw(): void {
    if (!this.rejectWithdrawTarget || !this.canConfirmRejectWithdraw()) return;

    this.updating = true;
    this.updateError = '';
    this.updateSuccess = false;

    this.jobApplicationService
      .updateStatus(this.jobApplicationId, {
        toStatus: this.rejectWithdrawTarget,
        reasonId: this.selectedReasonId ?? undefined,
        note: this.note || undefined,
      })
      .subscribe({
        next: () => {
          this.updating = false;
          this.updateSuccess = true;
          this.rejectWithdrawTarget = null;
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
      if (t.blockingStageIsExam) {
        return { text: `Next: Schedule and enroll this candidate in an exam (Exams module) for the '${t.blockingStageName}' stage — score fills in automatically once it's graded.`, tone: 'info', icon: 'fa-arrow-right-long' };
      }
      return { text: `Next: Complete the '${t.blockingStageName}' stage — click Update on that stage card below.`, tone: 'info', icon: 'fa-arrow-right-long' };
    }

    if (this.stagesCompleted) {
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

  get steps(): { label: string; state: StepState }[] {
    const t = this.trackerState;
    const stagesDone = !t || !t.hasPipeline || !t.blockingStageName;
    const offerDone = this.hasOfferLetter;
    const acceptDone = !!this.offerLetterAccepted;
    const hiredDone = this.application?.applicationStatus === ApplicationStatusEnum.Hired;

    const stepState = (done: boolean, isCurrent: boolean): StepState => (done ? 'done' : isCurrent ? 'current' : 'upcoming');

    return [
      { label: 'Pipeline Stages', state: stepState(stagesDone, !stagesDone) },
      { label: 'Offer Letter', state: stepState(offerDone, stagesDone && !offerDone) },
      { label: 'Offer Accepted', state: stepState(acceptDone, offerDone && !acceptDone) },
      { label: 'Hired', state: stepState(hiredDone, acceptDone && !hiredDone) },
    ];
  }
}
