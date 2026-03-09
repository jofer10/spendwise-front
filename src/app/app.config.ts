import { ApplicationConfig, APP_INITIALIZER, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IMAGE_CONFIG } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { es } from 'date-fns/locale';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/interceptors/auth.interceptor';
import { errorInterceptor } from './core/http/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    {
      provide: IMAGE_CONFIG,
      useValue: { disableImageSizeWarning: true },
    },
    {
      provide: APP_INITIALIZER,
      useValue: () => {
        const iconRegistry = inject(MatIconRegistry);
        iconRegistry.setDefaultFontSetClass('material-icons');
      },
      multi: true,
    },
    {
      provide: MAT_SELECT_CONFIG,
      useValue: { overlayPanelClass: 'spw-select-panel' },
    },
    { provide: MAT_DATE_LOCALE, useValue: es },
    provideDateFnsAdapter(),
  ],
};
