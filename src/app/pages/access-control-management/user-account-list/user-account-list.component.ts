import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUserAccountResponse } from '@core/interfaces/recruitment-management/access-control.interface';
import { ICompanyResponse } from '@core/interfaces/recruitment-management/company.interface';
import { UserAccountService } from '@core/services/recruitment/access-control/access-control.service';
import { CompanyService } from '@core/services/recruitment/company/company.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ImpersonationService } from '@core/services/recruitment/impersonation/impersonation.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';
import { TableStateService } from '@app/@core/services/table-state.service';

@Component({
  selector: 'app-user-account-list',
  standalone: false,
  templateUrl: './user-account-list.component.html',
  styleUrl: './user-account-list.component.scss',
})
export class UserAccountListComponent implements OnInit {
  private readonly STATE_KEY = 'user-account-list';

  constructor(
    private userAccountService: UserAccountService,
    private companyService: CompanyService,
    private confirmationService: ConfirmationService,
    private impersonationService: ImpersonationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
    private tableState: TableStateService,
  ) {}

  accounts: IUserAccountResponse[] = [];
  companyOptions: ICompanyResponse[] = [];
  loading = false;
  impersonatingId: number | null = null;

  filtersCollapsed = true;
  selectedCompanyId: number | null = null;
  selectedRole: string | null = null;
  roleFilterOptions = [
    { label: 'Admin', value: 'Admin' },
    { label: 'HR', value: 'HR' },
    { label: 'SuperAdmin', value: 'SuperAdmin' },
  ];

  get filteredAccounts(): IUserAccountResponse[] {
    return this.accounts.filter((account) => {
      const companyMatch = !this.selectedCompanyId || account.companyId === this.selectedCompanyId;
      const roleMatch = !this.selectedRole || account.roleNames.includes(this.selectedRole);
      return companyMatch && roleMatch;
    });
  }

  applyFilters(): void {
    this.filtersCollapsed = true;
    this.saveState();
  }

  resetFilters(): void {
    this.selectedCompanyId = null;
    this.selectedRole = null;
    this.filtersCollapsed = false;
    this.saveState();
  }

  get isSuperAdmin(): boolean {
    return this.authService.getRole() === UserRoleEnum.SuperAdmin;
  }

  canManage(account: IUserAccountResponse): boolean {
    return this.isSuperAdmin || !account.roleNames.includes('SuperAdmin');
  }

  canChangeActiveState(account: IUserAccountResponse): boolean {
    // The API is the authority, but hiding this destructive action prevents a user from
    // accidentally trying to lock themselves out. In an impersonated session getUser()
    // represents the impersonated identity, which is the account the API will protect.
    return this.canManage(account) && (!account.isActive || account.email !== this.authService.getUser()?.username);
  }

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.restoreState();
    this.setBreadcrumbs();
    this.loadAccounts();
    if (this.isSuperAdmin) this.loadCompanyOptions();
  }

  private restoreState(): void {
    const s = this.tableState.load<{
      selectedCompanyId: number | null;
      selectedRole: string | null;
    }>(this.STATE_KEY);
    if (s) {
      this.selectedCompanyId = s.selectedCompanyId ?? this.selectedCompanyId;
      this.selectedRole = s.selectedRole ?? this.selectedRole;
    }
  }

  private saveState(): void {
    this.tableState.save(this.STATE_KEY, {
      selectedCompanyId: this.selectedCompanyId,
      selectedRole: this.selectedRole,
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/access-control/user-account-list' },
      { title: 'User Accounts', icon: 'fa-solid fa-users', href: '/access-control/user-account-list' },
    ]);
  }

  private loadCompanyOptions(): void {
    this.companyService.getAll().subscribe({
      next: (response) => {
        this.companyOptions = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.companyOptions = [];
      },
    });
  }

  loadAccounts(): void {
    this.loading = true;
    this.saveState();
    this.userAccountService.getAll().subscribe({
      next: (response) => {
        this.accounts = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.accounts = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleActive(account: IUserAccountResponse, event: Event): void {
    if (!this.canChangeActiveState(account)) return;

    const nextState = !account.isActive;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `${nextState ? 'Reactivate' : 'Deactivate'} ${account.fullName}?`,
      header: 'Confirm',
      acceptButtonStyleClass: nextState ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.userAccountService.setActive(account.userAccountId, nextState).subscribe({
          next: () => {
            account.isActive = nextState;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error updating user account active state:', error);
          },
        });
      },
    });
  }

  impersonate(account: IUserAccountResponse): void {
    this.impersonatingId = account.userAccountId;
    this.impersonationService.start({ targetUserAccountId: account.userAccountId }).subscribe({
      next: (response) => {
        this.impersonatingId = null;
        if (response && !response.hasError && response.content) {
          this.authService.startImpersonation(response.content);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.impersonatingId = null;
        console.error('Error starting impersonation:', error);
        this.cdr.detectChanges();
      },
    });
  }
}
