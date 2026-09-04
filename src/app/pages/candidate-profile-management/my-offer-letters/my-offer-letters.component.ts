import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { OfferLetterCandidateService } from '@app/@core/services/recruitment/offer-letter-candidate/offer-letter-candidate.service';
import { IOfferLetterResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';

@Component({
  selector: 'app-my-offer-letters',
  standalone: false,
  templateUrl: './my-offer-letters.component.html',
  styleUrl: './my-offer-letters.component.scss',
})
export class MyOfferLettersComponent implements OnInit {
  constructor(
    private offerLetterCandidateService: OfferLetterCandidateService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IOfferLetterResponse[] = [];
  loading = false;
  errorMessage = '';

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([{ title: 'My Offer Letters', icon: 'fa-solid fa-file-signature', href: '/candidate-profile/offer-letters' }]);
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.offerLetterCandidateService.getAll().subscribe({
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
}
