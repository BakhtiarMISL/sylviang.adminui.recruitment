import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreadcrumbService } from '@app/@core/services';
import { OfferLetterCandidateService } from '@app/@core/services/recruitment/offer-letter-candidate/offer-letter-candidate.service';
import { IOfferLetterResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-my-offer-letter-detail',
  standalone: false,
  templateUrl: './my-offer-letter-detail.component.html',
  styleUrl: './my-offer-letter-detail.component.scss',
})
export class MyOfferLetterDetailComponent implements OnInit, OnDestroy {
  constructor(
    private offerLetterCandidateService: OfferLetterCandidateService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  item: IOfferLetterResponse | null = null;
  loading = false;
  errorMessage = '';
  submitting = false;
  pdfUrl: SafeResourceUrl | null = null;

  declineDialogVisible = false;
  declineReason = '';
  declineErrorMessage = '';

  get isUndecided(): boolean {
    return !!this.item && (this.item.status === 'Generated' || this.item.status === 'Sent');
  }

  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'My Offer Letters', icon: 'fa-solid fa-file-signature', href: '/candidate-profile/offer-letters' },
      { title: 'View Offer Letter', icon: 'fa-solid fa-eye', href: '' },
    ]);

    // Subscribed rather than a one-time snapshot read - RouteReusableStrategy reuses this
    // component instance across navigations between two letter ids.
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.load(Number(params.get('id')));
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private load(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.offerLetterCandidateService.getById(id).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.item = response.content;
          const url = `${Base_URL}${this.item.generatedPdfPath.startsWith('/') ? '' : '/'}${this.item.generatedPdfPath}`;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          this.errorMessage = response.decentMessage || 'Failed to load offer letter.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to load offer letter.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  accept(): void {
    if (!this.item) return;
    this.submitting = true;
    this.errorMessage = '';
    this.offerLetterCandidateService.accept(this.item.offerLetterId).subscribe({
      next: (response) => {
        this.submitting = false;
        if (!response.hasError && response.content) {
          this.item = response.content;
        } else {
          this.errorMessage = response.decentMessage || 'Failed to accept offer.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = error?.error?.decentMessage || 'Failed to accept offer.';
        this.cdr.detectChanges();
      },
    });
  }

  openDeclineDialog(): void {
    this.declineReason = '';
    this.declineErrorMessage = '';
    this.declineDialogVisible = true;
  }

  confirmDecline(): void {
    if (!this.item) return;
    if (!this.declineReason.trim()) {
      this.declineErrorMessage = 'A reason is required to decline this offer.';
      return;
    }

    this.submitting = true;
    this.offerLetterCandidateService.decline(this.item.offerLetterId, { reason: this.declineReason.trim() }).subscribe({
      next: (response) => {
        this.submitting = false;
        if (!response.hasError && response.content) {
          this.item = response.content;
          this.declineDialogVisible = false;
        } else {
          this.declineErrorMessage = response.decentMessage || 'Failed to decline offer.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.submitting = false;
        this.declineErrorMessage = error?.error?.decentMessage || 'Failed to decline offer.';
        this.cdr.detectChanges();
      },
    });
  }
}
