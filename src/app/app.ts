import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { version } from '../../package.json';

@Component({
    selector: 'sk-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './app.html'
})
export class App {
    protected readonly version = version;
}
