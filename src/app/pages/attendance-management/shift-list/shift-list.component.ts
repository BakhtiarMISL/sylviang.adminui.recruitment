import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IShiftResponse } from '@app/@core/interfaces/attendance-management/shift.interface';
import { ShiftService } from '@app/@core/services/attendance/shift/shift.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { ShiftListColumns } from '@app/pages/attendance-management/shift-list/shift-list.component.constants';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { UI_CONFIG } from '@app/@core/constants';
import { TableStateService } from '@app/@core/services/table-state.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-shift-list',
  standalone: false,
  templateUrl: './shift-list.component.html',
  styleUrl: './shift-list.component.scss',
})
export class ShiftListComponent implements OnInit, AfterViewInit {
  private readonly STATE_KEY = 'shift-list';

  constructor(
    private _shiftService: ShiftService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
    private tableState: TableStateService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  shifts: IShiftResponse[] = [];
  selectedShifts: IShiftResponse[] = [];
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

  columns = ShiftListColumns;

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.restoreState();
    this.loadShifts();
    this.isLoading = false;
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Attendance', icon: 'fa-solid fa-clock', href: '/attendance/shift-list' },
      { title: 'Shift List', icon: 'fa-solid fa-random', href: '/attendance/shift-list' },
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
    this.selectedShifts = event;
    this.cdr.detectChanges();
  }

  applySearch() {
    this.currentPage = 1;
    this.loadShifts();
  }

  resetSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
    this.saveState();
    this.loadShifts();
  }

  loadShifts() {
    this.loading = true;
    this.saveState();

    const params = {
      pageNumber: this.currentPage,
      pageSize: this.rows,
      ...(this.searchTerm && this.searchTerm.trim() && { searchTerm: this.searchTerm.trim() }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
    };

    this._shiftService.getShiftsPaginated(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.shifts = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
          this.selectedShifts = [];
        } else {
          this.shifts = [];
          this.totalRecords = 0;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.shifts = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onPageChange(event: any): void {
    const newPage = Math.floor(event.first / event.rows) + 1;
    const newPageSize = event.rows;
    this.currentPage = newPage;
    this.rows = newPageSize;
    this.loadShifts();
  }

  onSort(event: SortEvent) {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadShifts();
  }

  deleteShift(shift: IShiftResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete shift: ${shift.shiftName}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this._shiftService.deleteShift(shift.shiftId?.toString() || '').subscribe({
          next: () => {
            this.loadShifts();
          },
          error: (error) => {
            console.error('Error deleting shift:', error);
          },
        });
      },
    });
  }
}
