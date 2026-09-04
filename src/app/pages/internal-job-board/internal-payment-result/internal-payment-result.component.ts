import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPaymentStatusResponse } from '@app/@core/interfaces/recruitment-management/payment.interface';
import { PaymentService } from '@app/@core/services/recruitment/payment/payment.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BreadcrumbService } from '@app/@core/services';

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // ~1 minute - the IPN usually lands within a few seconds of the browser redirect.
// A run of failures means the endpoint itself is unhappy (server error, or an expired token on the
// status call), not that the IPN is still in flight. Retrying 20 times at a flat 3 s just left the
// applicant staring at "Confirming your payment..." for the full minute before the timeout copy.
const MAX_CONSECUTIVE_ERRORS = 2;

/**
 * Internal-job-board twin of career-portal's PaymentResultComponent (SSLCommerz's browser-return
 * landing page). Sits behind the shared parent AuthGuard since internal candidates are already
 * logged in - see the routing module comment for why this route carries no extra guard itself.
 */
@Component({
  selector: 'app-internal-payment-result',
  standalone: false,
  templateUrl: './internal-payment-result.component.html',
  styleUrl: './internal-payment-result.component.scss',
})
export class InternalPaymentResultComponent implements OnInit, OnDestroy {
  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  jobApplicationId: number | null = null;
  hintStatus: string | null = null;
  status: IPaymentStatusResponse | null = null;
  polling = true;
  timedOut = false;
  retryingPayment = false;
  retryError = '';

  // Ownership proof PaymentService.InitiateAsync/GetStatusAsync check against the application's
  // own CandidateEmail - prefers the redirect's own query param (career-portal's flow appends
  // it), falls back to the logged-in employee's own username, which is their email.
  private candidateEmail = '';

  private pollAttempts = 0;
  private consecutiveErrors = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private queryParamsSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.queryParamsSubscription = this.route.queryParamMap.subscribe((params) => {
      // Any later emission on this same route restarts the poll - without clearing the pending
      // timer first, the old chain kept running alongside the new one, both decrementing the
      // shared attempt budget.
      this.resetPolling();
      const idParam = params.get('jobApplicationId');
      this.hintStatus = params.get('status');
      this.candidateEmail = params.get('candidateEmail') || this.authService.getUser()?.username || '';
      if (idParam) {
        this.jobApplicationId = +idParam;
        this.pollStatus();
      } else {
        this.polling = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
    if (this.pollTimer) clearTimeout(this.pollTimer);
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Internal Job Board', icon: 'fa-solid fa-building', href: '/internal-jobs/job-list' },
      { title: 'Payment Result', icon: 'fa-solid fa-money-check-dollar', href: '/internal-jobs/payment-result' },
    ]);
  }

  private pollStatus(): void {
    if (!this.jobApplicationId) return;

    this.paymentService.getPaymentStatus(this.jobApplicationId, this.candidateEmail).subscribe({
      next: (response) => {
        this.consecutiveErrors = 0;
        if (response && !response.hasError && response.content) {
          this.status = response.content;
          if (this.isResolved(this.status)) {
            this.polling = false;
            this.cdr.detectChanges();
            return;
          }
        }
        this.scheduleNextPoll();
      },
      error: () => {
        this.consecutiveErrors++;
        if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          this.polling = false;
          this.timedOut = true;
          this.cdr.detectChanges();
          return;
        }
        this.scheduleNextPoll();
      },
    });
  }

  private resetPolling(): void {
    if (this.pollTimer) clearTimeout(this.pollTimer);
    this.pollTimer = null;
    this.pollAttempts = 0;
    this.consecutiveErrors = 0;
  }

  private scheduleNextPoll(): void {
    this.pollAttempts++;
    if (this.pollAttempts >= MAX_POLL_ATTEMPTS) {
      this.polling = false;
      this.timedOut = true;
      this.cdr.detectChanges();
      return;
    }
    this.pollTimer = setTimeout(() => this.pollStatus(), POLL_INTERVAL_MS);
  }

  private isResolved(status: IPaymentStatusResponse): boolean {
    // 'Cancelled' was missing here, so an applicant who backed out at SSLCommerz never hit a
    // terminal state: the page polled all 20 attempts and then showed the timed-out "we couldn't
    // confirm your payment" copy instead of the cancel message the template already carries.
    if (status.paymentStatus === 'Success' || status.paymentStatus === 'Failed' || status.paymentStatus === 'Cancelled') {
      return true;
    }

    // The gateway told us on the redirect itself that the applicant cancelled or the charge
    // failed, and the backend already recorded that outcome before redirecting here - there is no
    // later IPN that can turn either into a success, so there is nothing left to wait for.
    return this.hintStatus === 'cancel' || this.hintStatus === 'fail';
  }

  get isSuccess(): boolean {
    return this.status?.paymentStatus === 'Success';
  }

  retryPayment(): void {
    if (!this.jobApplicationId) return;
    this.retryingPayment = true;
    this.retryError = '';

    this.paymentService.initiatePayment(this.jobApplicationId, this.candidateEmail).subscribe({
      next: (response) => {
        this.retryingPayment = false;
        if (response && !response.hasError && response.content?.success && response.content.gatewayRedirectUrl) {
          window.location.href = response.content.gatewayRedirectUrl;
        } else {
          this.retryError = response?.content?.failureReason || response?.decentMessage || 'Could not start payment. Please try again.';
        }
      },
      error: (error) => {
        this.retryingPayment = false;
        this.retryError = error?.error?.decentMessage || 'Could not start payment. Please try again.';
      },
    });
  }
}
