import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface WindowEnv {
  API_BASE_URL?: string;
  APP_NAME?: string;
  APP_ENV?: string;
  [key: string]: string | undefined;
}

declare global {
  interface Window {
    __env?: WindowEnv;
  }
}

@Injectable({ providedIn: 'root' })
export class EnvService {
  private readonly env = this.readEnv();

  get apiBaseUrl(): string {
    return this.env.API_BASE_URL ?? environment.apiBaseUrl;
  }

  get appName(): string {
    return this.env.APP_NAME ?? environment.appName;
  }

  get appEnv(): string {
    return this.env.APP_ENV ?? environment.appEnv;
  }

  private readEnv(): WindowEnv {
    if (typeof window !== 'undefined' && window.__env && typeof window.__env === 'object') {
      return { ...window.__env };
    }
    return {};
  }
}
