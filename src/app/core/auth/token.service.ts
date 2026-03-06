import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'spw_access_token';
const REFRESH_TOKEN_KEY = 'spw_refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  get accessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  set accessToken(value: string | null) {
    if (value) {
      localStorage.setItem(ACCESS_TOKEN_KEY, value);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  set refreshToken(value: string | null) {
    if (value) {
      localStorage.setItem(REFRESH_TOKEN_KEY, value);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  hasTokens(): boolean {
    return !!this.accessToken;
  }
}
