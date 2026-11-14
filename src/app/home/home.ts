import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstallPlatform, InstallService } from '../shared/install.service';

@Component({
    selector: 'sk-home',
    imports: [RouterLink],
    templateUrl: './home.html'
})
export class Home {
    private readonly install = inject(InstallService);
    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('installHelp');
    /** The instructions shown in the dialog */
    protected platform: InstallPlatform = 'desktop';

    /** Uses the browser's install dialog where available, otherwise explains how to do it */
    async addToHomeScreen(): Promise<void> {
        if (this.install.canPrompt()) {
            await this.install.prompt();
            return;
        }
        this.platform = this.install.platform();
        this.dialog().nativeElement.showModal();
    }

    close(): void {
        this.dialog().nativeElement.close();
    }

    /** Clicks on the dialog element itself (not its content) hit the backdrop */
    protected backdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.close();
        }
    }
}
