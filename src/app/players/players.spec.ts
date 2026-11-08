import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StorageService } from '../shared/storage.service';
import { Players } from './players';

describe('Players', () => {
    let fixture: ComponentFixture<Players>;
    let component: Players;
    let storage: StorageService;

    beforeEach(() => {
        localStorage.clear();
        storage = TestBed.inject(StorageService);
        fixture = TestBed.createComponent(Players);
        component = fixture.componentInstance;
    });

    function names(): string[] {
        return storage.players.map(player => player.name);
    }

    it('should start without players', async () => {
        await fixture.whenStable();
        expect(storage.players).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('No players defined');
    });

    it('should add a player', () => {
        component.addPlayer('ted');
        expect(storage.players).toEqual([{ id: 'player0', name: 'ted' }]);
    });

    it('should persist added players', () => {
        component.addPlayer('ted');
        expect(JSON.parse(localStorage.getItem('ngStorage-players')!)).toEqual([{ id: 'player0', name: 'ted' }]);
    });

    it('should number new players consecutively', () => {
        component.addPlayer('Ann');
        component.addPlayer('Bob');
        expect(storage.players).toEqual([{ id: 'player0', name: 'Ann' }, { id: 'player1', name: 'Bob' }]);
    });

    it('should add a player from the form and clear it', async () => {
        await fixture.whenStable();
        const element: HTMLElement = fixture.nativeElement;
        const input = element.querySelector<HTMLInputElement>('form input')!;
        input.value = 'Ann';
        input.dispatchEvent(new Event('input'));
        element.querySelector('form')!.dispatchEvent(new Event('submit'));
        await fixture.whenStable();

        expect(storage.players).toEqual([{ id: 'player0', name: 'Ann' }]);
        expect(component.name).toBe('');
        expect(input.value).toBe('');
        expect(input.classList).toContain('ng-pristine');
        expect(element.querySelectorAll('.delete-animation input')[0]).toHaveProperty('value', 'Ann');
    });

    it('should leave the required validation message to the browser', async () => {
        await fixture.whenStable();
        const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
        expect(form.hasAttribute('novalidate')).toBe(false);
        expect(form.checkValidity()).toBe(false);
    });

    it('should not add a player without a name from the form', async () => {
        await fixture.whenStable();
        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
        await fixture.whenStable();
        expect(storage.players).toEqual([]);
    });

    it('should remove a player', () => {
        component.addPlayer('Ann');
        component.addPlayer('Bob');
        component.addPlayer('Cid');
        component.removePlayer('player1');
        expect(storage.players).toEqual([{ id: 'player0', name: 'Ann' }, { id: 'player2', name: 'Cid' }]);
        expect(JSON.parse(localStorage.getItem('ngStorage-players')!).length).toBe(2);
    });

    it('should not reuse an id after a player was removed', () => {
        component.addPlayer('Ann');
        component.addPlayer('Bob');
        component.removePlayer('player0');
        component.addPlayer('Cid');
        expect(storage.players).toEqual([{ id: 'player1', name: 'Bob' }, { id: 'player2', name: 'Cid' }]);
    });

    it('should not reuse the id of a removed player that still has scores in the current game', () => {
        component.addPlayer('Ann');
        component.addPlayer('Bob');
        storage.rows = [{ player0: '3', player1: '5' }];
        component.removePlayer('player1');
        component.addPlayer('Cid');
        expect(storage.players[1]).toEqual({ id: 'player2', name: 'Cid' });
    });

    it('should continue after the highest stored id', () => {
        storage.players = [{ id: 'player4', name: 'Ann' }, { id: 'player2', name: 'Bob' }];
        component.addPlayer('Cid');
        expect(storage.players[2].id).toBe('player5');
    });

    it('should ignore keys that are not player ids', () => {
        storage.rows = [{ $$hashKey: 'object:7', player0: '' }];
        component.addPlayer('Ann');
        expect(storage.players[0].id).toBe('player1');
    });

    it('should ignore removing an unknown player', () => {
        component.addPlayer('Ann');
        component.removePlayer('player9');
        expect(storage.players.length).toBe(1);
    });

    it('should reorder players', () => {
        component.addPlayer('Ann');
        component.addPlayer('Bob');
        component.addPlayer('Cid');
        component.reorder({ previousIndex: 2, currentIndex: 0 } as CdkDragDrop<unknown>);
        expect(names()).toEqual(['Cid', 'Ann', 'Bob']);
        expect(JSON.parse(localStorage.getItem('ngStorage-players')!)[0].name).toBe('Cid');
    });

    it('should save renamed players', async () => {
        component.addPlayer('Ann');
        await fixture.whenStable();
        const input = fixture.nativeElement.querySelector('.delete-animation input') as HTMLInputElement;
        input.value = 'Anna';
        input.dispatchEvent(new Event('input'));
        expect(names()).toEqual(['Anna']);
        expect(JSON.parse(localStorage.getItem('ngStorage-players')!)[0].name).toBe('Anna');
    });
});
