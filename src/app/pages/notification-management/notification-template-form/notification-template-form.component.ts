import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { NotificationChannelEnum } from '@app/@core/enums/recruitment.enum';
import { NotificationTemplateService } from '@app/@core/services/recruitment/notification-template/notification-template.service';
import { INotificationTemplateVersionResponse } from '@core/interfaces/recruitment-management/notification-template.interface';

const CHANNEL_OPTIONS = [
  { label: 'Email', value: NotificationChannelEnum.Email },
  { label: 'SMS', value: NotificationChannelEnum.Sms },
  { label: 'In-App', value: NotificationChannelEnum.InApp },
  { label: 'Push', value: NotificationChannelEnum.Push },
];

@Component({
  selector: 'app-notification-template-form',
  standalone: false,
  templateUrl: './notification-template-form.component.html',
  styleUrl: './notification-template-form.component.scss',
})
export class NotificationTemplateFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private notificationTemplateService: NotificationTemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  templateId: number | null = null;
  errorMessage = '';

  channelOptions = CHANNEL_OPTIONS;
  readonly NotificationChannelEnum = NotificationChannelEnum;

  detectedPlaceholders: string[] = [];
  previewSubject: string | undefined;
  previewBody = '';
  previewValues: Record<string, string> = {};
  previewing = false;

  versions: INotificationTemplateVersionResponse[] = [];
  showVersions = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      channel: [NotificationChannelEnum.Email, [Validators.required]],
      code: [null, [Validators.required, Validators.maxLength(100)]],
      name: [null, [Validators.required, Validators.maxLength(200)]],
      subject: [null, [Validators.maxLength(300)]],
      body: [null, [Validators.required]],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.templateId = +idParam;
        this.isEditMode = true;
        this.form.get('channel')?.disable();
        this.form.get('code')?.disable();
        this.loadTemplate(this.templateId);
        this.loadVersions(this.templateId);
      } else {
        this.isEditMode = false;
        this.templateId = null;
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/notification-management/notification-template-list' },
      { title: 'Notification Templates', icon: 'fa-solid fa-envelope-open-text', href: '/notification-management/notification-template-list' },
      {
        title: this.isEditMode ? 'Edit Template' : 'Add Template',
        icon: 'fa-solid fa-edit',
        href: '/notification-management/manage-notification-template',
      },
    ]);
  }

  private loadTemplate(id: number): void {
    this.notificationTemplateService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.form.patchValue(response.content);
        } else {
          this.router.navigate(['/notification-management/notification-template-list']);
        }
      },
      error: () => {
        this.router.navigate(['/notification-management/notification-template-list']);
      },
    });
  }

  private loadVersions(id: number): void {
    this.notificationTemplateService.getVersions(id).subscribe({
      next: (response) => {
        this.versions = !response.hasError && response.content ? response.content : [];
      },
    });
  }

  get isEmailChannel(): boolean {
    return this.form?.get('channel')?.value === NotificationChannelEnum.Email;
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  runPreview(): void {
    const subject = this.form.value.subject;
    const body = this.form.value.body;
    if (!body) return;

    this.previewing = true;
    this.notificationTemplateService.preview({ subject, body, placeholderValues: this.previewValues }).subscribe({
      next: (response) => {
        this.previewing = false;
        if (response && !response.hasError && response.content) {
          this.previewSubject = response.content.renderedSubject;
          this.previewBody = response.content.renderedBody;
          this.detectedPlaceholders = response.content.detectedPlaceholders;
          for (const token of this.detectedPlaceholders) {
            if (!(token in this.previewValues)) this.previewValues[token] = '';
          }
        }
      },
      error: () => {
        this.previewing = false;
      },
    });
  }

  toggleVersions(): void {
    this.showVersions = !this.showVersions;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.templateId) {
      const request = {
        name: this.form.value.name,
        subject: this.form.value.subject,
        body: this.form.value.body,
        isActive: true,
      };
      this.notificationTemplateService.update(this.templateId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/notification-management/notification-template-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update template';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update template';
        },
      });
    } else {
      const request = {
        channel: this.form.value.channel,
        code: this.form.value.code,
        name: this.form.value.name,
        subject: this.form.value.subject,
        body: this.form.value.body,
      };
      this.notificationTemplateService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/notification-management/notification-template-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create template';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create template';
        },
      });
    }
  }
}
