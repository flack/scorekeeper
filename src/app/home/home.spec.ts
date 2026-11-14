import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BeforeInstallPromptEvent, InstallService } from '../shared/install.service';
import { Home } from './home';

describe('Home', () => {
    function create(): ComponentFixture<Home> {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(Home);
        fixture.detectChanges();
        return fixture;
    }

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('home screen link', () => {
        let fixture: ComponentFixture<Home>;
        let element: HTMLElement;
        let dialog: HTMLDialogElement;

        function setUp(): void {
            fixture = create();
            element = fixture.nativeElement;
            // jsdom has no modal dialogs
            dialog = element.querySelector('dialog')!;
            dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
            dialog.close = vi.fn(() => dialog.removeAttribute('open'));
        }

        async function clickLink(): Promise<void> {
            element.querySelector<HTMLButtonElement>('.link-button')!.click();
            await fixture.whenStable();
        }

        it('should show the browser install prompt when available', async () => {
            setUp();
            const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
                prompt: vi.fn(() => Promise.resolve()),
                userChoice: Promise.resolve({ outcome: 'accepted' as const })
            }) as BeforeInstallPromptEvent;
            window.dispatchEvent(event);
            // The browser's own infobar stays
            expect(event.defaultPrevented).toBe(false);

            await clickLink();
            expect(event.prompt).toHaveBeenCalled();
            expect(dialog.showModal).not.toHaveBeenCalled();
            // The prompt can only be used once
            expect(TestBed.inject(InstallService).canPrompt()).toBe(false);
        });

        it('should explain how to add it on iOS', async () => {
            vi.spyOn(navigator, 'userAgent', 'get')
                .mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1');
            setUp();

            await clickLink();
            expect(dialog.showModal).toHaveBeenCalled();
            expect(dialog.textContent).toContain('Add to Home Screen');
            expect(dialog.textContent).toContain('Share');
        });

        it('should explain how to install on desktop browsers', async () => {
            vi.spyOn(navigator, 'userAgent', 'get')
                .mockReturnValue('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36');
            setUp();

            await clickLink();
            expect(dialog.textContent).toContain('Install scorekeeper');

            dialog.querySelector<HTMLButtonElement>('.modal-footer button')!.click();
            expect(dialog.close).toHaveBeenCalled();
        });
    });
});
