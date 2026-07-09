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
    title: 'Attendance',
    active: false,
    icon: 'fa-solid fa-clock',
    roles: [UserRoleEnum.Admin, UserRoleEnum.HR],
    subItems: [
      {
        href: '/attendance/shift-list',
        title: 'Shift List',
        active: false,
        icon: 'fa-solid fa-random',
      },
    ],
  },
  {
    title: 'Payroll',
    active: false,
    icon: 'fa-solid fa-money-bill-wave',
    roles: [UserRoleEnum.Admin, UserRoleEnum.HR],
    subItems: [
      {
        href: '/payroll/payroll-head-list',
        title: 'Payroll Head',
        active: false,
        icon: 'fa-solid fa-list',
      },
    ],
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
    ],
  },
  {
    href: '/internal-jobs/job-list',
    title: 'Internal Job Board',
    active: false,
    icon: 'fa-solid fa-building',
  },
];
