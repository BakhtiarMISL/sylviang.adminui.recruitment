import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { CompanyStatusEnum, ICompanyResponse } from '@core/interfaces/recruitment-management/company.interface';
import { CompanyService } from '@core/services/recruitment/company/company.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-company-list',
  standalone: false,
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss',
})
export class CompanyListComponent implements OnInit {
  constructor(
    private companyService: CompanyService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  companies: ICompanyResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.loadCompanies();
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/company-management/company-list' },
      { title: 'Companies', icon: 'fa-solid fa-building', href: '/company-management/company-list' },
    ]);
  }

  loadCompanies(): void {
    this.loading = true;
    this.companyService.getAll().subscribe({
      next: (response) => {
        this.companies = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.companies = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  isActive(company: ICompanyResponse): boolean {
    return company.status === CompanyStatusEnum.Active;
  }

  toggleActive(company: ICompanyResponse, event: Event): void {
    const nextState = !this.isActive(company);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `${nextState ? 'Reactivate' : 'Deactivate'} ${company.name}? ${!nextState ? 'Its Admin/HR users will be blocked from new logins.' : ''}`,
      header: 'Confirm',
      acceptButtonStyleClass: nextState ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.companyService.setActive(company.companyId, nextState).subscribe({
          next: () => {
            company.status = nextState ? CompanyStatusEnum.Active : CompanyStatusEnum.Inactive;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error updating company active state:', error);
          },
        });
      },
    });
  }
}
