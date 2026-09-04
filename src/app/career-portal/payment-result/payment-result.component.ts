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
 * Landing page SSLCommerz's browser-return callbacks (success/fail/cancel) redirect to. The
 * status query param is a UX hint only - this page polls PaymentService.getPaymentStatus for the
 * real outcome, since the authoritative confirmation comes from the server-to-server IPN, which
 * can land slightly after the browser redirect.
 */
@Component({
  selector: 'app-payment-result',
  standalone: false,
  templateUrl: './payment-result.component.html',
  styleUrl: './payment-result.component.scss',
})
export class PaymentResultComponent implements OnInit, OnDestroy {
  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  jobApplicationId: number | null = null;
  hintStatus: string | null = null;
  // Backend-resolved and appended to the redirect URL that lands on this page (see
  // PaymentController.ConfirmAndRedirectToFrontendResult) - stands in for an ownership proof
  // since this page has no other way to know it and Initiate/GetStatus require it.
  private candidateEmail = '';
  status: IPaymentStatusResponse | null = null;
  polling = true;
  timedOut = false;
  retryingPayment = false;
  retryError = '';

  private pollAttempts = 0;
  private consecutiveErrors = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private queryParamsSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Careers', icon: 'fa-solid fa-magnifying-glass', href: '/careers' },
      { title: 'Payment Result', icon: 'fa-solid fa-money-check-dollar', href: '/careers/payment-result' },
    ]);
    this.queryParamsSubscription = this.route.queryParamMap.subscribe((params) => {
      // Any later emission on this same route restarts the poll - without clearing the pending
      // timer first, the old chain kept running alongside the new one, both decrementing the
      // shared attempt budget.
      this.resetPolling();
      const idParam = params.get('jobApplicationId');
      this.hintStatus = params.get('status');
      this.candidateEmail = params.get('candidateEmail') || '';
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
