import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IQuestionGroupResponse } from '@app/@core/interfaces/recruitment-management/question-group.interface';
import { QuestionGroupService } from '@app/@core/services/recruitment/question-group/question-group.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-question-group-list',
  standalone: false,
  templateUrl: './question-group-list.component.html',
  styleUrl: './question-group-list.component.scss',
})
export class QuestionGroupListComponent implements OnInit {
  constructor(
    private questionGroupService: QuestionGroupService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  groups: IQuestionGroupResponse[] = [];
  filteredGroups: IQuestionGroupResponse[] = [];
  loading = false;
  filtersCollapsed = true;

  filterSearch = '';
  filterStatus: boolean | null = null;
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-questions/question-group-list' },
      { title: 'Question Groups', icon: 'fa-solid fa-layer-group', href: '/exam-questions/question-group-list' },
    ]);
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.questionGroupService.getAll().subscribe({
      next: (response) => {
        this.groups = !response.hasError && response.content ? response.content : [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.groups = [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Small, non-paginated dataset (matches this page's existing card-list rendering) - filtering
  // in memory over the already-loaded groups rather than round-tripping to the backend.
  applyFilters(): void {
    this.filtersCollapsed = true;
    const search = this.filterSearch.trim().toLowerCase();
    this.filteredGroups = this.groups.filter((g) => {
      const matchesSearch = !search || g.name.toLowerCase().includes(search) || (g.description ?? '').toLowerCase().includes(search);
      const matchesStatus = this.filterStatus === null || g.isActive === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  resetFilters(): void {
    this.filterSearch = '';
    this.filterStatus = null;
    // applyFilters() collapses the panel (Apply-button behavior) - reopen it after.
    this.applyFilters();
    this.filtersCollapsed = false;
  }

  toggleActiveStatus(group: IQuestionGroupResponse, event: Event): void {
    const nextStatus = !group.isActive;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} question group: ${group.name}?`,
      header: nextStatus ? 'Activate Confirmation' : 'Deactivate Confirmation',
      acceptButtonStyleClass: nextStatus ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.questionGroupService.setActiveStatus(group.questionGroupId, { isActive: nextStatus }).subscribe({
          next: () => this.loadGroups(),
          error: (error) => {
            console.error('Error updating question group status:', error);
          },
        });
      },
    });
  }
}
