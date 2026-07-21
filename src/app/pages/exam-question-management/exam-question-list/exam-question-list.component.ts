import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UI_CONFIG } from '@app/@core/constants';
import { DifficultyLevelEnum, QuestionTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IExamQuestionBulkImportResponse, IExamQuestionResponse } from '@app/@core/interfaces/recruitment-management/exam-question.interface';
import { IQuestionGroupLookupResponse } from '@app/@core/interfaces/recruitment-management/question-group.interface';
import { BreadcrumbService } from '@app/@core/services';
import { ExamQuestionService } from '@app/@core/services/recruitment/exam-question/exam-question.service';
import { QuestionGroupService } from '@app/@core/services/recruitment/question-group/question-group.service';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { ActiveStatusOptions, DifficultyLevelOptions, ExamQuestionListColumns, QuestionTypeOptions } from './exam-question-list.component.constants';

@Component({
  selector: 'app-exam-question-list',
  standalone: false,
  templateUrl: './exam-question-list.component.html',
  styleUrl: './exam-question-list.component.scss',
})
export class ExamQuestionListComponent implements OnInit {
  constructor(
    private examQuestionService: ExamQuestionService,
    private questionGroupService: QuestionGroupService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  questions: IExamQuestionResponse[] = [];
  groupLookup: IQuestionGroupLookupResponse[] = [];

  loading = false;
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;
  sortedColumn = '';
  sortBy = '';
  sortDirection = '';
  searchTerm = '';
  filtersCollapsed = false;

  filterQuestionGroupId: number | null = null;
  filterQuestionType: QuestionTypeEnum | null = null;
  filterDifficultyLevel: DifficultyLevelEnum | null = null;
  filterIsActive: boolean | null = null;

  columns = ExamQuestionListColumns;
  questionTypeOptions = QuestionTypeOptions;
  difficultyLevelOptions = DifficultyLevelOptions;
  activeStatusOptions = ActiveStatusOptions;

  showBulkImportDialog = false;
  bulkImportGroupId: number | null = null;
  bulkImportFile: File | null = null;
  bulkImportLoading = false;
  bulkImportError = '';
  bulkImportResult: IExamQuestionBulkImportResponse | null = null;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-questions/exam-question-list' },
      { title: 'Exam Questions', icon: 'fa-solid fa-circle-question', href: '/exam-questions/exam-question-list' },
    ]);
    this.loadGroupLookup();
    this.loadQuestions();
  }

  private loadGroupLookup(): void {
    this.questionGroupService.getLookup().subscribe({
      next: (response) => {
        this.groupLookup = response && !response.hasError && response.content ? response.content : [];
      },
    });
  }

  loadQuestions(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.searchTerm && this.searchTerm.trim() && { searchTerm: this.searchTerm.trim() }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
      ...(this.filterQuestionGroupId != null && { questionGroupId: this.filterQuestionGroupId }),
      ...(this.filterQuestionType != null && { questionType: this.filterQuestionType }),
      ...(this.filterDifficultyLevel != null && { difficultyLevel: this.filterDifficultyLevel }),
      ...(this.filterIsActive != null && { isActive: this.filterIsActive }),
    };

    this.examQuestionService.getPaged(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.questions = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
        } else {
          this.questions = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.filtersCollapsed = this.totalRecords > 0;
        this.cdr.detectChanges();
      },
      error: () => {
        this.questions = [];
        this.totalRecords = 0;
        this.loading = false;
        this.filtersCollapsed = false;
        this.cdr.detectChanges();
      },
    });
  }

  applySearch(): void {
    this.currentPage = 1;
    this.loadQuestions();
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.filtersCollapsed = false;
    this.loadQuestions();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadQuestions();
  }

  resetFilters(): void {
    this.filterQuestionGroupId = null;
    this.filterQuestionType = null;
    this.filterDifficultyLevel = null;
    this.filterIsActive = null;
    this.currentPage = 1;
    this.filtersCollapsed = false;
    this.loadQuestions();
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadQuestions();
  }

  onSort(event: SortEvent): void {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadQuestions();
  }

  toggleActiveStatus(question: IExamQuestionResponse, event: Event): void {
    const nextStatus = !question.isActive;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} this question?`,
      header: nextStatus ? 'Activate Confirmation' : 'Deactivate Confirmation',
      acceptButtonStyleClass: nextStatus ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.examQuestionService.setActiveStatus(question.examQuestionId, { isActive: nextStatus }).subscribe({
          next: () => this.loadQuestions(),
          error: (error) => {
            console.error('Error updating question status:', error);
          },
        });
      },
    });
  }

  downloadTemplate(): void {
    this.examQuestionService.downloadImportTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ExamQuestionImportTemplate.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading import template:', error);
      },
    });
  }

  openBulkImportDialog(): void {
    this.bulkImportGroupId = null;
    this.bulkImportFile = null;
    this.bulkImportError = '';
    this.bulkImportResult = null;
    this.showBulkImportDialog = true;
  }

  onBulkImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.bulkImportFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  submitBulkImport(): void {
    this.bulkImportError = '';

    if (!this.bulkImportGroupId) {
      this.bulkImportError = 'Select a question group to import into.';
      return;
    }
    if (!this.bulkImportFile) {
      this.bulkImportError = 'Select an XLSX or CSV file to import.';
      return;
    }

    this.bulkImportLoading = true;
    this.bulkImportResult = null;

    this.examQuestionService.bulkImport(this.bulkImportGroupId, this.bulkImportFile).subscribe({
      next: (response) => {
        this.bulkImportLoading = false;
        if (response && !response.hasError && response.content) {
          this.bulkImportResult = response.content;
          this.loadQuestions();
        } else {
          this.bulkImportError = response?.decentMessage || 'Failed to import questions.';
        }
      },
      error: (error) => {
        this.bulkImportLoading = false;
        this.bulkImportError = error?.error?.decentMessage || 'Failed to import questions.';
      },
    });
  }
}
