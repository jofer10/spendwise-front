import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Para la ruta vacía '' redirige a /app/dashboard si hay sesión, si no a /auth/login.
 */
export const initialAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/app/dashboard']);
  }
  return router.createUrlTree(['/auth/login']);
};
