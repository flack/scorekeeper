import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { version } from '../../package.json';
import { InstallService } from './shared/install.service';

@Component({
    selector: 'sk-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './app.html'
})
export class App {
    protected readonly version = version;

    constructor() {
        // Start listening for the install prompt right away, it may fire before the home page shows
        inject(InstallService);
    }
}
