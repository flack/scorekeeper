import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// The AngularJS version used hashbang urls (#!/scores), keep those links working
if (location.hash.startsWith('#!')) {
    history.replaceState(history.state, '', '#' + location.hash.slice(2));
}

bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
