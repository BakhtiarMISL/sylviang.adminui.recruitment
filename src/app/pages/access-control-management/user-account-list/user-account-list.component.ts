import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IUserAccountResponse } from '@core/interfaces/recruitment-management/access-control.interface';
import { UserAccountService } from '@core/services/recruitment/access-control/access-control.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-user-account-list',
  standalone: false,
  templateUrl: './user-account-list.component.html',
  styleUrl: './user-account-list.component.scss',
})
export class UserAccountListComponent implements OnInit {
  constructor(
    private userAccountService: UserAccountService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  accounts: IUserAccountResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
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
}
