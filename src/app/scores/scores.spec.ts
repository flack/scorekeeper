import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StorageService } from '../shared/storage.service';
import { EditableTitle } from './editable-title.directive';
import { Scores, parseScore } from './scores';

describe('Scores', () => {
    let fixture: ComponentFixture<Scores>;
    let component: Scores;
    let storage: StorageService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        storage = TestBed.inject(StorageService);
    });

    function create(): void {
        fixture = TestBed.createComponent(Scores);
        component = fixture.componentInstance;
    }

    function addPlayers(): void {
        storage.players.push({ id: 'player0', name: 'Ann' }, { id: 'player1', name: 'Bob' });
    }

    function enterRound(scores: Record<string, string>): void {
        const row = storage.rows[storage.rows.length - 1];
        for (const [playerId, score] of Object.entries(scores)) {
            row[playerId] = score;
            component.updateTotals(playerId);
        }
    }

    function stored(key: string): unknown {
        return JSON.parse(localStorage.getItem('ngStorage-' + key)!);
    }

    describe('component', () => {
        beforeEach(create);

        it('should start with storage defaults', () => {
            expect(storage.title).toBe('Untitled Game');
            expect(storage.rows).toEqual([]);
            expect(storage.games).toEqual([]);
            expect(storage.started).toBeNull();
            expect(component.running).toBe(false);
        });

        it('should update totals', () => {
            storage.rows.push({ player1: 4 });
            component.updateTotals('player1');
            expect(component.totals['player1']).toBe(4);
        });

        it('should cope with empty inputs', () => {
            storage.rows.push({ player1: '' }, { player1: 4 });
            component.updateTotals('player1');
            expect(component.totals['player1']).toBe(4);
        });

        it('should ignore invalid input', () => {
            storage.rows.push({ player1: 4 }, { player1: 'x' });
            component.updateTotals('player1');
            expect(component.totals['player1']).toBe(4);
        });

        it('should accept decimals, negative numbers and a comma as decimal separator', () => {
            storage.rows.push({ player1: '1,5' }, { player1: '2.25' }, { player1: '-1' });
            component.updateTotals('player1');
            expect(component.totals['player1']).toBe(2.75);
        });

        it('should treat blank, missing and non-finite input as zero', () => {
            storage.rows.push({ player1: ' ' }, { player1: ' 3 ' }, { player1: 'Infinity' }, { player1: null }, {});
            component.updateTotals('player1');
            expect(component.totals['player1']).toBe(3);
            expect(parseScore(undefined)).toBe(0);
        });

        it('should find the maximum in row', () => {
            const row = { player1: '4', player2: '3.5' };
            expect(component.isMax('4', row)).toBe(true);
            expect(component.isMax('2', row)).toBe(false);
            expect(component.isMax('', row)).toBe(false);
        });

        it('should not mark a maximum in an empty row', () => {
            expect(component.isMax('', { player0: '', player1: '' })).toBe(false);
            expect(component.isMax('0', { player0: '0', player1: '' })).toBe(false);
        });

        it('should start a game with an empty row for every player', () => {
            addPlayers();
            component.start();
            expect(component.running).toBe(true);
            expect(storage.started).toEqual(expect.any(Date));
            expect(storage.finished).toBeNull();
            expect(storage.rows).toEqual([{ player0: '', player1: '' }]);
            expect(component.totals).toEqual({ player0: 0, player1: 0 });
            expect(stored('rows')).toEqual([{ player0: '', player1: '' }]);
        });

        it('should clear the previous game when starting a new one', () => {
            addPlayers();
            component.start();
            enterRound({ player0: '3', player1: '5' });
            component.finish();

            component.start();
            expect(storage.rows).toEqual([{ player0: '', player1: '' }]);
            expect(component.totals).toEqual({ player0: 0, player1: 0 });
            expect(component.winners).toEqual([]);
        });

        it('should add a new row', () => {
            addPlayers();
            component.start();
            component.newRow();
            expect(storage.rows.length).toBe(2);
            expect(storage.rows[1]).toEqual({ player0: '', player1: '' });
        });

        it('should abort a game', () => {
            addPlayers();
            component.start();
            enterRound({ player0: '3', player1: '5' });
            component.abort();
            expect(component.running).toBe(false);
            expect(storage.started).toBeNull();
            expect(storage.rows).toEqual([]);
            expect(component.totals).toEqual({ player0: 0, player1: 0 });
            expect(storage.games).toEqual([]);
            expect(stored('rows')).toEqual([]);
            expect(stored('started')).toBeNull();
        });

        it('should save the game and pick the winner when finishing', () => {
            addPlayers();
            storage.title = 'Poker night';
            component.start();
            enterRound({ player0: '3', player1: '5' });
            component.newRow();
            enterRound({ player0: '4', player1: '1' });
            component.finish();

            expect(component.running).toBe(false);
            expect(storage.finished).toEqual(expect.any(Date));
            expect(component.winners).toEqual(['player0']);
            expect(storage.games.length).toBe(1);

            const game = storage.games[0];
            expect(game.title).toBe('Poker night');
            expect(game.started).toEqual(storage.started);
            expect(game.finished).toEqual(storage.finished);
            expect(game.players).toEqual(storage.players);
            expect(game.totals).toEqual({ player0: 7, player1: 6 });
            expect((stored('games') as unknown[]).length).toBe(1);
        });

        it('should store a snapshot that later changes do not affect', () => {
            addPlayers();
            component.start();
            enterRound({ player0: '3', player1: '5' });
            component.finish();
            storage.players[0].name = 'Changed';
            component.totals['player0'] = 100;
            expect(storage.games[0].players[0].name).toBe('Ann');
            expect(storage.games[0].totals['player0']).toBe(3);
        });

        it('should put the newest game first', () => {
            addPlayers();
            storage.title = 'First';
            component.start();
            component.finish();
            storage.title = 'Second';
            component.start();
            component.finish();
            expect(storage.games.map(game => game.title)).toEqual(['Second', 'First']);
        });

        it('should drop trailing empty rows when finishing', () => {
            addPlayers();
            component.start();
            enterRound({ player0: '3', player1: '5' });
            component.newRow();
            component.newRow();
            component.finish();
            expect(storage.rows).toEqual([{ player0: '3', player1: '5' }]);
        });

        it('should report all players with the highest total in a tie', () => {
            addPlayers();
            storage.players.push({ id: 'player2', name: 'Cid' });
            component.start();
            enterRound({ player0: '5', player1: '2', player2: '5' });
            component.finish();
            expect(component.winners).toEqual(['player0', 'player2']);
        });

        it('should pick the highest total when all totals are negative', () => {
            addPlayers();
            component.start();
            enterRound({ player0: '-5', player1: '-2' });
            component.finish();
            expect(component.winners).toEqual(['player1']);
        });

        it('should report a tie between negative totals', () => {
            addPlayers();
            component.start();
            enterRound({ player0: '-3', player1: '-3' });
            component.finish();
            expect(component.winners).toEqual(['player0', 'player1']);
        });

        it('should report a tie when nobody scored', () => {
            addPlayers();
            component.start();
            component.finish();
            expect(component.winners).toEqual(['player0', 'player1']);
        });

        it('should resume the last finished game', () => {
            addPlayers();
            component.start();
            enterRound({ player0: '3', player1: '5' });
            component.finish();

            component.resume();
            expect(component.running).toBe(true);
            expect(storage.finished).toBeNull();
            expect(component.winners).toEqual([]);
            expect(storage.games).toEqual([]);
            expect(storage.rows).toEqual([{ player0: '3', player1: '5' }, { player0: '', player1: '' }]);
            expect(component.totals).toEqual({ player0: 3, player1: 5 });
            expect(stored('games')).toEqual([]);
        });
    });

    describe('restoring a stored game', () => {
        beforeEach(() => {
            storage.players = [{ id: 'player0', name: 'Ann' }, { id: 'player1', name: 'Bob' }];
            storage.rows = [{ player0: '3', player1: '5' }, { player0: '1', player1: '' }];
            storage.started = new Date().toISOString();
        });

        it('should recalculate the totals and continue a running game', () => {
            storage.finished = null;
            create();
            expect(component.totals).toEqual({ player0: 4, player1: 5 });
            expect(component.running).toBe(true);
        });

        it('should not continue a finished game', () => {
            storage.finished = new Date().toISOString();
            create();
            expect(component.totals).toEqual({ player0: 4, player1: 5 });
            expect(component.running).toBe(false);
        });
    });

    describe('template', () => {
        let element: HTMLElement;

        beforeEach(async () => {
            addPlayers();
            create();
            element = fixture.nativeElement;
            await fixture.whenStable();
        });

        function inputs(): HTMLInputElement[] {
            return Array.from(element.querySelectorAll<HTMLInputElement>('tbody input'));
        }

        function type(input: HTMLInputElement, value: string): void {
            input.value = value;
            input.dispatchEvent(new Event('input'));
        }

        function button(label: string): HTMLButtonElement {
            const found = Array.from(element.querySelectorAll('button')).find(candidate => candidate.textContent?.trim() === label);
            if (!found) {
                throw new Error(`No "${label}" button`);
            }
            return found;
        }

        it('should ask for players when there are none', async () => {
            storage.players = [];
            fixture.componentRef.changeDetectorRef.markForCheck();
            await fixture.whenStable();
            expect(element.querySelector('.alert-danger')?.textContent).toContain('add some players');
        });

        it('should play a game through the buttons and inputs', async () => {
            expect(element.querySelector('.alert-danger')).toBeNull();
            button('Start').click();
            await fixture.whenStable();
            expect(element.textContent).toContain('started a few seconds ago');

            type(inputs()[0], '3');
            type(inputs()[1], '5');
            await fixture.whenStable();
            expect(Array.from(element.querySelectorAll('tfoot .totals')).map(cell => cell.textContent?.trim())).toEqual(['3', '5']);
            expect(stored('rows')).toEqual([{ player0: '3', player1: '5' }]);

            inputs()[1].closest('form')!.dispatchEvent(new Event('submit'));
            await fixture.whenStable();
            expect(inputs().length).toBe(4);
            // The finished round marks its best score
            expect(element.querySelectorAll('tbody tr')[0].querySelectorAll('td.table-success').length).toBe(1);

            button('Finish').click();
            await fixture.whenStable();
            expect(element.querySelector('.alert-success')?.textContent).toContain('Bob wins!');
            expect(inputs().every(input => input.disabled)).toBe(true);
            expect(button('Start New')).toBeTruthy();
            expect(button('Resume')).toBeTruthy();
        });

        it('should announce a tie', async () => {
            button('Start').click();
            await fixture.whenStable();
            button('Finish').click();
            await fixture.whenStable();
            expect(element.querySelector('.alert-success')?.textContent).toContain("It's a tie! Winners are Ann, Bob");
        });

        it('should focus the first input of a new row', async () => {
            button('Start').click();
            await fixture.whenStable();
            expect(document.activeElement).toBe(inputs()[0]);

            element.querySelector<HTMLButtonElement>('button[title="Next round"]')!.click();
            await fixture.whenStable();
            expect(document.activeElement).toBe(inputs()[2]);
        });

        it('should select the input content on focus and click', async () => {
            button('Start').click();
            await fixture.whenStable();
            const input = inputs()[1];
            vi.spyOn(input, 'select');
            input.dispatchEvent(new Event('focus'));
            input.dispatchEvent(new Event('click'));
            expect(input.select).toHaveBeenCalledTimes(2);
        });

        it('should save the edited title', async () => {
            const title = element.querySelector('h1')!;
            expect(title.textContent).toBe('Untitled Game');
            title.textContent = 'Skat';
            title.dispatchEvent(new Event('blur'));
            await fixture.whenStable();
            expect(storage.title).toBe('Skat');
            expect(stored('title')).toBe('Skat');
        });
    });
});

@Component({
    imports: [EditableTitle],
    template: '<h1 skEditableTitle [(title)]="title" fallback="Untitled Game"></h1>'
})
class EditableTitleHost {
    readonly title = signal('Poker night');
}

describe('EditableTitle', () => {
    let fixture: ComponentFixture<EditableTitleHost>;
    let element: HTMLElement;

    beforeEach(async () => {
        fixture = TestBed.createComponent(EditableTitleHost);
        await fixture.whenStable();
        element = fixture.nativeElement.querySelector('h1');
    });

    function blur(): void {
        element.dispatchEvent(new Event('blur'));
    }

    it('should make the element editable', () => {
        expect(element.getAttribute('contenteditable')).toBe('true');
    });

    it('should render the model', () => {
        expect(element.textContent).toBe('Poker night');
    });

    it('should render the fallback when the model is empty', async () => {
        fixture.componentInstance.title.set('');
        await fixture.whenStable();
        expect(element.textContent).toBe('Untitled Game');
    });

    it('should update the model with the trimmed text on blur', () => {
        element.textContent = '  Skat  ';
        blur();
        expect(fixture.componentInstance.title()).toBe('Skat');
        expect(element.textContent).toBe('Skat');
    });

    it('should keep unchanged text on blur', () => {
        blur();
        expect(fixture.componentInstance.title()).toBe('Poker night');
        expect(element.textContent).toBe('Poker night');
    });

    it('should fall back to the default title when the text is cleared', () => {
        element.textContent = '   ';
        blur();
        expect(fixture.componentInstance.title()).toBe('Untitled Game');
        expect(element.textContent).toBe('Untitled Game');
    });

    it('should finish editing on enter', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
        vi.spyOn(element, 'blur');
        element.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        expect(element.blur).toHaveBeenCalled();
    });
});
