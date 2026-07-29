import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { IWaiverRuleResponse } from '@core/interfaces/recruitment-management/waiver-rule.interface';
import { WaiverRuleService } from '@core/services/recruitment/waiver-rule/waiver-rule.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-waiver-rule-list',
  standalone: false,
  templateUrl: './waiver-rule-list.component.html',
  styleUrl: './waiver-rule-list.component.scss',
})
export class WaiverRuleListComponent implements OnInit {
  constructor(
    private waiverRuleService: WaiverRuleService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IWaiverRuleResponse[] = [];
  loading = false;
  errorMessage = '';

  get skeletonItems() {
    return Array(4)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/waiver-rule-management/waiver-rule-list' },
      { title: 'Fee Waiver Rules', icon: 'fa-solid fa-hand-holding-dollar', href: '/waiver-rule-management/waiver-rule-list' },
    ]);
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.waiverRuleService.getAll().subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.items = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteItem(item: IWaiverRuleResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete waiver rule "${item.name}"? This cannot be undone.`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-trash',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.waiverRuleService.delete(item.waiverRuleId).subscribe({
          next: () => this.loadItems(),
          error: (error) => {
            this.errorMessage = error?.error?.decentMessage || 'Failed to delete waiver rule.';
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
