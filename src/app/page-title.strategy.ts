import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const APP_NAME = 'scorekeeper';

/** "<route title> | scorekeeper", or just "scorekeeper" for routes without title */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
    private readonly title = inject(Title);

    override updateTitle(snapshot: RouterStateSnapshot): void {
        const title = this.buildTitle(snapshot);
        this.title.setTitle(title ? `${title} | ${APP_NAME}` : APP_NAME);
    }
}
