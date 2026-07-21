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

  readonly stats = [
    { value: 1200, suffix: '+', label: 'Candidates Hired' },
    { value: 85, suffix: '+', label: 'Hiring Partners' },
    { value: 15, suffix: '', label: 'Avg. Days to Hire' },
    { value: 98, suffix: '%', label: 'Client Satisfaction' },
  ];

  readonly steps = [
    {
      icon: 'fa-magnifying-glass',
      title: 'Discover a Role',
      description: 'Browse live openings across engineering, HR, and operations, refreshed by our hiring teams every week.',
    },
    {
      icon: 'fa-file-circle-check',
      title: 'Apply in Minutes',
      description: 'Create an account once, then apply to as many roles as you like with a saved profile and documents.',
    },
    {
      icon: 'fa-comments',
      title: 'Track & Hear Back',
      description: 'Follow your application status live and get notified the moment a hiring manager responds.',
    },
  ];

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
