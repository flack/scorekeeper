import { TestBed } from '@angular/core/testing';
import { CalendarPipe, TimeAgoPipe } from './date.pipes';
import { PlayerNamePipe, PlayerNamesPipe } from './player-name.pipes';
import { StorageService } from './storage.service';

describe('pipes', () => {
    beforeEach(() => {
        localStorage.clear();
        TestBed.inject(StorageService).players = [
            { id: 'player0', name: 'Ann' },
            { id: 'player1', name: 'Bob' },
            { id: 'player2', name: 'Cid' }
        ];
    });

    it('playerName should resolve a player id to its name', () => {
        const pipe = TestBed.runInInjectionContext(() => new PlayerNamePipe());
        expect(pipe.transform('player1')).toBe('Bob');
        expect(pipe.transform('player9')).toBe('player9 not found');
    });

    it('playerNames should join the names of the given player ids in player order', () => {
        const pipe = TestBed.runInInjectionContext(() => new PlayerNamesPipe());
        expect(pipe.transform(['player2', 'player0'])).toBe('Ann, Cid');
        expect(pipe.transform([])).toBe('');
    });

    it('timeAgo should describe how long ago a time was', () => {
        const pipe = new TimeAgoPipe();
        expect(pipe.transform(new Date(Date.now() - 2 * 3600 * 1000))).toBe('2 hours ago');
        expect(pipe.transform(new Date(Date.now() - 3600 * 1000).toISOString())).toBe('an hour ago');
        expect(pipe.transform(null)).toBe('');
    });

    it('calendar should format a time relative to today', () => {
        const pipe = new CalendarPipe();
        const today = new Date();
        today.setHours(14, 30, 0, 0);
        expect(pipe.transform(today)).toBe('Today at 2:30 PM');
        expect(pipe.transform('2020-03-01T12:00:00')).toBe('03/01/2020');
        expect(pipe.transform(undefined)).toBe('');
    });
});
