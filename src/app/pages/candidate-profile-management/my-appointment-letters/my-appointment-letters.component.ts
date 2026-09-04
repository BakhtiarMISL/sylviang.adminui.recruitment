import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { AppointmentLetterCandidateService } from '@app/@core/services/recruitment/appointment-letter-candidate/appointment-letter-candidate.service';
import { IAppointmentLetterResponse } from '@core/interfaces/recruitment-management/appointment-letter.interface';

@Component({
  selector: 'app-my-appointment-letters',
  standalone: false,
  templateUrl: './my-appointment-letters.component.html',
  styleUrl: './my-appointment-letters.component.scss',
})
export class MyAppointmentLettersComponent implements OnInit {
  constructor(
    private appointmentLetterCandidateService: AppointmentLetterCandidateService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IAppointmentLetterResponse[] = [];
  loading = false;
  errorMessage = '';

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([{ title: 'My Appointment Letters', icon: 'fa-solid fa-file-contract', href: '/candidate-profile/appointment-letters' }]);
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.appointmentLetterCandidateService.getAll().subscribe({
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
}
