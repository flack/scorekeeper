import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

/** Chromium's install prompt event (not in lib.dom.d.ts) */
export interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** How the app can be added to the home screen on the current device */
export type InstallPlatform = 'installed' | 'ios' | 'android' | 'mac-safari' | 'desktop';

/**
 * Catches the browser's install prompt, which only fires once per page load
 * (possibly before the home page is shown), so it is created at bootstrap.
 */
@Injectable({ providedIn: 'root' })
export class InstallService {
    private readonly window = inject(DOCUMENT).defaultView;
    private readonly deferred = signal<BeforeInstallPromptEvent | null>(null);

    /** Whether the browser's own install dialog can be shown */
    readonly canPrompt = computed(() => this.deferred() !== null);

    constructor() {
        // Not calling preventDefault(), so the browser's own install infobar still shows:
        // it is more visible than the link on the home page
        this.window?.addEventListener('beforeinstallprompt', (event) => {
            this.deferred.set(event as BeforeInstallPromptEvent);
        });
        this.window?.addEventListener('appinstalled', () => this.deferred.set(null));
    }

    /** Shows the browser's install dialog, resolves to whether the user accepted */
    async prompt(): Promise<boolean> {
        const event = this.deferred();
        if (!event) {
            return false;
        }
        // The event can only be used once
        this.deferred.set(null);
        await event.prompt();
        const { outcome } = await event.userChoice;
        return outcome === 'accepted';
    }

    platform(): InstallPlatform {
        const nav = this.window?.navigator as (Navigator & { standalone?: boolean }) | undefined;
        if (!nav) {
            return 'desktop';
        }
        if (nav.standalone || this.window?.matchMedia?.('(display-mode: standalone)').matches) {
            return 'installed';
        }
        const ua = nav.userAgent;
        // iPadOS reports itself as a Mac, but has touch
        if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && nav.maxTouchPoints > 1)) {
            return 'ios';
        }
        if (/Android/.test(ua)) {
            return 'android';
        }
        if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua)) {
            return 'mac-safari';
        }
        return 'desktop';
    }
}
