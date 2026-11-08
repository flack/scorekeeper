import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { PageTitleStrategy } from './page-title.strategy';

describe('App', () => {
    let harness: RouterTestingHarness;
    let title: Title;

    beforeEach(async () => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                provideRouter(routes),
                { provide: TitleStrategy, useClass: PageTitleStrategy }
            ]
        });
        harness = await RouterTestingHarness.create();
        title = TestBed.inject(Title);
    });

    it('should render the navigation and the version', () => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const element: HTMLElement = fixture.nativeElement;
        expect(element.querySelectorAll('.navbar-nav a').length).toBe(3);
        expect(element.querySelector('footer')?.textContent).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should use the plain app name as title on the home page', async () => {
        await harness.navigateByUrl('/home');
        expect(title.getTitle()).toBe('scorekeeper');
    });

    it('should prefix the title with the page title of the current route', async () => {
        await harness.navigateByUrl('/players');
        expect(title.getTitle()).toBe('Manage Players | scorekeeper');
        await harness.navigateByUrl('/scores');
        expect(title.getTitle()).toBe('Scores | scorekeeper');
        await harness.navigateByUrl('/games');
        expect(title.getTitle()).toBe('Games | scorekeeper');
    });

    it('should fall back to the home page for unknown urls', async () => {
        await harness.navigateByUrl('/does-not-exist');
        expect(TestBed.inject(Router).url).toBe('/home');
        await harness.navigateByUrl('/');
        expect(TestBed.inject(Router).url).toBe('/home');
    });
});
