import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UI_CONFIG } from '@app/@core/constants';
import { InterviewStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IInterviewResponse } from '@app/@core/interfaces/recruitment-management/interview.interface';
import { InterviewService } from '@app/@core/services/recruitment/interview/interview.service';
import { BreadcrumbService } from '@app/@core/services';
import { InterviewListColumns, InterviewStatusOptions } from './interview-list.component.constants';

@Component({
  selector: 'app-interview-list',
  standalone: false,
  templateUrl: './interview-list.component.html',
  styleUrl: './interview-list.component.scss',
})
export class InterviewListComponent implements OnInit {
  constructor(
    private interviewService: InterviewService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  interviews: IInterviewResponse[] = [];

  loading = false;
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  columns = InterviewListColumns;
  statusOptions = InterviewStatusOptions;
  filterStatus: InterviewStatusEnum | null = null;
  filtersCollapsed = true;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/interviews/interview-list' },
      { title: 'Interviews', icon: 'fa-solid fa-people-arrows', href: '/interviews/interview-list' },
    ]);
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.filterStatus != null && { status: this.filterStatus }),
    };

    this.interviewService.getPaged(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.interviews = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
        } else {
          this.interviews = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.interviews = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filtersCollapsed = true;
    this.loadInterviews();
  }

  resetFilters(): void {
    this.filterStatus = null;
    this.currentPage = 1;
    this.filtersCollapsed = false;
    this.loadInterviews();
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadInterviews();
  }

  openDetail(interview: IInterviewResponse): void {
    this.router.navigate(['/interviews/interview', interview.interviewId]);
  }
}
