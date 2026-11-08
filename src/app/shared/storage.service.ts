import { Injectable } from '@angular/core';

export const DEFAULT_TITLE = 'Untitled Game';

export interface Player {
    id: string;
    name: string;
}

/** One round of the current game: player id => score as entered */
export type Row = Record<string, string | number | null | undefined>;

/** Dates are Date objects when just created, ISO strings once (re)loaded */
export type Timestamp = Date | string | null;

export interface Game {
    title: string;
    started: Timestamp;
    finished: Timestamp;
    players: Player[];
    totals: Record<string, number>;
}

interface State {
    players: Player[];
    games: Game[];
    title: string;
    rows: Row[];
    started: Timestamp;
    finished: Timestamp;
}

// The AngularJS version kept its data with ngStorage, which saved every key
// as JSON under this prefix. Use the same format, so existing data survives
const PREFIX = 'ngStorage-';

/**
 * The app's persisted state. Components change the properties directly and
 * then call save()
 */
@Injectable({ providedIn: 'root' })
export class StorageService implements State {
    players: Player[] = this.read('players', []);
    games: Game[] = this.read('games', []);
    title: string = this.read('title', DEFAULT_TITLE);
    rows: Row[] = this.read('rows', []);
    started: Timestamp = this.read('started', null);
    finished: Timestamp = this.read('finished', null);

    save(): void {
        const state: State = {
            players: this.players,
            games: this.games,
            title: this.title,
            rows: this.rows,
            started: this.started,
            finished: this.finished
        };
        try {
            for (const [key, value] of Object.entries(state)) {
                localStorage.setItem(PREFIX + key, JSON.stringify(value));
            }
        } catch (error) {
            // Storage can be unavailable or full: keep working in memory
            console.error('Could not save scorekeeper data', error);
        }
    }

    private read<T>(key: keyof State, fallback: T): T {
        try {
            const value = localStorage.getItem(PREFIX + key);
            if (value !== null) {
                return JSON.parse(value) as T;
            }
        } catch {
            // Unavailable storage or corrupt data: fall back to the default
        }
        return fallback;
    }
}
