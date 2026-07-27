import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { AppointmentLetterService } from '@app/@core/services/recruitment/appointment-letter/appointment-letter.service';
import { IAppointmentLetterResponse } from '@core/interfaces/recruitment-management/appointment-letter.interface';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-appointment-letter-list',
  standalone: false,
  templateUrl: './appointment-letter-list.component.html',
  styleUrl: './appointment-letter-list.component.scss',
})
export class AppointmentLetterListComponent implements OnInit {
  constructor(
    private appointmentLetterService: AppointmentLetterService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IAppointmentLetterResponse[] = [];
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
      { title: 'Appointment Letters', icon: 'fa-solid fa-file-contract', href: '/document-management/appointment-letter-list' },
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
    this.appointmentLetterService.getAll(this.jobApplicationId ?? undefined).subscribe({
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

  getPdfUrl(item: IAppointmentLetterResponse): string {
    if (!item.generatedPdfPath) return '';
    return `${Base_URL}${item.generatedPdfPath.startsWith('/') ? '' : '/'}${item.generatedPdfPath}`;
  }
}
