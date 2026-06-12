import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { DISCORD_DATA_PORT, TRANSLATE_PORT, NOTIFICATION_PORT } from '@servitium/discord';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { DiscordDataAdapter } from './core/discord-data.adapter';
import { I18nService } from './core/i18n.service';
import { NotificationService } from './core/notification.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // Bind the shared @servitium/discord component ports to this app's services.
    { provide: DISCORD_DATA_PORT, useExisting: DiscordDataAdapter },
    { provide: TRANSLATE_PORT, useExisting: I18nService },
    { provide: NOTIFICATION_PORT, useExisting: NotificationService },
  ],
};
