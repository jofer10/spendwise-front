import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiClient } from '../http/api-client';
import { TokenService } from './token.service';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshResponse,
  AuthUser,
} from './auth.types';

/** Respuesta de login/register/refresh: la API puede devolver camelCase o snake_case */
function getAccessToken(res: Record<string, unknown>): string | null {
  const t = res['accessToken'] ?? res['access_token'];
  return typeof t === 'string' ? t : null;
}
function getRefreshToken(res: Record<string, unknown>): string | null {
  const t = res['refreshToken'] ?? res['refresh_token'];
  return typeof t === 'string' ? t : null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private api: ApiClient,
    private token: TokenService,
    private router: Router
  ) {}

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/api/auth/login', body).pipe(
      tap((res) => {
        const access = getAccessToken(res as unknown as Record<string, unknown>);
        const refresh = getRefreshToken(res as unknown as Record<string, unknown>);
        if (access) this.token.accessToken = access;
        this.token.refreshToken = refresh ?? null;
      })
    );
  }

  register(body: RegisterRequest): Observable<LoginResponse & { user: AuthUser }> {
    return this.api.post<LoginResponse & { user: AuthUser }>('/api/auth/register', body).pipe(
      tap((res) => {
        const access = getAccessToken(res as unknown as Record<string, unknown>);
        const refresh = getRefreshToken(res as unknown as Record<string, unknown>);
        if (access) this.token.accessToken = access;
        this.token.refreshToken = refresh ?? null;
      })
    );
  }

  refresh(): Observable<RefreshResponse | null> {
    const refreshToken = this.token.refreshToken;
    if (!refreshToken) {
      return of(null);
    }
    return this.api.post<RefreshResponse>('/api/auth/refresh', { refreshToken }).pipe(
      tap((res) => {
        const access = getAccessToken(res as unknown as Record<string, unknown>);
        const refresh = getRefreshToken(res as unknown as Record<string, unknown>);
        if (access) this.token.accessToken = access;
        if (refresh) this.token.refreshToken = refresh;
      }),
      catchError(() => of(null))
    );
  }

  logout(): Observable<unknown> {
    const refreshToken = this.token.refreshToken;
    if (refreshToken) {
      return this.api.post('/api/auth/logout', { refreshToken }).pipe(
        tap(() => {
          this.token.clear();
          this.router.navigate(['/auth/login']);
        }),
        catchError(() => {
          this.token.clear();
          this.router.navigate(['/auth/login']);
          return of(null);
        })
      );
    }
    this.token.clear();
    this.router.navigate(['/auth/login']);
    return of(null);
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<{ message?: string }> {
    return this.api.post<{ message?: string }>('/api/auth/forgot-password', body);
  }

  resetPassword(body: ResetPasswordRequest): Observable<{ message?: string }> {
    return this.api.post<{ message?: string }>('/api/auth/reset-password', body);
  }

  getMe(): Observable<AuthUser> {
    return this.api.get<AuthUser>('/api/me');
  }

  isLoggedIn(): boolean {
    return this.token.hasTokens();
  }
}
