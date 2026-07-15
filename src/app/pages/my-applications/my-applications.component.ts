import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { IMyApplication } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-my-applications',
  standalone: false,
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.scss',
})
export class MyApplicationsComponent implements OnInit {
  constructor(
    private jobApplicationService: JobApplicationService,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  applications: IMyApplication[] = [];
  loading = true;
  loadError = '';
  withdrawingId: number | null = null;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      {
        title: 'My Applications',
        icon: 'fa-solid fa-list-check',
        href: '/my-applications',
      },
    ]);
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.loadError = '';
    this.jobApplicationService.getMyApplications().subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError) {
          this.applications = response.content || [];
        } else {
          this.loadError = response?.decentMessage || 'Failed to load your applications.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load your applications.';
      },
    });
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  confirmWithdraw(event: Event, application: IMyApplication): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Withdraw your application for "${application.jobPostingTitle || 'this position'}"? This cannot be undone.`,
      header: 'Confirm Withdrawal',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => this.withdraw(application),
    });
  }

  private withdraw(application: IMyApplication): void {
    this.withdrawingId = application.jobApplicationId;
    this.jobApplicationService.withdrawMyApplication(application.jobApplicationId).subscribe({
      next: (response) => {
        this.withdrawingId = null;
        if (response && !response.hasError) {
          this.toast.success({ detail: 'Application withdrawn.' });
          this.loadApplications();
        } else {
          this.toast.error({ detail: response?.decentMessage || 'Failed to withdraw application.' });
        }
      },
      error: (error) => {
        this.withdrawingId = null;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to withdraw application.' });
      },
    });
  }
}
