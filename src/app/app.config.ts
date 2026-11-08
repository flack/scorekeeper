import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { TitleStrategy, provideRouter, withHashLocation } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { PageTitleStrategy } from './page-title.strategy';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        // Hash urls, as GitHub Pages cannot rewrite deep links to index.html
        provideRouter(routes, withHashLocation()),
        { provide: TitleStrategy, useClass: PageTitleStrategy },
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        })
    ]
};
