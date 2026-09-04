import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { IMasterDataItem } from '@core/interfaces/recruitment-management/master-data.interface';
import { IWaiverRuleRequest, WaiverCandidateTypeEnum } from '@core/interfaces/recruitment-management/waiver-rule.interface';
import { MasterDataService } from '@core/services/recruitment/master-data/master-data.service';
import { WaiverRuleService } from '@core/services/recruitment/waiver-rule/waiver-rule.service';

@Component({
  selector: 'app-waiver-rule-form',
  standalone: false,
  templateUrl: './waiver-rule-form.component.html',
  styleUrl: './waiver-rule-form.component.scss',
})
export class WaiverRuleFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private waiverRuleService: WaiverRuleService,
    private masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  waiverRuleId: number | null = null;
  errorMessage = '';

  candidateTypeOptions = [
    { label: 'Any', value: null },
    { label: 'Internal', value: WaiverCandidateTypeEnum.Internal },
    { label: 'External', value: WaiverCandidateTypeEnum.External },
  ];

  specialCategoryOptions: { label: string; value: number | null }[] = [{ label: 'Any', value: null }];
  referralSourceOptions: { label: string; value: number | null }[] = [{ label: 'Any', value: null }];

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdownOptions();

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.waiverRuleId = +idParam;
        this.isEditMode = true;
        this.loadItem(this.waiverRuleId);
      } else {
        this.isEditMode = false;
        this.waiverRuleId = null;
      }
      this.setBreadcrumbs();
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(200)]],
      description: [null, [Validators.maxLength(1000)]],
      candidateTypeFilter: [null],
      specialCategoryId: [null],
      referralSourceId: [null],
      priority: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });
  }

  private loadDropdownOptions(): void {
    this.masterDataService.getAll('special-category').subscribe({
      next: (response) => {
        const items: IMasterDataItem[] = !response.hasError && response.content ? response.content : [];
        this.specialCategoryOptions = [
          { label: 'Any', value: null },
          ...items.map((item) => ({ label: item['name'] as string, value: item['specialCategoryId'] as number })),
        ];
      },
    });

    this.masterDataService.getAll('referral-source').subscribe({
      next: (response) => {
        const items: IMasterDataItem[] = !response.hasError && response.content ? response.content : [];
        this.referralSourceOptions = [
          { label: 'Any', value: null },
          ...items.map((item) => ({ label: item['name'] as string, value: item['referralSourceId'] as number })),
        ];
      },
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/waiver-rule-management/waiver-rule-list' },
      { title: 'Fee Waiver Rules', icon: 'fa-solid fa-hand-holding-dollar', href: '/waiver-rule-management/waiver-rule-list' },
      {
        title: this.isEditMode ? 'Edit Waiver Rule' : 'Add Waiver Rule',
        icon: 'fa-solid fa-edit',
        href: '/waiver-rule-management/manage-waiver-rule',
      },
    ]);
  }

  private loadItem(id: number): void {
    this.waiverRuleService.getAll().subscribe({
      next: (response) => {
        const item = (response.content || []).find((i) => i.waiverRuleId === id);
        if (item) {
          this.form.patchValue(item);
        } else {
          this.router.navigate(['/waiver-rule-management', 'waiver-rule-list']);
        }
      },
      error: () => {
        this.router.navigate(['/waiver-rule-management', 'waiver-rule-list']);
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: IWaiverRuleRequest = this.form.value;

    if (this.isEditMode && this.waiverRuleId) {
      this.waiverRuleService.update(this.waiverRuleId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/waiver-rule-management', 'waiver-rule-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update waiver rule.';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update waiver rule.';
        },
      });
    } else {
      this.waiverRuleService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/waiver-rule-management', 'waiver-rule-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create waiver rule.';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create waiver rule.';
        },
      });
    }
  }
}
