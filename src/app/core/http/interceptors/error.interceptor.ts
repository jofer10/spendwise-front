import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { TokenService } from '../../auth/token.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = /\/api\/auth\/(login|register|forgot-password|reset-password)/.test(req.url);
      if (err.status === 401 && !isAuthEndpoint) {
        return auth.refresh().pipe(
          switchMap(() => {
            const newToken = token.accessToken;
            if (newToken) {
              const cloned = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next(cloned);
            }
            token.clear();
            router.navigate(['/auth/login']);
            return throwError(() => err);
          }),
          catchError(() => {
            token.clear();
            router.navigate(['/auth/login']);
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
