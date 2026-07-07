import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
  },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' },
];
