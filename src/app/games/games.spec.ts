import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game, StorageService } from '../shared/storage.service';
import { Games } from './games';

describe('Games', () => {
    let fixture: ComponentFixture<Games>;
    let component: Games;
    let storage: StorageService;
    let element: HTMLElement;
    let dialog: HTMLDialogElement;

    function game(title: string): Game {
        return {
            title,
            started: '2020-03-01T12:00:00.000Z',
            finished: '2020-03-01T13:00:00.000Z',
            players: [{ id: 'player0', name: 'Ann' }, { id: 'player1', name: 'Bob' }],
            totals: { player0: 7, player1: 6 }
        };
    }

    beforeEach(async () => {
        localStorage.clear();
        storage = TestBed.inject(StorageService);
        storage.games = [game('First'), game('Second'), game('Third')];
        fixture = TestBed.createComponent(Games);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
        await fixture.whenStable();

        // jsdom has no modal dialogs
        dialog = element.querySelector('dialog')!;
        dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
        dialog.close = vi.fn(() => {
            dialog.removeAttribute('open');
            dialog.dispatchEvent(new Event('close'));
        });
    });

    async function openDialog(index: number): Promise<void> {
        element.querySelectorAll<HTMLButtonElement>('.game-table button')[index].click();
        await fixture.whenStable();
    }

    function titles(): string[] {
        return storage.games.map(stored => stored.title);
    }

    it('should list the games with their totals', () => {
        expect(element.querySelectorAll('.game-table').length).toBe(3);
        expect(element.querySelector('.game-table h3')?.textContent).toContain('First');
        const totals = Array.from(element.querySelectorAll('.game-table')[0].querySelectorAll('tbody th'));
        expect(totals.map(cell => cell.textContent?.trim())).toEqual(['7', '6']);
    });

    it('should highlight the winners', async () => {
        storage.games[1].totals = { player0: 5, player1: 5 };
        fixture.componentRef.changeDetectorRef.markForCheck();
        await fixture.whenStable();
        const highlighted = (index: number) => Array.from(element.querySelectorAll('.game-table')[index].querySelectorAll('thead th'))
            .map(cell => cell.classList.contains('table-success'));
        expect(highlighted(0)).toEqual([true, false]);
        expect(highlighted(1)).toEqual([true, true]);
    });

    it('should open the confirmation dialog for the selected game', async () => {
        await openDialog(1);
        expect(dialog.showModal).toHaveBeenCalled();
        expect(component.selected).toBe(storage.games[1]);
        expect(dialog.textContent).toContain('Delete Game from 03/01/2020');
        expect(dialog.textContent).toContain('Ann (7 points)');
    });

    it('should delete the game when confirmed', async () => {
        await openDialog(1);
        dialog.querySelector<HTMLButtonElement>('.btn-danger')!.click();
        await fixture.whenStable();
        expect(titles()).toEqual(['First', 'Third']);
        expect(JSON.parse(localStorage.getItem('ngStorage-games')!).length).toBe(2);
        expect(dialog.close).toHaveBeenCalled();
        expect(component.selected).toBeNull();
    });

    it('should keep the game when cancelled', async () => {
        await openDialog(1);
        dialog.querySelector<HTMLButtonElement>('.btn-outline-secondary')!.click();
        await fixture.whenStable();
        expect(titles()).toEqual(['First', 'Second', 'Third']);
        expect(component.selected).toBeNull();
    });

    it('should cancel on a click on the backdrop', async () => {
        await openDialog(1);
        dialog.querySelector<HTMLElement>('.modal-body')!.click();
        expect(dialog.close).not.toHaveBeenCalled();
        dialog.click();
        expect(dialog.close).toHaveBeenCalled();
        expect(titles().length).toBe(3);
    });
});
