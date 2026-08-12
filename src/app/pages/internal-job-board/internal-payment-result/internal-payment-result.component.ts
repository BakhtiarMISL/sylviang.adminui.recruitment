import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPaymentStatusResponse } from '@app/@core/interfaces/recruitment-management/payment.interface';
import { PaymentService } from '@app/@core/services/recruitment/payment/payment.service';
import { AuthService } from '@core/services/auth/auth.service';

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // ~1 minute - the IPN usually lands within a few seconds of the browser redirect.

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
  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
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
    if (this.pollTimer) clearTimeout(this.pollTimer);
  }

  private pollStatus(): void {
    if (!this.jobApplicationId) return;

    this.paymentService.getPaymentStatus(this.jobApplicationId, this.candidateEmail).subscribe({
      next: (response) => {
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
      error: () => this.scheduleNextPoll(),
    });
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
    return status.paymentStatus === 'Success' || status.paymentStatus === 'Failed';
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
