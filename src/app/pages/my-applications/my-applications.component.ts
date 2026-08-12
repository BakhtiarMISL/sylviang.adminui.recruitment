import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { ExamAttemptStatusEnum, ExamTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IMyApplication, IMyApplicationInterview } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { IMyExamEnrollmentResponse } from '@app/@core/interfaces/recruitment-management/exam-taking.interface';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { ExamTakingService } from '@app/@core/services/recruitment/exam-taking/exam-taking.service';
import { saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import { PaymentService } from '@app/@core/services/recruitment/payment/payment.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ConfirmationService } from 'primeng/api';

const JOIN_LINK_OPENS_MINUTES_BEFORE = 5;

@Component({
  selector: 'app-my-applications',
  standalone: false,
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.scss',
})
export class MyApplicationsComponent implements OnInit, OnDestroy {
  constructor(
    private jobApplicationService: JobApplicationService,
    private examTakingService: ExamTakingService,
    private paymentService: PaymentService,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {}

  readonly ExamTypeEnum = ExamTypeEnum;
  readonly ExamAttemptStatusEnum = ExamAttemptStatusEnum;

  applications: IMyApplication[] = [];
  exams: IMyExamEnrollmentResponse[] = [];
  loading = true;
  loadError = '';
  withdrawingId: number | null = null;
  downloadingAdmitCardId: number | null = null;
  retryingPaymentId: number | null = null;

  // Join link is meant for the actual meeting window, not a stale link a candidate could click
  // hours early and sit on. `now` is re-stamped on a timer (not just once at load) so a link
  // flips from disabled to enabled live, without the candidate needing to refresh the page.
  private now = Date.now();
  private joinWindowTimerId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      {
        title: 'My Applications',
        icon: 'fa-solid fa-list-check',
        href: '/my-applications',
      },
    ]);
    this.loadApplications();
    this.loadExams();

    this.joinWindowTimerId = setInterval(() => {
      this.now = Date.now();
      this.cdr.detectChanges();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.joinWindowTimerId) clearInterval(this.joinWindowTimerId);
  }

  canJoin(interview: IMyApplicationInterview): boolean {
    if (!interview.scheduledDate) return true;
    return this.now >= new Date(interview.scheduledDate).getTime() - JOIN_LINK_OPENS_MINUTES_BEFORE * 60000;
  }

  loadApplications(): void {
    this.loading = true;
    this.loadError = '';
    this.jobApplicationService.getMyApplications().subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError) {
          this.applications = response.content || [];
        } else {
          this.loadError = response?.decentMessage || 'Failed to load your applications.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load your applications.';
      },
    });
  }

  // US-058 AC1: exams are fetched separately from applications - own feature slice, own
  // failure mode. A failure here shouldn't block the applications list from rendering.
  loadExams(): void {
    this.examTakingService.getMyEnrollments().subscribe({
      next: (response) => {
        this.exams = response && !response.hasError ? response.content || [] : [];
      },
      error: () => {
        this.exams = [];
      },
    });
  }

  examsFor(jobApplicationId: number): IMyExamEnrollmentResponse[] {
    return this.exams.filter((e) => e.jobApplicationId === jobApplicationId);
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  confirmWithdraw(event: Event, application: IMyApplication): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Withdraw your application for "${application.jobPostingTitle || 'this position'}"? This cannot be undone.`,
      header: 'Confirm Withdrawal',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => this.withdraw(application),
    });
  }

  downloadAdmitCard(exam: IMyExamEnrollmentResponse): void {
    this.downloadingAdmitCardId = exam.examEnrollmentId;
    this.examTakingService.downloadMyAdmitCard(exam.examEnrollmentId).subscribe({
      next: (response) => {
        saveFileResponse(response, `AdmitCard-${exam.examTitle}.pdf`);
        this.downloadingAdmitCardId = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.downloadingAdmitCardId = null;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to download admit card.' });
        this.cdr.detectChanges();
      },
    });
  }

  retryPayment(application: IMyApplication): void {
    this.retryingPaymentId = application.jobApplicationId;
    // A candidate's Keycloak username is their email (see AuthController.Register), so this
    // doubles as the ownership proof PaymentService.InitiateAsync checks against the
    // application's own CandidateEmail.
    const candidateEmail = this.authService.getUser()?.username || '';
    this.paymentService.initiatePayment(application.jobApplicationId, candidateEmail).subscribe({
      next: (response) => {
        this.retryingPaymentId = null;
        if (response && !response.hasError && response.content?.success && response.content.gatewayRedirectUrl) {
          window.location.href = response.content.gatewayRedirectUrl;
        } else {
          this.toast.error({ detail: response?.content?.failureReason || response?.decentMessage || 'Could not start payment. Please try again.' });
        }
      },
      error: (error) => {
        this.retryingPaymentId = null;
        this.toast.error({ detail: error?.error?.decentMessage || 'Could not start payment. Please try again.' });
      },
    });
  }

  private withdraw(application: IMyApplication): void {
    this.withdrawingId = application.jobApplicationId;
    this.jobApplicationService.withdrawMyApplication(application.jobApplicationId).subscribe({
      next: (response) => {
        this.withdrawingId = null;
        if (response && !response.hasError) {
          this.toast.success({ detail: 'Application withdrawn.' });
          this.loadApplications();
        } else {
          this.toast.error({ detail: response?.decentMessage || 'Failed to withdraw application.' });
        }
      },
      error: (error) => {
        this.withdrawingId = null;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to withdraw application.' });
      },
    });
  }
}
