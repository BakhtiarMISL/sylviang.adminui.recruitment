import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreadcrumbService } from '@app/@core/services';
import { AppointmentLetterCandidateService } from '@app/@core/services/recruitment/appointment-letter-candidate/appointment-letter-candidate.service';
import { IAppointmentLetterResponse } from '@core/interfaces/recruitment-management/appointment-letter.interface';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-my-appointment-letter-detail',
  standalone: false,
  templateUrl: './my-appointment-letter-detail.component.html',
  styleUrl: './my-appointment-letter-detail.component.scss',
})
export class MyAppointmentLetterDetailComponent implements OnInit, OnDestroy {
  constructor(
    private appointmentLetterCandidateService: AppointmentLetterCandidateService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  item: IAppointmentLetterResponse | null = null;
  loading = false;
  errorMessage = '';
  pdfUrl: SafeResourceUrl | null = null;

  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'My Appointment Letters', icon: 'fa-solid fa-file-contract', href: '/candidate-profile/appointment-letters' },
      { title: 'View Appointment Letter', icon: 'fa-solid fa-eye', href: '' },
    ]);

    // Subscribed rather than a one-time snapshot read - RouteReusableStrategy reuses this
    // component instance across navigations between two letter ids.
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.load(Number(params.get('id')));
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private load(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.appointmentLetterCandidateService.getById(id).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.item = response.content;
          const url = `${Base_URL}${this.item.generatedPdfPath.startsWith('/') ? '' : '/'}${this.item.generatedPdfPath}`;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          this.errorMessage = response.decentMessage || 'Failed to load appointment letter.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to load appointment letter.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
