import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { BreadcrumbService } from '@app/@core/services';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
import { AppointmentLetterService } from '@app/@core/services/recruitment/appointment-letter/appointment-letter.service';
import { IOfferLetterResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-offer-letter-list',
  standalone: false,
  templateUrl: './offer-letter-list.component.html',
  styleUrl: './offer-letter-list.component.scss',
})
export class OfferLetterListComponent implements OnInit {
  constructor(
    private offerLetterService: OfferLetterService,
    private appointmentLetterService: AppointmentLetterService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IOfferLetterResponse[] = [];
  loading = false;
  errorMessage = '';
  jobApplicationId: number | null = null;

  // Offer letters that already have at least one Appointment Letter generated - used to warn
  // before regenerating (reissue is a legitimate use case, so this only confirms, never blocks).
  offerLetterIdsWithAppointmentLetter = new Set<number>();

  get skeletonItems() {
    return Array(4)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/offer-letter-list' },
      { title: 'Offer Letters', icon: 'fa-solid fa-file-signature', href: '/document-management/offer-letter-list' },
    ]);

    this.route.queryParamMap.subscribe((params) => {
      const idParam = params.get('jobApplicationId');
      this.jobApplicationId = idParam ? +idParam : null;
      this.loadItems();
    });
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.offerLetterService.getAll(this.jobApplicationId ?? undefined).subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.items = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.loadAppointmentLetterFlags();
  }

  private loadAppointmentLetterFlags(): void {
    this.appointmentLetterService.getAll(this.jobApplicationId ?? undefined).subscribe({
      next: (response) => {
        const letters = !response.hasError && response.content ? response.content : [];
        this.offerLetterIdsWithAppointmentLetter = new Set(letters.map((l) => l.offerLetterId));
        this.cdr.detectChanges();
      },
      error: () => {
        this.offerLetterIdsWithAppointmentLetter = new Set();
      },
    });
  }

  getPdfUrl(item: IOfferLetterResponse): string {
    if (!item.generatedPdfPath) return '';
    return `${Base_URL}${item.generatedPdfPath.startsWith('/') ? '' : '/'}${item.generatedPdfPath}`;
  }

  onAppointmentLetterClick(item: IOfferLetterResponse, event: Event): void {
    const navigate = () =>
      this.router.navigate(['/document-management/manage-appointment-letter'], { queryParams: { offerLetterId: item.offerLetterId } });

    if (!this.offerLetterIdsWithAppointmentLetter.has(item.offerLetterId)) {
      navigate();
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `An Appointment Letter was already generated for ${item.candidateName}. Generate another one (reissue)?`,
      header: 'Appointment Letter Already Generated',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => navigate(),
    });
  }
}
