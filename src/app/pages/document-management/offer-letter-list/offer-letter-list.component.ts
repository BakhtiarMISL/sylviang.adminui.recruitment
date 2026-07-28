import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
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
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IOfferLetterResponse[] = [];
  loading = false;
  errorMessage = '';
  jobApplicationId: number | null = null;

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
  }

  getPdfUrl(item: IOfferLetterResponse): string {
    if (!item.generatedPdfPath) return '';
    return `${Base_URL}${item.generatedPdfPath.startsWith('/') ? '' : '/'}${item.generatedPdfPath}`;
  }
}
