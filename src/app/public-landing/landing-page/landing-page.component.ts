import { Component, OnInit } from '@angular/core';
import { IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { CareerPortalService } from '@app/@core/services/recruitment/career-portal/career-portal.service';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements OnInit {
  constructor(private careerPortalService: CareerPortalService) {}

  featuredJobs: IPublicJobPostingResponse[] = [];
  loadingJobs = true;

  ngOnInit(): void {
    this.careerPortalService.getJobPostings({ pageNumber: 1, pageSize: 6 }).subscribe({
      next: (response) => {
        this.featuredJobs = response && !response.hasError && response.content ? response.content.data || [] : [];
        this.loadingJobs = false;
      },
      error: () => {
        this.featuredJobs = [];
        this.loadingJobs = false;
      },
    });
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
