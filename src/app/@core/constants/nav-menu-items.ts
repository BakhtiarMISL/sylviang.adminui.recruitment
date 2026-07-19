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
      {
        href: '/job-vacancy/job-vacancy-list',
        title: 'Job Vacancies',
        active: false,
        icon: 'fa-solid fa-list',
      },
      {
        href: '/hiring-pipeline/hiring-pipeline-list',
        title: 'Hiring Pipelines',
        active: false,
        icon: 'fa-solid fa-diagram-project',
      },
      {
        href: '/shortlist-filters/shortlist-filter-list',
        title: 'Shortlist Filters',
        active: false,
        icon: 'fa-solid fa-filter',
      },
      {
        href: '/assessment-workflow/assessment-workflow-list',
        title: 'Assessment Workflows',
        active: false,
        icon: 'fa-solid fa-clipboard-check',
      },
      {
        href: '/candidate-recommendations/candidate-recommendation-list',
        title: 'Final Selection Recommendations',
        active: false,
        icon: 'fa-solid fa-star',
        roles: [UserRoleEnum.Admin],
      },
      {
        href: '/candidates',
        title: 'Candidates',
        active: false,
        icon: 'fa-solid fa-users',
      },
      {
        href: '/applications',
        title: 'ATS Dashboard',
        active: false,
        icon: 'fa-solid fa-list-check',
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
    href: '/my-applications',
    title: 'My Applications',
    active: false,
    icon: 'fa-solid fa-list-check',
    roles: [UserRoleEnum.Candidate],
  },
  {
    href: '/account-settings',
    title: 'Account Settings',
    active: false,
    icon: 'fa-solid fa-user-gear',
  },
];
