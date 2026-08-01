import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { OfficeNoteService } from '@app/@core/services/recruitment/office-note/office-note.service';
import { IOfficeNoteResponse } from '@core/interfaces/recruitment-management/office-note.interface';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-office-note-list',
  standalone: false,
  templateUrl: './office-note-list.component.html',
  styleUrl: './office-note-list.component.scss',
})
export class OfficeNoteListComponent implements OnInit {
  constructor(
    private officeNoteService: OfficeNoteService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IOfficeNoteResponse[] = [];
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
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/office-note-list' },
      { title: 'Office Notes', icon: 'fa-solid fa-file-pen', href: '/document-management/office-note-list' },
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
    this.officeNoteService.getAll(this.jobApplicationId ?? undefined).subscribe({
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

  getPdfUrl(item: IOfficeNoteResponse): string {
    if (!item.generatedPdfPath) return '';
    return `${Base_URL}${item.generatedPdfPath.startsWith('/') ? '' : '/'}${item.generatedPdfPath}`;
  }
}
