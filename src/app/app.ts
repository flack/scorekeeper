import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { version } from '../../package.json';
import { InstallService } from './shared/install.service';

@Component({
    selector: 'sk-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './app.html',
    host: {
        '(window:scroll)': 'updateScrolled()'
    }
})
export class App {
    protected readonly version = version;

    private readonly window = inject(DOCUMENT).defaultView;

    /** On the home page, the header lies over the background image */
    protected readonly overlay = toSignal(inject(Router).events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => event.urlAfterRedirects.split(/[?#]/)[0] === '/home')
    ), { initialValue: false });

    /** The overlaid header only gets its background once the page is scrolled */
    protected readonly scrolled = signal(false);

    constructor() {
        // Start listening for the install prompt right away, it may fire before the home page shows
        inject(InstallService);
    }

    protected updateScrolled(): void {
        this.scrolled.set((this.window?.scrollY ?? 0) > 0);
    }
}
