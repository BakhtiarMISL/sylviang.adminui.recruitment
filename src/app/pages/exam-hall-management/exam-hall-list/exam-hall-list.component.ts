import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IExamHallResponse } from '@app/@core/interfaces/recruitment-management/exam-hall.interface';
import { ExamHallService } from '@app/@core/services/recruitment/exam-hall/exam-hall.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-exam-hall-list',
  standalone: false,
  templateUrl: './exam-hall-list.component.html',
  styleUrl: './exam-hall-list.component.scss',
})
export class ExamHallListComponent implements OnInit {
  constructor(
    private examHallService: ExamHallService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  halls: IExamHallResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-halls/exam-hall-list' },
      { title: 'Exam Halls', icon: 'fa-solid fa-door-open', href: '/exam-halls/exam-hall-list' },
    ]);
    this.loadHalls();
  }

  loadHalls(): void {
    this.loading = true;
    this.examHallService.getAll().subscribe({
      next: (response) => {
        this.halls = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.halls = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleActiveStatus(hall: IExamHallResponse, event: Event): void {
    const nextStatus = !hall.isActive;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} exam hall: ${hall.hallName}?`,
      header: nextStatus ? 'Activate Confirmation' : 'Deactivate Confirmation',
      acceptButtonStyleClass: nextStatus ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.examHallService.setActiveStatus(hall.examHallId, { isActive: nextStatus }).subscribe({
          next: () => this.loadHalls(),
          error: (error) => {
            console.error('Error updating exam hall status:', error);
          },
        });
      },
    });
  }
}
