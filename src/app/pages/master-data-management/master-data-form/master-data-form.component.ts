import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { MasterDataService } from '@app/@core/services/recruitment/master-data/master-data.service';
import { IMasterDataEntityConfig, IMasterDataItem } from '@core/interfaces/recruitment-management/master-data.interface';

@Component({
  selector: 'app-master-data-form',
  standalone: false,
  templateUrl: './master-data-form.component.html',
  styleUrl: './master-data-form.component.scss',
})
export class MasterDataFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  config!: IMasterDataEntityConfig;
  form!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  itemId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.config = data['config'];
      this.buildForm();

      this.route.paramMap.subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          this.itemId = +idParam;
          this.isEditMode = true;
          this.loadItem(this.itemId);
        } else {
          this.isEditMode = false;
          this.itemId = null;
        }
        this.setBreadcrumbs();
      });
    });
  }

  private buildForm(): void {
    const controls: Record<string, unknown> = {};
    for (const field of this.config.fields) {
      const validators: ValidatorFn[] = [];
      if (field.required) validators.push(Validators.required);
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
      if (field.pattern) validators.push(Validators.pattern(field.pattern));
      controls[field.key] = [null, validators];
    }
    this.form = this.fb.group(controls);
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: `/master-data/${this.config.routeKey}-list` },
      { title: this.config.title, icon: this.config.icon, href: `/master-data/${this.config.routeKey}-list` },
      {
        title: this.isEditMode ? `Edit ${this.config.singularLabel}` : `Add ${this.config.singularLabel}`,
        icon: 'fa-solid fa-edit',
        href: `/master-data/manage-${this.config.routeKey}`,
      },
    ]);
  }

  private loadItem(id: number): void {
    this.masterDataService.getAll(this.config.apiPath).subscribe({
      next: (response) => {
        const item = (response.content || []).find((i) => i[this.config.idField] === id);
        if (item) {
          this.form.patchValue(item);
        } else {
          this.router.navigate(['/master-data', `${this.config.routeKey}-list`]);
        }
      },
      error: () => {
        this.router.navigate(['/master-data', `${this.config.routeKey}-list`]);
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  patternError(fieldName: string): string | null {
    const field = this.config.fields.find((f) => f.key === fieldName);
    return field?.patternMessage ?? null;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: IMasterDataItem = { ...this.form.value };

    if (this.isEditMode && this.itemId) {
      this.masterDataService.update(this.config.apiPath, this.itemId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/master-data', `${this.config.routeKey}-list`]);
          } else {
            this.errorMessage = response?.decentMessage || `Failed to update ${this.config.singularLabel.toLowerCase()}`;
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || `Failed to update ${this.config.singularLabel.toLowerCase()}`;
        },
      });
    } else {
      this.masterDataService.create(this.config.apiPath, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/master-data', `${this.config.routeKey}-list`]);
          } else {
            this.errorMessage = response?.decentMessage || `Failed to create ${this.config.singularLabel.toLowerCase()}`;
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || `Failed to create ${this.config.singularLabel.toLowerCase()}`;
        },
      });
    }
  }
}
