import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { initialAuthGuard } from './core/auth/initial-auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./core/layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-home/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [initialAuthGuard],
    loadComponent: () =>
      import('./core/layout/redirect/redirect.component').then((m) => m.RedirectComponent),
  },
  { path: '**', redirectTo: 'auth/login' },
];
