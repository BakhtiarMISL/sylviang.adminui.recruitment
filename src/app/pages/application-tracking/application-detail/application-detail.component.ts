import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IApplicationStatusReason, IJobApplicationDetail } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { BreadcrumbService } from '@app/@core/services';
import { Base_URL } from '@env/environment';
import { ApplicationStatusOptions, ApplicationStatusTransitions, StatusesRequiringReason } from '../application-status-transitions.constants';

@Component({
  selector: 'app-application-detail',
  standalone: false,
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss',
})
export class ApplicationDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private jobApplicationService: JobApplicationService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  jobApplicationId!: number;
  application: IJobApplicationDetail | null = null;
  loading = true;
  loadError = '';

  nextStatusOptions: { label: string; value: ApplicationStatusEnum }[] = [];
  selectedNextStatus: ApplicationStatusEnum | null = null;
  reasonOptions: IApplicationStatusReason[] = [];
  selectedReasonId: number | null = null;
  note = '';
  updating = false;
  updateError = '';
  updateSuccess = false;

  ngOnInit(): void {
    this.jobApplicationId = Number(this.route.snapshot.paramMap.get('id'));
    this.breadcrumbService.setBreadcrumbs([
      { title: 'ATS Dashboard', icon: 'fa-solid fa-list-check', href: '/applications' },
      { title: 'Application Detail', icon: 'fa-solid fa-file-lines', href: `/applications/${this.jobApplicationId}` },
    ]);
    this.loadApplication();
  }

  loadApplication(): void {
    this.loading = true;
    this.loadError = '';
    this.jobApplicationService.getDetail(this.jobApplicationId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.application = response.content;
          this.nextStatusOptions = (ApplicationStatusTransitions[this.application.applicationStatus] || []).map((value) => ({
            label: ApplicationStatusOptions.find((o) => o.value === value)?.label || value,
            value,
          }));
        } else {
          this.loadError = response?.decentMessage || 'Failed to load application.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load application.';
      },
    });
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '';
    return `${Base_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  onNextStatusChange(status: ApplicationStatusEnum | null): void {
    this.selectedReasonId = null;
    this.reasonOptions = [];

    if (status && StatusesRequiringReason.includes(status)) {
      this.jobApplicationService.getStatusReasons(status).subscribe({
        next: (response) => {
          this.reasonOptions = response && !response.hasError && response.content ? response.content : [];
        },
      });
    }
  }

  requiresReason(): boolean {
    return !!this.selectedNextStatus && StatusesRequiringReason.includes(this.selectedNextStatus);
  }

  canUpdateStatus(): boolean {
    if (!this.selectedNextStatus) return false;
    return !this.requiresReason() || !!this.selectedReasonId;
  }

  updateStatus(): void {
    if (!this.selectedNextStatus) return;

    this.updating = true;
    this.updateError = '';
    this.updateSuccess = false;

    this.jobApplicationService
      .updateStatus(this.jobApplicationId, {
        toStatus: this.selectedNextStatus,
        reasonId: this.selectedReasonId ?? undefined,
        note: this.note || undefined,
      })
      .subscribe({
        next: () => {
          this.updating = false;
          this.updateSuccess = true;
          this.selectedNextStatus = null;
          this.selectedReasonId = null;
          this.note = '';
          this.loadApplication();
        },
        error: (error) => {
          this.updating = false;
          this.updateError = error?.error?.decentMessage || 'Failed to update status.';
        },
      });
  }
}
