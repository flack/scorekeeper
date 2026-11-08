import { Component, DOCUMENT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'sk-home',
    imports: [RouterLink],
    templateUrl: './home.html'
})
export class Home {
    /** The social buttons are external iframes, so only show them when online */
    protected readonly online = inject(DOCUMENT).defaultView?.navigator.onLine ?? false;
}
