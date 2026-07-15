import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(_route?: unknown, state?: RouterStateSnapshot): boolean | UrlTree {
    const authed = this.authService.isAuthenticated();
    console.log('[DEBUG] AuthGuard.canActivate, isAuthenticated =', authed, 'state?.url =', state?.url, 'router.url =', this.router.url, 'token =', this.authService.getToken());

    if (authed) {
      return true;
    }

    const attemptedUrl = state?.url ?? this.router.url;

    // A bare root visit (no login, no deep link) sends anonymous visitors to the
    // public career portal instead of forcing a login form in their face.
    if (attemptedUrl === '/') {
      console.log('[DEBUG] AuthGuard redirecting to /careers');
      return this.router.createUrlTree(['/careers']);
    }

    console.log('[DEBUG] AuthGuard redirecting to /login, attemptedUrl =', attemptedUrl);
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: attemptedUrl } });
  }
}
