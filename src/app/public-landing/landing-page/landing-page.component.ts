import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
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
}
