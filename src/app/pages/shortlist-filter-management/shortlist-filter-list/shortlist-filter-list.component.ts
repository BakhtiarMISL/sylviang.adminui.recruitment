import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IShortlistFilterResponse } from '@app/@core/interfaces/recruitment-management/shortlist-filter.interface';
import { ShortlistFilterService } from '@app/@core/services/recruitment/shortlist-filter/shortlist-filter.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-shortlist-filter-list',
  standalone: false,
  templateUrl: './shortlist-filter-list.component.html',
  styleUrl: './shortlist-filter-list.component.scss',
})
export class ShortlistFilterListComponent implements OnInit {
  constructor(
    private shortlistFilterService: ShortlistFilterService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  filters: IShortlistFilterResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadFilters();
  }

  loadFilters(): void {
    this.loading = true;
    this.shortlistFilterService.getAll().subscribe({
      next: (response) => {
        this.filters = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.filters = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteFilter(filter: IShortlistFilterResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete filter: ${filter.name}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.shortlistFilterService.delete(filter.shortlistFilterId).subscribe({
          next: () => {
            this.loadFilters();
          },
          error: (error) => {
            console.error('Error deleting shortlist filter:', error);
          },
        });
      },
    });
  }
}
