import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { TableStateService } from '@app/@core/services/table-state.service';
import { IDocumentTemplateResponse } from '@core/interfaces/recruitment-management/document-template.interface';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-document-template-list',
  standalone: false,
  templateUrl: './document-template-list.component.html',
  styleUrl: './document-template-list.component.scss',
})
export class DocumentTemplateListComponent implements OnInit, AfterViewInit {
  private readonly STATE_KEY = 'document-template-list';
  @ViewChild('dt') dt!: Table;
  first = 0;
  rows = 10;

  constructor(
    private documentTemplateService: DocumentTemplateService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
    private tableState: TableStateService,
  ) {}

  items: IDocumentTemplateResponse[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  get skeletonItems() {
    return Array(4)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/document-template-list' },
      { title: 'Document Templates', icon: 'fa-solid fa-file-lines', href: '/document-management/document-template-list' },
    ]);
    this.restoreState();
    this.loadItems();
  }

  ngAfterViewInit(): void {
    if (this.searchTerm && this.dt) {
      setTimeout(() => this.dt.filterGlobal(this.searchTerm, 'contains'), 0);
    }
  }

  private restoreState(): void {
    const s = this.tableState.load<{ first: number; rows: number; searchTerm: string }>(this.STATE_KEY);
    if (s) {
      this.first = s.first ?? 0;
      this.rows = s.rows ?? 10;
      this.searchTerm = s.searchTerm ?? '';
    }
  }

  private saveState(): void {
    this.tableState.save(this.STATE_KEY, { first: this.first, rows: this.rows, searchTerm: this.searchTerm });
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

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.documentTemplateService.getAll().subscribe({
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

  deleteItem(item: IDocumentTemplateResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete template "${item.name}"? This cannot be undone.`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-trash',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.documentTemplateService.delete(item.documentTemplateId).subscribe({
          next: () => this.loadItems(),
          error: (error) => {
            this.errorMessage = error?.error?.decentMessage || 'Failed to delete template. It may still be used by a generated document.';
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
