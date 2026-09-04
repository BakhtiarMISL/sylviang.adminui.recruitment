import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IPayrollHeadResponse } from '@app/@core/interfaces/payroll-management/payroll-head.interface';
import { PayrollHeadService } from '@app/@core/services/payroll/payroll-head/payroll-head.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { PayrollHeadListColumns } from './payroll-head-list.component.constants';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { UI_CONFIG } from '@app/@core/constants';
import { TableStateService } from '@app/@core/services/table-state.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-payroll-head-list',
  standalone: false,
  templateUrl: './payroll-head-list.component.html',
  styleUrl: './payroll-head-list.component.scss',
})
export class PayrollHeadListComponent implements OnInit, AfterViewInit {
  private readonly STATE_KEY = 'payroll-head-list';

  constructor(
    private payrollHeadService: PayrollHeadService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
    private tableState: TableStateService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  payrollHeads: IPayrollHeadResponse[] = [];
  selectedPayrollHeads: IPayrollHeadResponse[] = [];
  sortedColumn: string = '';
  isLoading = true;
  totalRecords = 0;
  loading = false;
  UI_CONFIG = UI_CONFIG;
  rows: number = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  sortBy: string = '';
  sortDirection: string = '';
  searchTerm = '';

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  columns = PayrollHeadListColumns;

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.restoreState();
    this.loadPayrollHeads();
    this.isLoading = false;
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Payroll', icon: 'fa-solid fa-money-bill-wave', href: '/payroll/payroll-head-list' },
      { title: 'Payroll Head', icon: 'fa-solid fa-list', href: '/payroll/payroll-head-list' },
    ]);
  }

  private restoreState(): void {
    const s = this.tableState.load<{
      currentPage: number;
      rows: number;
      searchTerm: string;
      sortBy: string;
      sortDirection: string;
      sortedColumn: string;
    }>(this.STATE_KEY);
    if (s) {
      this.currentPage = s.currentPage ?? this.currentPage;
      this.rows = s.rows ?? this.rows;
      this.searchTerm = s.searchTerm ?? this.searchTerm;
      this.sortBy = s.sortBy ?? this.sortBy;
      this.sortDirection = s.sortDirection ?? this.sortDirection;
      this.sortedColumn = s.sortedColumn ?? this.sortedColumn;
    }
  }

  private saveState(): void {
    this.tableState.save(this.STATE_KEY, {
      currentPage: this.currentPage,
      rows: this.rows,
      searchTerm: this.searchTerm,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      sortedColumn: this.sortedColumn,
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onSelectionChange(event: any) {
    this.selectedPayrollHeads = event;
    this.cdr.detectChanges();
  }

  applySearch() {
    this.currentPage = 1;
    this.loadPayrollHeads();
  }

  resetSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
    this.saveState();
    this.loadPayrollHeads();
  }

  loadPayrollHeads() {
    this.loading = true;
    this.saveState();

    const params = {
      pageNumber: this.currentPage,
      pageSize: this.rows,
      ...(this.searchTerm && this.searchTerm.trim() && { searchTerm: this.searchTerm.trim() }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
    };

    this.payrollHeadService.getPayrollHeadsPaginated(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.payrollHeads = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
          this.selectedPayrollHeads = [];
        } else {
          this.payrollHeads = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.payrollHeads = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadPayrollHeads();
  }

  onSort(event: SortEvent) {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadPayrollHeads();
  }

  deletePayrollHead(head: IPayrollHeadResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete payroll head: ${head.headName}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.payrollHeadService.deletePayrollHead(head.payrollHeadId?.toString() || '').subscribe({
          next: () => {
            this.loadPayrollHeads();
          },
          error: (error) => {
            console.error('Error deleting payroll head:', error);
          },
        });
      },
    });
  }
}
