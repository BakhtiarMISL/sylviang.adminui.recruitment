import { inject } from '@angular/core';
import { CanMatchFn, Route, Routes, UrlSegment } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { AuthService } from '@core/services/auth/auth.service';

// Matches ONLY the bare root URL ('/'). Decides the landing route at recognition
// time from the segments alone, so '/' never has to load the lazy landing module
// and match its '' child to be selected. Any deeper path (segments.length > 0)
// is rejected here and falls through to the guarded pages route below.
const isRootPath: CanMatchFn = (_route: Route, segments: UrlSegment[]) => segments.length === 0;

// The standalone public career portal (its own navbar/footer, no Shell) is only for anonymous
// visitors and pre-login browsing. A logged-in user hitting /careers should get the same
// CareerPortalModule wrapped in Shell instead (see 'careers' under pages-routing.module.ts) -
// returning false here (not a redirect) lets that guarded sibling route match next.
const isAnonymous: CanMatchFn = () => !inject(AuthService).isAuthenticated();

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./auth/register/register.module').then((m) => m.RegisterModule),
  },
  {
    path: 'careers',
    canMatch: [isAnonymous],
    loadChildren: () => import('./career-portal/career-portal.module').then((m) => m.CareerPortalModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./public-landing/public-landing.module').then((m) => m.PublicLandingModule),
  },
  {
    // Root is always the public landing page, logged in or not. canMatch selects this
    // branch for the bare root URL only, decided from segments before the lazy module
    // loads. Deeper paths fail canMatch and fall through to the guarded branch below.
    path: '',
    canMatch: [isRootPath],
    loadChildren: () => import('./public-landing/public-landing.module').then((m) => m.PublicLandingModule),
  },
  {
    path: '',
    canMatch: [AuthGuard],
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
  },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' },
];
