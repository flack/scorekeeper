import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should provide defaults', () => {
        const storage = TestBed.inject(StorageService);
        expect(storage.players).toEqual([]);
        expect(storage.games).toEqual([]);
        expect(storage.title).toBe('Untitled Game');
        expect(storage.rows).toEqual([]);
        expect(storage.started).toBeNull();
        expect(storage.finished).toBeNull();
    });

    it('should read data stored by the AngularJS version (ngStorage)', () => {
        localStorage.setItem('ngStorage-players', '[{"id":"player0","name":"Ann"}]');
        localStorage.setItem('ngStorage-title', '"Skat"');
        localStorage.setItem('ngStorage-rows', '[{"player0":"3"}]');
        localStorage.setItem('ngStorage-started', '"2026-11-08T12:00:00.000Z"');
        localStorage.setItem('ngStorage-finished', 'null');
        const storage = TestBed.inject(StorageService);
        expect(storage.players).toEqual([{ id: 'player0', name: 'Ann' }]);
        expect(storage.title).toBe('Skat');
        expect(storage.rows).toEqual([{ player0: '3' }]);
        expect(storage.started).toBe('2026-11-08T12:00:00.000Z');
        expect(storage.finished).toBeNull();
        expect(storage.games).toEqual([]);
    });

    it('should save in the ngStorage format', () => {
        const storage = TestBed.inject(StorageService);
        storage.players.push({ id: 'player0', name: 'Ann' });
        storage.started = new Date('2026-11-08T12:00:00.000Z');
        storage.save();
        expect(localStorage.getItem('ngStorage-players')).toBe('[{"id":"player0","name":"Ann"}]');
        expect(localStorage.getItem('ngStorage-started')).toBe('"2026-11-08T12:00:00.000Z"');
        expect(localStorage.getItem('ngStorage-title')).toBe('"Untitled Game"');
    });

    it('should fall back to the default for corrupt data', () => {
        localStorage.setItem('ngStorage-players', '{oops');
        expect(TestBed.inject(StorageService).players).toEqual([]);
    });

    it('should keep working when storage fails', () => {
        const storage = TestBed.inject(StorageService);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => storage.save()).not.toThrow();
        expect(console.error).toHaveBeenCalled();
    });
});
