import { Routes } from '@angular/router';
import { publicGuard } from '../../core/auth/public.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth-page/auth-page.component').then((m) => m.AuthPageComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth-page/auth-page.component').then((m) => m.AuthPageComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
    canActivate: [publicGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
