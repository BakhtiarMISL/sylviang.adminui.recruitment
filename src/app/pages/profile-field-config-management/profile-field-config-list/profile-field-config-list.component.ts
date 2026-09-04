import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CandidateProfileFieldEnum,
  IProfileFieldConfigResponse,
  ProfileFieldVisibilityEnum,
} from '@core/interfaces/recruitment-management/profile-field-config.interface';
import { ProfileFieldConfigService } from '@core/services/recruitment/profile-field-config/profile-field-config.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-profile-field-config-list',
  standalone: false,
  templateUrl: './profile-field-config-list.component.html',
  styleUrl: './profile-field-config-list.component.scss',
})
export class ProfileFieldConfigListComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private profileFieldConfigService: ProfileFieldConfigService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
  ) {}

  configs: IProfileFieldConfigResponse[] = [];
  loading = false;
  errorMessage = '';
  formSubmitted = false;

  fieldOptions = Object.values(CandidateProfileFieldEnum);
  visibilityOptions = Object.values(ProfileFieldVisibilityEnum);

  form!: FormGroup;

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.form = this.fb.group({
      field: [null, [Validators.required]],
      jobPostingId: [null],
      visibility: [null, [Validators.required]],
    });

    this.loadConfigs();
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/profile-field-config/profile-field-config-list' },
      { title: 'Profile Field Config', icon: 'fa-solid fa-sliders', href: '/profile-field-config/profile-field-config-list' },
    ]);
  }

  loadConfigs(): void {
    this.loading = true;
    this.profileFieldConfigService.getAll().subscribe({
      next: (response) => {
        this.configs = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.configs = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.profileFieldConfigService.create(this.form.value).subscribe({
      next: (response) => {
        if (response && !response.hasError) {
          this.form.reset();
          this.formSubmitted = false;
          this.loadConfigs();
        } else {
          this.errorMessage = response?.decentMessage || 'Failed to create config';
        }
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to create config';
      },
    });
  }

  deleteConfig(config: IProfileFieldConfigResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Remove the config for "${config.field}"${config.jobPostingId ? ' (posting #' + config.jobPostingId + ')' : ' (global)'}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.profileFieldConfigService.delete(config.profileFieldConfigId).subscribe({
          next: () => this.loadConfigs(),
          error: (error) => console.error('Error deleting profile field config:', error),
        });
      },
    });
  }
}
