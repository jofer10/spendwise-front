import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../../auth/token.service';

/** Rutas que NO llevan Authorization Bearer (login, register, refresh) */
const NO_BEARER_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  const skipBearer = NO_BEARER_PATHS.some((path) => url.includes(path));
  if (skipBearer) {
    return next(req);
  }
  const tokenService = inject(TokenService);
  const token = tokenService.accessToken;
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
