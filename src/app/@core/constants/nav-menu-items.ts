import { IMenuItem } from '../interfaces/menuResponse.interface';
import { UserRoleEnum } from '../enums/user-role.enum';

export const webSidebarMenuItems: IMenuItem[] = [
  {
    href: '/dashboard',
    title: 'Dashboard',
    active: false,
    icon: 'fa-solid fa-chart-line',
    roles: [UserRoleEnum.Admin, UserRoleEnum.HR],
  },
  {
    title: 'Recruitment',
    active: false,
    icon: 'fa-solid fa-briefcase',
    roles: [UserRoleEnum.Admin, UserRoleEnum.HR],
    subItems: [
      // ── Setup: configure before a vacancy can be posted/run ──
      {
        href: '/hiring-pipeline/hiring-pipeline-list',
        title: 'Hiring Pipelines',
        active: false,
        icon: 'fa-solid fa-diagram-project',
      },
      {
        href: '/scorecards/scorecard-list',
        title: 'Scorecard Templates',
        active: false,
        icon: 'fa-solid fa-clipboard-list',
      },
      {
        href: '/exam-questions/question-group-list',
        title: 'Question Groups',
        active: false,
        icon: 'fa-solid fa-layer-group',
      },
      {
        href: '/exam-questions/exam-question-list',
        title: 'Exam Questions',
        active: false,
        icon: 'fa-solid fa-circle-question',
      },
      {
        href: '/exam-venues/exam-venue-list',
        title: 'Exam Venues',
        active: false,
        icon: 'fa-solid fa-building',
      },
      {
        href: '/interview-venues/interview-venue-list',
        title: 'Interview Venues',
        active: false,
        icon: 'fa-solid fa-door-open',
      },
      // ── Vacancy & sourcing ──
      {
        href: '/job-vacancy/job-vacancy-list',
        title: 'Job Vacancies',
        active: false,
        icon: 'fa-solid fa-list',
      },
      {
        href: '/candidates',
        title: 'Candidates',
        active: false,
        icon: 'fa-solid fa-users',
      },
      {
        href: '/talent-pools/talent-pool-list',
        title: 'Talent Pools',
        active: false,
        icon: 'fa-solid fa-user-group',
      },
      {
        href: '/shortlist-filters/shortlist-filter-list',
        title: 'Shortlist Filters',
        active: false,
        icon: 'fa-solid fa-filter',
      },
      {
        href: '/applications',
        title: 'ATS Dashboard',
        active: false,
        icon: 'fa-solid fa-list-check',
      },
      // ── Exam stage ──
      {
        href: '/exams/exam-list',
        title: 'Exams',
        active: false,
        icon: 'fa-solid fa-file-pen',
      },
      // ── Interview stage ──
      {
        href: '/interviews/interview-list',
        title: 'Interviews',
        active: false,
        icon: 'fa-solid fa-people-arrows',
      },
      // ── Selection ──
      {
        href: '/final-selection-pool/final-selection-pool-list',
        title: 'Final Selection Pool',
        active: false,
        icon: 'fa-solid fa-clipboard-check',
      },
      {
        href: '/document-management/manage-fitment-data',
        title: 'Fitment Data',
        active: false,
        icon: 'fa-solid fa-sack-dollar',
      },
      {
        href: '/document-management/office-note-list',
        title: 'Office Notes',
        active: false,
        icon: 'fa-solid fa-file-pen',
      },
      {
        href: '/document-management/document-tracking-list',
        title: 'Document Tracking',
        active: false,
        icon: 'fa-solid fa-list-check',
      },
      {
        href: '/document-management/joining-booklet-list',
        title: 'Joining Booklets',
        active: false,
        icon: 'fa-solid fa-book',
      },
      // ── Payment ──
      {
        href: '/payment-management/payment-transaction-list',
        title: 'Payment Transactions',
        active: false,
        icon: 'fa-solid fa-money-bill-transfer',
      },
      {
        href: '/payment-management/reconciliation-report',
        title: 'Reconciliation Report',
        active: false,
        icon: 'fa-solid fa-file-invoice-dollar',
      },
      // ── Reporting/utility (anytime) ──
      {
        href: '/analytics/recruitment',
        title: 'Recruitment Analytics',
        active: false,
        icon: 'fa-solid fa-chart-column',
      },
      {
        href: '/export-requests/export-request-list',
        title: 'Export Requests',
        active: false,
        icon: 'fa-solid fa-file-export',
      },
    ],
  },
  {
    href: '/internal-jobs/job-list',
    title: 'Internal Job Board',
    active: false,
    icon: 'fa-solid fa-building',
  },
  {
    href: '/candidate-profile',
    title: 'My Profile',
    active: false,
    icon: 'fa-solid fa-id-card',
    roles: [UserRoleEnum.Candidate],
  },
  {
    href: '/careers',
    title: 'Browse Careers',
    active: false,
    icon: 'fa-solid fa-magnifying-glass',
    roles: [UserRoleEnum.Candidate],
  },
  {
    href: '/my-applications',
    title: 'My Applications',
    active: false,
    icon: 'fa-solid fa-list-check',
    roles: [UserRoleEnum.Candidate],
  },
  {
    href: '/candidate-profile/offer-letters',
    title: 'My Offer Letters',
    active: false,
    icon: 'fa-solid fa-file-signature',
    roles: [UserRoleEnum.Candidate],
  },
  {
    href: '/candidate-profile/appointment-letters',
    title: 'My Appointment Letters',
    active: false,
    icon: 'fa-solid fa-file-contract',
    roles: [UserRoleEnum.Candidate],
  },
  {
    href: '/candidate-profile/pre-boarding',
    title: 'Pre-Boarding',
    active: false,
    icon: 'fa-solid fa-clipboard-list',
    roles: [UserRoleEnum.Candidate],
  },
  {
    href: '/account-settings',
    title: 'Account Settings',
    active: false,
    icon: 'fa-solid fa-user-gear',
  },
  {
    href: '/application-settings',
    title: 'Application Settings',
    active: false,
    icon: 'fa-solid fa-sliders',
    roles: [UserRoleEnum.Admin, UserRoleEnum.HR],
  },
  {
    title: 'System Administration',
    active: false,
    icon: 'fa-solid fa-gears',
    roles: [UserRoleEnum.Admin],
    subItems: [
      {
        href: '/branding-settings',
        title: 'Branding Settings',
        active: false,
        icon: 'fa-solid fa-palette',
      },
      {
        href: '/master-data/country-list',
        title: 'Countries',
        active: false,
        icon: 'fa-solid fa-earth-asia',
      },
      {
        href: '/master-data/education-board-list',
        title: 'Education Boards',
        active: false,
        icon: 'fa-solid fa-landmark',
      },
      {
        href: '/master-data/degree-list',
        title: 'Degrees',
        active: false,
        icon: 'fa-solid fa-graduation-cap',
      },
      {
        href: '/master-data/university-list',
        title: 'Universities',
        active: false,
        icon: 'fa-solid fa-building-columns',
      },
      {
        href: '/master-data/department-list',
        title: 'Departments',
        active: false,
        icon: 'fa-solid fa-building',
      },
      {
        href: '/master-data/gender-list',
        title: 'Genders',
        active: false,
        icon: 'fa-solid fa-venus-mars',
      },
      {
        href: '/master-data/marital-status-list',
        title: 'Marital Statuses',
        active: false,
        icon: 'fa-solid fa-ring',
      },
      {
        href: '/master-data/religion-list',
        title: 'Religions',
        active: false,
        icon: 'fa-solid fa-place-of-worship',
      },
      {
        href: '/master-data/major-subject-ssc-hsc-list',
        title: 'Major Subjects (SSC/HSC)',
        active: false,
        icon: 'fa-solid fa-book',
      },
      {
        href: '/master-data/major-subject-university-list',
        title: 'Major Subjects (University)',
        active: false,
        icon: 'fa-solid fa-book-open',
      },
      {
        href: '/master-data/blood-group-list',
        title: 'Blood Groups',
        active: false,
        icon: 'fa-solid fa-droplet',
      },
      {
        href: '/master-data/special-category-list',
        title: 'Special Categories',
        active: false,
        icon: 'fa-solid fa-star',
      },
      {
        href: '/master-data/referral-source-list',
        title: 'Referral Sources',
        active: false,
        icon: 'fa-solid fa-share-nodes',
      },
      {
        href: '/waiver-rule-management/waiver-rule-list',
        title: 'Fee Waiver Rules',
        active: false,
        icon: 'fa-solid fa-hand-holding-dollar',
      },
      {
        href: '/notification-management/notification-template-list',
        title: 'Notification Templates',
        active: false,
        icon: 'fa-solid fa-envelope-open-text',
      },
      {
        href: '/notification-management/event-template-mapping-list',
        title: 'Event → Template Mapping',
        active: false,
        icon: 'fa-solid fa-diagram-project',
      },
      {
        href: '/document-management/document-template-list',
        title: 'Document Templates',
        active: false,
        icon: 'fa-solid fa-file-lines',
      },
      {
        href: '/document-management/offer-letter-list',
        title: 'Offer Letters',
        active: false,
        icon: 'fa-solid fa-file-signature',
      },
      {
        href: '/document-management/appointment-letter-list',
        title: 'Appointment Letters',
        active: false,
        icon: 'fa-solid fa-file-contract',
      },
      {
        href: '/document-management/document-tracking-list',
        title: 'Document Tracking',
        active: false,
        icon: 'fa-solid fa-list-check',
      },
      {
        href: '/document-management/joining-booklet-list',
        title: 'Joining Booklets',
        active: false,
        icon: 'fa-solid fa-book',
      },
      {
        href: '/profile-field-config/profile-field-config-list',
        title: 'Profile Field Config',
        active: false,
        icon: 'fa-solid fa-sliders',
      },
    ],
  },
  // Multi-tenant: SuperAdmin-only. Company Admin/HR never see this - they manage their own
  // company's recruitment data, never the company record itself or any other tenant's.
  {
    title: 'Companies',
    active: false,
    icon: 'fa-solid fa-building',
    href: '/company-management/company-list',
    roles: [UserRoleEnum.SuperAdmin],
  },
  // Split out from System Administration (which stays Admin-only) so SuperAdmin - a narrow
  // support/ops role, not a bigger Admin - can reach exactly what it actually needs: inviting/
  // managing HR/Admin accounts and impersonating one (the "Impersonate" button lives inline on
  // the User Accounts row, no separate page for it). Roles stays Admin-only below - designing
  // role/permission structures is an Admin call, not part of SuperAdmin's job.
  {
    title: 'Access Control',
    active: false,
    icon: 'fa-solid fa-user-shield',
    roles: [UserRoleEnum.Admin, UserRoleEnum.SuperAdmin],
    subItems: [
      {
        href: '/access-control/user-account-list',
        title: 'User Accounts',
        active: false,
        icon: 'fa-solid fa-users-gear',
      },
      {
        href: '/access-control/role-list',
        roles: [UserRoleEnum.Admin],
        title: 'Roles',
        active: false,
        icon: 'fa-solid fa-user-shield',
      },
    ],
  },
];
