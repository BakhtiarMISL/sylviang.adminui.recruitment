import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UI_CONFIG } from '@app/@core/constants';
import { BreadcrumbService } from '@app/@core/services';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';
import {
  IPaymentTransactionListItem,
  PaymentTransactionStatusEnum,
} from '@core/interfaces/recruitment-management/payment-report.interface';
import { IJobVacancyResponse } from '@core/interfaces/recruitment-management/job-vacancy.interface';
import { JobVacancyService } from '@core/services/recruitment/job-vacancy/job-vacancy.service';
import { PaymentReportService } from '@core/services/recruitment/payment-report/payment-report.service';

@Component({
  selector: 'app-payment-transaction-list',
  standalone: false,
  templateUrl: './payment-transaction-list.component.html',
  styleUrl: './payment-transaction-list.component.scss',
})
export class PaymentTransactionListComponent implements OnInit {
  constructor(
    private paymentReportService: PaymentReportService,
    private jobVacancyService: JobVacancyService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IPaymentTransactionListItem[] = [];
  vacancyOptions: IJobVacancyResponse[] = [];
  loading = false;
  errorMessage = '';
  totalRecords = 0;
  totalAmount = 0;
  UI_CONFIG = UI_CONFIG;
  rows: number = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  statusOptions = Object.values(PaymentTransactionStatusEnum).map((value) => ({ label: value, value }));

  filterJobPostingId: number | null = null;
  filterStatus: PaymentTransactionStatusEnum | null = null;
  filterCandidateName: string | null = null;
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  filtersCollapsed = true;

  get skeletonItems() {
    return Array(6)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/payment-management/payment-transaction-list' },
      { title: 'Payment Transactions', icon: 'fa-solid fa-money-bill-transfer', href: '/payment-management/payment-transaction-list' },
    ]);

    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.vacancyOptions = !response.hasError && response.content ? response.content : [];
      },
    });

    this.loadItems();
  }

  private buildFilter() {
    return {
      jobPostingId: this.filterJobPostingId ?? undefined,
      paymentStatus: this.filterStatus ?? undefined,
      candidateName: this.filterCandidateName || undefined,
      dateFrom: this.filterDateFrom ? DateTimeUtility.formatDateForAPI(this.filterDateFrom) : undefined,
      dateTo: this.filterDateTo ? DateTimeUtility.formatDateForAPI(this.filterDateTo) : undefined,
      page: this.currentPage,
      pageSize: this.rows,
    };
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.paymentReportService.getTransactions(this.buildFilter()).subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content.data : [];
        this.totalRecords = !response.hasError && response.content ? response.content.totalCount : 0;
        this.totalAmount = !response.hasError && response.content ? response.content.totalAmount : 0;
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

  applyFilters(): void {
    this.currentPage = 1;
    this.filtersCollapsed = true;
    this.loadItems();
  }

  resetFilters(): void {
    this.filterJobPostingId = null;
    this.filterStatus = null;
    this.filterCandidateName = null;
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.currentPage = 1;
    this.filtersCollapsed = false;
    this.loadItems();
  }

  onPageChange(event: { page?: number; rows?: number }): void {
    this.currentPage = (event.page ?? 0) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadItems();
  }
}
