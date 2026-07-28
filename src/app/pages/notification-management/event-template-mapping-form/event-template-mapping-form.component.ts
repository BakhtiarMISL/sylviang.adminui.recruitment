import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { NotificationChannelEnum, NotificationRecipientTypeEnum, RecruitmentEventEnum } from '@app/@core/enums/recruitment.enum';
import { EventTemplateMappingService } from '@app/@core/services/recruitment/event-template-mapping/event-template-mapping.service';
import { NotificationTemplateService } from '@app/@core/services/recruitment/notification-template/notification-template.service';
import { INotificationTemplateResponse } from '@core/interfaces/recruitment-management/notification-template.interface';
import { IEventTemplateMappingResponse } from '@core/interfaces/recruitment-management/event-template-mapping.interface';

const EVENT_OPTIONS = Object.values(RecruitmentEventEnum).map((value) => ({ label: value, value }));
const CHANNEL_OPTIONS = [
  { label: 'Email', value: NotificationChannelEnum.Email },
  { label: 'SMS', value: NotificationChannelEnum.Sms },
  { label: 'In-App', value: NotificationChannelEnum.InApp },
  { label: 'Push', value: NotificationChannelEnum.Push },
];
const RECIPIENT_OPTIONS = [
  { label: 'Candidate', value: NotificationRecipientTypeEnum.Candidate },
  { label: 'Admin / HR', value: NotificationRecipientTypeEnum.AdminHr },
];

@Component({
  selector: 'app-event-template-mapping-form',
  standalone: false,
  templateUrl: './event-template-mapping-form.component.html',
  styleUrl: './event-template-mapping-form.component.scss',
})
export class EventTemplateMappingFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private eventTemplateMappingService: EventTemplateMappingService,
    private notificationTemplateService: NotificationTemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  mappingId: number | null = null;
  errorMessage = '';

  eventOptions = EVENT_OPTIONS;
  channelOptions = CHANNEL_OPTIONS;
  recipientOptions = RECIPIENT_OPTIONS;

  allTemplates: INotificationTemplateResponse[] = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      recruitmentEvent: [null, [Validators.required]],
      channel: [null, [Validators.required]],
      recipientType: [null, [Validators.required]],
      notificationTemplateId: [null, [Validators.required]],
      isActive: [true],
    });

    this.loadTemplates();

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.mappingId = +idParam;
        this.isEditMode = true;
        this.form.get('recruitmentEvent')?.disable();
        this.form.get('channel')?.disable();
        this.form.get('recipientType')?.disable();
        this.loadMapping(this.mappingId);
      } else {
        this.isEditMode = false;
        this.mappingId = null;
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/notification-management/event-template-mapping-list' },
      { title: 'Event → Template Mapping', icon: 'fa-solid fa-diagram-project', href: '/notification-management/event-template-mapping-list' },
      {
        title: this.isEditMode ? 'Edit Mapping' : 'Add Mapping',
        icon: 'fa-solid fa-edit',
        href: '/notification-management/manage-event-template-mapping',
      },
    ]);
  }

  private loadTemplates(): void {
    this.notificationTemplateService.getAll().subscribe({
      next: (response) => {
        this.allTemplates = !response.hasError && response.content ? response.content : [];
      },
    });
  }

  private loadMapping(id: number): void {
    this.eventTemplateMappingService.getAll().subscribe({
      next: (response) => {
        const item = (response.content || []).find((m: IEventTemplateMappingResponse) => m.eventTemplateMappingId === id);
        if (item) {
          this.form.patchValue(item);
        } else {
          this.router.navigate(['/notification-management/event-template-mapping-list']);
        }
      },
      error: () => {
        this.router.navigate(['/notification-management/event-template-mapping-list']);
      },
    });
  }

  get templateOptionsForChannel() {
    const channel = this.form?.get('channel')?.value;
    const templates = channel ? this.allTemplates.filter((t) => t.channel === channel) : this.allTemplates;
    return templates.map((t) => ({ label: `${t.name} (${t.code})`, value: t.notificationTemplateId }));
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

    if (this.isEditMode && this.mappingId) {
      const request = {
        notificationTemplateId: this.form.value.notificationTemplateId,
        isActive: this.form.value.isActive,
      };
      this.eventTemplateMappingService.update(this.mappingId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/notification-management/event-template-mapping-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update mapping';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update mapping';
        },
      });
    } else {
      const request = {
        recruitmentEvent: this.form.value.recruitmentEvent,
        channel: this.form.value.channel,
        recipientType: this.form.value.recipientType,
        notificationTemplateId: this.form.value.notificationTemplateId,
      };
      this.eventTemplateMappingService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/notification-management/event-template-mapping-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create mapping';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create mapping';
        },
      });
    }
  }
}
