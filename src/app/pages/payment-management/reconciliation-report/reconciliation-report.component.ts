import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { IJobVacancyResponse } from '@core/interfaces/recruitment-management/job-vacancy.interface';
import { IReconciliationResponse } from '@core/interfaces/recruitment-management/payment-report.interface';
import { JobVacancyService } from '@core/services/recruitment/job-vacancy/job-vacancy.service';
import { PaymentReportService } from '@core/services/recruitment/payment-report/payment-report.service';
import { saveFileResponse } from '@core/services/recruitment/cv-bank/cv-bank.service';

@Component({
  selector: 'app-reconciliation-report',
  standalone: false,
  templateUrl: './reconciliation-report.component.html',
  styleUrl: './reconciliation-report.component.scss',
})
export class ReconciliationReportComponent implements OnInit {
  constructor(
    private paymentReportService: PaymentReportService,
    private jobVacancyService: JobVacancyService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  vacancyOptions: IJobVacancyResponse[] = [];
  loading = false;
  exporting = false;
  errorMessage = '';
  summary: IReconciliationResponse | null = null;
  filtersCollapsed = true;

  filterJobPostingId: number | null = null;
  // Default to the current calendar month, same idiom as other date-range reports in this app.
  filterDateFrom: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  filterDateTo: Date = new Date();

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/payment-management/reconciliation-report' },
      { title: 'Reconciliation Report', icon: 'fa-solid fa-file-invoice-dollar', href: '/payment-management/reconciliation-report' },
    ]);

    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.vacancyOptions = !response.hasError && response.content ? response.content : [];
      },
    });

    this.runReport();
  }

  private buildRequest() {
    return {
      dateFrom: this.filterDateFrom.toISOString(),
      dateTo: this.filterDateTo.toISOString(),
      jobPostingId: this.filterJobPostingId ?? undefined,
    };
  }

  runReport(): void {
    this.filtersCollapsed = true;
    this.loading = true;
    this.errorMessage = '';
    this.paymentReportService.getReconciliation(this.buildRequest()).subscribe({
      next: (response) => {
        this.summary = !response.hasError && response.content ? response.content : null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.summary = null;
        this.errorMessage = error?.error?.decentMessage || 'Failed to load reconciliation report.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  resetFilters(): void {
    this.filterJobPostingId = null;
    this.filterDateFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.filterDateTo = new Date();
    this.runReport();
    this.filtersCollapsed = false;
  }

  export(format: 'xlsx' | 'pdf'): void {
    this.exporting = true;
    this.paymentReportService.exportReconciliation(this.buildRequest(), format).subscribe({
      next: (response) => {
        saveFileResponse(response, `Reconciliation-Report.${format}`);
        this.exporting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || `Failed to export ${format.toUpperCase()}.`;
        this.exporting = false;
        this.cdr.detectChanges();
      },
    });
  }
}
