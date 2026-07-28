import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IScorecardCriterionRequest } from '@app/@core/interfaces/recruitment-management/scorecard.interface';
import { ScorecardService } from '@app/@core/services/recruitment/scorecard/scorecard.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-manage-scorecard',
  standalone: false,
  templateUrl: './manage-scorecard.component.html',
  styleUrl: './manage-scorecard.component.scss',
})
export class ManageScorecardComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private scorecardService: ScorecardService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  scorecardForm!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  scorecardId: number | null = null;
  errorMessage = '';

  criteria: IScorecardCriterionRequest[] = [];

  ngOnInit(): void {
    this.scorecardForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(200)]],
      description: [null, [Validators.maxLength(500)]],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.scorecardId = +idParam;
        this.isEditMode = true;
        this.loadScorecard(this.scorecardId);
      } else {
        this.isEditMode = false;
        this.scorecardId = null;
        this.addCriterion();
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/scorecards/scorecard-list' },
      { title: 'Scorecard Templates', icon: 'fa-solid fa-clipboard-list', href: '/scorecards/scorecard-list' },
      {
        title: this.isEditMode ? 'Edit Scorecard' : 'Add Scorecard',
        icon: 'fa-solid fa-edit',
        href: '/scorecards/manage-scorecard',
      },
    ]);
  }

  private loadScorecard(id: number): void {
    this.scorecardService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.scorecardForm.patchValue({
            name: response.content.name,
            description: response.content.description,
          });
          this.criteria = response.content.criteria
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((c) => ({ name: c.name, weight: c.weight, maxScore: c.maxScore, displayOrder: c.displayOrder }));
          if (this.criteria.length === 0) {
            this.addCriterion();
          }
        } else {
          this.router.navigate(['/scorecards/scorecard-list']);
        }
      },
      error: () => {
        this.router.navigate(['/scorecards/scorecard-list']);
      },
    });
  }

  get f() {
    return this.scorecardForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.scorecardForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  get totalWeight(): number {
    return this.criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  }

  addCriterion(): void {
    this.criteria.push({ name: '', weight: 0, maxScore: 10, displayOrder: this.criteria.length + 1 });
  }

  removeCriterion(index: number): void {
    this.criteria.splice(index, 1);
    this.criteria.forEach((c, i) => (c.displayOrder = i + 1));
  }

  private hasInvalidCriteria(): boolean {
    if (this.criteria.length === 0) {
      return true;
    }
    return this.criteria.some((c) => !c.name || !c.name.trim() || c.weight <= 0 || c.maxScore <= 0);
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.scorecardForm.invalid || this.hasInvalidCriteria()) {
      this.scorecardForm.markAllAsTouched();
      if (this.hasInvalidCriteria()) {
        this.errorMessage = 'Every criterion needs a name, a weight greater than 0, and a max score greater than 0.';
      }
      return;
    }

    const request = {
      name: this.scorecardForm.value.name,
      description: this.scorecardForm.value.description,
      criteria: this.criteria.map((c, i) => ({ ...c, displayOrder: i + 1 })),
    };

    if (this.isEditMode && this.scorecardId) {
      this.scorecardService.update(this.scorecardId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/scorecards/scorecard-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update scorecard';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update scorecard';
        },
      });
    } else {
      this.scorecardService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/scorecards/scorecard-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create scorecard';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create scorecard';
        },
      });
    }
  }
}
