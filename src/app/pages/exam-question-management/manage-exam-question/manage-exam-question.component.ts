import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DifficultyLevelEnum, QuestionTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IExamQuestionCreateRequest, IExamQuestionOption } from '@app/@core/interfaces/recruitment-management/exam-question.interface';
import { IQuestionGroupLookupResponse } from '@app/@core/interfaces/recruitment-management/question-group.interface';
import { BreadcrumbService } from '@app/@core/services';
import { ExamQuestionService } from '@app/@core/services/recruitment/exam-question/exam-question.service';
import { QuestionGroupService } from '@app/@core/services/recruitment/question-group/question-group.service';
import { DifficultyLevelOptions, newOption, newQuestionOptionsForType, QuestionTypeOptions } from './manage-exam-question.component.constants';

@Component({
  selector: 'app-manage-exam-question',
  standalone: false,
  templateUrl: './manage-exam-question.component.html',
  styleUrl: './manage-exam-question.component.scss',
})
export class ManageExamQuestionComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private examQuestionService: ExamQuestionService,
    private questionGroupService: QuestionGroupService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  questionForm!: FormGroup;
  options: IExamQuestionOption[] = [];

  formSubmitted = false;
  isEditMode = false;
  examQuestionId: number | null = null;
  errorMessage = '';

  groupLookup: IQuestionGroupLookupResponse[] = [];
  questionTypeOptions = QuestionTypeOptions;
  difficultyLevelOptions = DifficultyLevelOptions;

  readonly QuestionTypeEnum = QuestionTypeEnum;

  ngOnInit(): void {
    this.questionForm = this.fb.group({
      questionGroupId: [null, [Validators.required]],
      questionText: [null, [Validators.required]],
      questionType: [QuestionTypeEnum.McqSingle, [Validators.required]],
      difficultyLevel: [DifficultyLevelEnum.Easy, [Validators.required]],
      marks: [1, [Validators.required, Validators.min(0.01)]],
      explanation: [null],
      modelAnswer: [null],
    });

    this.loadGroupLookup();

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.examQuestionId = +idParam;
        this.isEditMode = true;
        this.loadQuestion(this.examQuestionId);
      } else {
        this.isEditMode = false;
        this.examQuestionId = null;
        this.options = newQuestionOptionsForType(this.questionForm.value.questionType);
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-questions/exam-question-list' },
      { title: 'Exam Questions', icon: 'fa-solid fa-circle-question', href: '/exam-questions/exam-question-list' },
      { title: this.isEditMode ? 'Edit Question' : 'Add Question', icon: 'fa-solid fa-edit', href: '/exam-questions/manage-exam-question' },
    ]);
  }

  private loadGroupLookup(): void {
    this.questionGroupService.getLookup().subscribe({
      next: (response) => {
        this.groupLookup = response && !response.hasError && response.content ? response.content : [];
      },
    });
  }

  private loadQuestion(id: number): void {
    this.examQuestionService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.questionForm.patchValue({
            questionGroupId: response.content.questionGroupId,
            questionText: response.content.questionText,
            questionType: response.content.questionType,
            difficultyLevel: response.content.difficultyLevel,
            marks: response.content.marks,
            explanation: response.content.explanation,
            modelAnswer: response.content.modelAnswer,
          });
          this.options = [...response.content.options].sort((a, b) => a.displayOrder - b.displayOrder);
        } else {
          this.router.navigate(['/exam-questions/exam-question-list']);
        }
      },
      error: () => {
        this.router.navigate(['/exam-questions/exam-question-list']);
      },
    });
  }

  get f() {
    return this.questionForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.questionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onQuestionTypeChange(): void {
    this.options = newQuestionOptionsForType(this.questionForm.value.questionType);
  }

  addOption(): void {
    this.options.push(newOption(this.options.length));
  }

  removeOption(index: number): void {
    this.options.splice(index, 1);
    this.options.forEach((o, i) => (o.displayOrder = i));
  }

  get isTrueFalse(): boolean {
    return this.questionForm.value.questionType === QuestionTypeEnum.TrueFalse;
  }

  get isSubjective(): boolean {
    return this.questionForm.value.questionType === QuestionTypeEnum.Subjective;
  }

  get isMcq(): boolean {
    return this.questionForm.value.questionType === QuestionTypeEnum.McqSingle || this.questionForm.value.questionType === QuestionTypeEnum.McqMultiple;
  }

  get optionsAreInvalid(): boolean {
    if (this.isSubjective) return this.options.length > 0;
    if (this.isTrueFalse) return this.options.length !== 2 || this.options.filter((o) => o.isCorrect).length !== 1;
    if (this.questionForm.value.questionType === QuestionTypeEnum.McqSingle) {
      return this.options.length < 2 || this.options.some((o) => !o.optionText?.trim()) || this.options.filter((o) => o.isCorrect).length !== 1;
    }
    // McqMultiple
    return this.options.length < 2 || this.options.some((o) => !o.optionText?.trim()) || !this.options.some((o) => o.isCorrect);
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    if (this.optionsAreInvalid) {
      this.errorMessage = 'Fix the options: ' + this.optionsHelpText();
      return;
    }

    const request: IExamQuestionCreateRequest = {
      questionGroupId: this.questionForm.value.questionGroupId,
      questionText: this.questionForm.value.questionText,
      questionType: this.questionForm.value.questionType,
      difficultyLevel: this.questionForm.value.difficultyLevel,
      marks: this.questionForm.value.marks,
      explanation: this.questionForm.value.explanation,
      modelAnswer: this.questionForm.value.modelAnswer,
      options: this.options.map((o, i) => ({ ...o, displayOrder: i })),
    };

    if (this.isEditMode && this.examQuestionId) {
      this.examQuestionService.update(this.examQuestionId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-questions/exam-question-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update question';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update question';
        },
      });
    } else {
      this.examQuestionService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-questions/exam-question-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create question';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create question';
        },
      });
    }
  }

  private optionsHelpText(): string {
    if (this.isSubjective) return 'Subjective questions must not have any options.';
    if (this.isTrueFalse) return 'True/False needs exactly 2 options with exactly 1 marked correct.';
    if (this.questionForm.value.questionType === QuestionTypeEnum.McqSingle) return 'MCQ (single) needs at least 2 filled options with exactly 1 marked correct.';
    return 'MCQ (multiple) needs at least 2 filled options with at least 1 marked correct.';
  }
}
