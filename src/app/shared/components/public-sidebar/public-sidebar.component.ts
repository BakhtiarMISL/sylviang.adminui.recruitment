import { Component } from '@angular/core';

interface PublicNavItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-public-sidebar',
  templateUrl: './public-sidebar.component.html',
  styleUrl: './public-sidebar.component.scss',
  standalone: false,
})
export class PublicSidebarComponent {
  navItems: PublicNavItem[] = [
    { label: 'Careers', icon: 'fa-solid fa-briefcase', link: '/careers' },
    { label: 'Register', icon: 'fa-solid fa-user-plus', link: '/register' },
    { label: 'Login', icon: 'fa-solid fa-right-to-bracket', link: '/login' },
  ];
}
