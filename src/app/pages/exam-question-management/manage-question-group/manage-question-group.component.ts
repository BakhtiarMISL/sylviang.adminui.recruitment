import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionGroupService } from '@app/@core/services/recruitment/question-group/question-group.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-manage-question-group',
  standalone: false,
  templateUrl: './manage-question-group.component.html',
  styleUrl: './manage-question-group.component.scss',
})
export class ManageQuestionGroupComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private questionGroupService: QuestionGroupService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  groupForm!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  questionGroupId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.groupForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(200)]],
      description: [null],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.questionGroupId = +idParam;
        this.isEditMode = true;
        this.loadGroup(this.questionGroupId);
      } else {
        this.isEditMode = false;
        this.questionGroupId = null;
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-questions/question-group-list' },
      { title: 'Question Groups', icon: 'fa-solid fa-layer-group', href: '/exam-questions/question-group-list' },
      { title: this.isEditMode ? 'Edit Group' : 'Add Group', icon: 'fa-solid fa-edit', href: '/exam-questions/manage-question-group' },
    ]);
  }

  private loadGroup(id: number): void {
    this.questionGroupService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.groupForm.patchValue({
            name: response.content.name,
            description: response.content.description,
          });
        } else {
          this.router.navigate(['/exam-questions/question-group-list']);
        }
      },
      error: () => {
        this.router.navigate(['/exam-questions/question-group-list']);
      },
    });
  }

  get f() {
    return this.groupForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.groupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    const request = {
      name: this.groupForm.value.name,
      description: this.groupForm.value.description,
    };

    if (this.isEditMode && this.questionGroupId) {
      this.questionGroupService.update(this.questionGroupId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-questions/question-group-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update question group';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update question group';
        },
      });
    } else {
      this.questionGroupService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-questions/question-group-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create question group';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create question group';
        },
      });
    }
  }
}
