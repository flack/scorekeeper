import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
    function render(online: boolean): HTMLElement {
        vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(Home);
        fixture.detectChanges();
        return fixture.nativeElement;
    }

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should show the social buttons when online', () => {
        expect(render(true).querySelector('.social-buttons')).not.toBeNull();
    });

    it('should hide the social buttons when offline', () => {
        expect(render(false).querySelector('.social-buttons')).toBeNull();
    });
});
