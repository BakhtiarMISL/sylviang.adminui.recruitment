import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/@core/services/auth/auth.service';
import { DashboardService } from '@app/@core/services/dashboard/dashboard.service';
import { UserRoleEnum } from '@app/@core/enums/user-role.enum';
import { IDashboardSummaryResponse } from '@app/@core/interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
  ) {}

  currentYear = new Date().getFullYear();
  readonly UserRoleEnum = UserRoleEnum;

  loading = true;
  summary: IDashboardSummaryResponse | null = null;

  get role(): UserRoleEnum | null {
    return this.authService.getRole();
  }

  get displayName(): string {
    return this.authService.getUser()?.displayName || 'there';
  }

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.summary = response.content;
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
