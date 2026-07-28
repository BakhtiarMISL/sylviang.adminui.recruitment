import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UI_CONFIG } from '@app/@core/constants';
import { ExamTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IExamResponse } from '@app/@core/interfaces/recruitment-management/exam.interface';
import { ExamService } from '@app/@core/services/recruitment/exam/exam.service';
import { BreadcrumbService } from '@app/@core/services';
import { SortEvent } from 'primeng/api';
import { ExamListColumns, ExamTypeOptions } from './exam-list.component.constants';

@Component({
  selector: 'app-exam-list',
  standalone: false,
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss',
})
export class ExamListComponent implements OnInit {
  constructor(
    private examService: ExamService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  exams: IExamResponse[] = [];

  loading = false;
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;
  sortedColumn = '';
  sortBy = '';
  sortDirection = '';

  columns = ExamListColumns;
  examTypeOptions = ExamTypeOptions;
  filterExamType: ExamTypeEnum | null = null;
  filterIsActive: boolean | null = null;
  filtersCollapsed = true;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exams/exam-list' },
      { title: 'Exams', icon: 'fa-solid fa-file-pen', href: '/exams/exam-list' },
    ]);
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
      ...(this.filterExamType != null && { examType: this.filterExamType }),
      ...(this.filterIsActive != null && { isActive: this.filterIsActive }),
    };

    this.examService.getPaged(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.exams = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
        } else {
          this.exams = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.exams = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filtersCollapsed = true;
    this.loadExams();
  }

  resetFilters(): void {
    this.filterExamType = null;
    this.filterIsActive = null;
    this.currentPage = 1;
    this.filtersCollapsed = false;
    this.loadExams();
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadExams();
  }

  onSort(event: SortEvent): void {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadExams();
  }

  openDetail(exam: IExamResponse): void {
    this.router.navigate(['/exams/exam', exam.examId]);
  }
}
