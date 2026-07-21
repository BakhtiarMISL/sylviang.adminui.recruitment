import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanMatch {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(_route?: unknown, state?: RouterStateSnapshot): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    const attemptedUrl = state?.url ?? this.router.url;
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: attemptedUrl } });
  }

  // Used on the guarded pages-module route in app.routes.ts instead of canActivate.
  // canActivate can only redirect once a route is already selected; canMatch runs during
  // route SELECTION, so returning false here (for the bare root URL) lets the Router fall
  // through to the next sibling route — the public landing page — instead of resolving
  // this branch's own internal '' -> /dashboard redirect and then bouncing to /login.
  canMatch(_route: Route, segments: UrlSegment[]): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    if (segments.length === 0) {
      return false;
    }

    const attemptedUrl = '/' + segments.map((s) => s.path).join('/');
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: attemptedUrl } });
  }
}
