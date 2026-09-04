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
import { TableStateService } from '@app/@core/services/table-state.service';

@Component({
  selector: 'app-payment-transaction-list',
  standalone: false,
  templateUrl: './payment-transaction-list.component.html',
  styleUrl: './payment-transaction-list.component.scss',
})
export class PaymentTransactionListComponent implements OnInit {
  private readonly STATE_KEY = 'payment-transaction-list';

  constructor(
    private paymentReportService: PaymentReportService,
    private jobVacancyService: JobVacancyService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
    private tableState: TableStateService,
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

    this.restoreState();

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

  private restoreState(): void {
    const s = this.tableState.load<{
      currentPage: number;
      rows: number;
      filterJobPostingId: number | null;
      filterStatus: PaymentTransactionStatusEnum | null;
      filterCandidateName: string | null;
      filterDateFrom: string | null;
      filterDateTo: string | null;
    }>(this.STATE_KEY);
    if (s) {
      this.currentPage = s.currentPage ?? this.currentPage;
      this.rows = s.rows ?? this.rows;
      this.filterJobPostingId = s.filterJobPostingId ?? this.filterJobPostingId;
      this.filterStatus = s.filterStatus ?? this.filterStatus;
      this.filterCandidateName = s.filterCandidateName ?? this.filterCandidateName;
      this.filterDateFrom = s.filterDateFrom ? new Date(s.filterDateFrom) : this.filterDateFrom;
      this.filterDateTo = s.filterDateTo ? new Date(s.filterDateTo) : this.filterDateTo;
    }
  }

  private saveState(): void {
    this.tableState.save(this.STATE_KEY, {
      currentPage: this.currentPage,
      rows: this.rows,
      filterJobPostingId: this.filterJobPostingId,
      filterStatus: this.filterStatus,
      filterCandidateName: this.filterCandidateName,
      filterDateFrom: this.filterDateFrom ? this.filterDateFrom.toISOString() : null,
      filterDateTo: this.filterDateTo ? this.filterDateTo.toISOString() : null,
    });
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.saveState();
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
    this.saveState();
    this.loadItems();
  }

  onPageChange(event: { page?: number; rows?: number }): void {
    this.currentPage = (event.page ?? 0) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadItems();
  }
}
