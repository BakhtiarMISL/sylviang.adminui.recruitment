import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { MasterDataService } from '@app/@core/services/recruitment/master-data/master-data.service';
import { TableStateService } from '@app/@core/services/table-state.service';
import { IMasterDataEntityConfig, IMasterDataItem } from '@core/interfaces/recruitment-management/master-data.interface';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-master-data-list',
  standalone: false,
  templateUrl: './master-data-list.component.html',
  styleUrl: './master-data-list.component.scss',
})
export class MasterDataListComponent implements OnInit, AfterViewInit {
  private readonly STATE_KEY_PREFIX = 'master-data-list:';
  @ViewChild('dt') dt!: Table;
  first = 0;
  rows = 10;

  constructor(
    private masterDataService: MasterDataService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private tableState: TableStateService,
  ) {}

  config!: IMasterDataEntityConfig;
  items: IMasterDataItem[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  get globalFilterFields(): string[] {
    return this.config.fields.map((field) => field.key);
  }

  get skeletonItems() {
    return Array(4)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.config = data['config'];
      this.setBreadcrumbs();
      this.restoreState();
      this.loadItems();
    });
  }

  ngAfterViewInit(): void {
    if (this.searchTerm && this.dt) {
      setTimeout(() => this.dt.filterGlobal(this.searchTerm, 'contains'), 0);
    }
  }

  private get stateKey(): string {
    return this.STATE_KEY_PREFIX + (this.config?.routeKey ?? 'unknown');
  }

  private restoreState(): void {
    const s = this.tableState.load<{ first: number; rows: number; searchTerm: string }>(this.stateKey);
    if (s) {
      this.first = s.first ?? 0;
      this.rows = s.rows ?? 10;
      this.searchTerm = s.searchTerm ?? '';
    }
  }

  private saveState(): void {
    this.tableState.save(this.stateKey, { first: this.first, rows: this.rows, searchTerm: this.searchTerm });
  }

  onPage(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.saveState();
  }

  onSearch(): void {
    this.first = 0;
    this.saveState();
    if (this.dt) this.dt.filterGlobal(this.searchTerm, 'contains');
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: `/master-data/${this.config.routeKey}-list` },
      { title: this.config.title, icon: this.config.icon, href: `/master-data/${this.config.routeKey}-list` },
    ]);
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.masterDataService.getAll(this.config.apiPath).subscribe({
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

  idOf(item: IMasterDataItem): number {
    return item[this.config.idField] as number;
  }

  labelOf(item: IMasterDataItem): string {
    return (item['name'] as string) ?? String(this.idOf(item));
  }

  deleteItem(item: IMasterDataItem, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete ${this.config.singularLabel.toLowerCase()} "${this.labelOf(item)}"? This cannot be undone.`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-trash',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.masterDataService.delete(this.config.apiPath, this.idOf(item)).subscribe({
          next: () => this.loadItems(),
          error: (error) => {
            this.errorMessage = error?.error?.decentMessage || `Failed to delete ${this.config.singularLabel.toLowerCase()}. It may still be in use.`;
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
