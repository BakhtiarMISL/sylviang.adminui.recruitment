import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';

interface PublicNavLink {
  label: string;
  link: string;
  fragment?: string;
}

@Component({
  selector: 'app-public-navbar',
  standalone: false,
  templateUrl: './public-navbar.component.html',
})
export class PublicNavbarComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  menuOpen = false;
  user$ = this.authService.user$;

  navLinks: PublicNavLink[] = [
    { label: 'Home', link: '/' },
    { label: 'About', link: '/', fragment: 'about' },
    { label: 'Careers', link: '/careers' },
  ];

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigateByUrl('/');
  }
}
