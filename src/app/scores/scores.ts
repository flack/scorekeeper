import { Component, DestroyRef, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TimeAgoPipe } from '../shared/date.pipes';
import { PlayerNamePipe, PlayerNamesPipe } from '../shared/player-name.pipes';
import { DEFAULT_TITLE, Game, Row, StorageService } from '../shared/storage.service';
import { EditableTitle } from './editable-title.directive';

// Accepts numbers and numeric strings (with ',' or '.' as decimal
// separator); anything else, including empty input, counts as 0
export function parseScore(score: Row[string]): number {
    const value = Number(String(score).trim().replace(',', '.'));
    return Number.isFinite(value) ? value : 0;
}

function isRowEmpty(row: Row): boolean {
    return Object.values(row).every(value => parseScore(value) === 0);
}

@Component({
    selector: 'sk-scores',
    imports: [FormsModule, RouterLink, EditableTitle, TimeAgoPipe, PlayerNamePipe, PlayerNamesPipe],
    templateUrl: './scores.html'
})
export class Scores {
    protected readonly storage = inject(StorageService);
    readonly defaultTitle = DEFAULT_TITLE;
    totals: Record<string, number> = {};
    winners: string[] = [];
    running = false;
    /** Ticks every 30s to refresh the "started ... ago" text */
    protected readonly now = signal(Date.now());

    private readonly element: HTMLElement = inject(ElementRef).nativeElement;
    private readonly injector = inject(Injector);

    constructor() {
        if (this.storage.rows.length > 0) {
            for (const player of this.storage.players) {
                this.updateTotals(player.id);
            }
        }
        if (this.storage.started && !this.storage.finished) {
            this.running = true;
        }

        const timer = setInterval(() => this.now.set(Date.now()), 30000);
        inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }

    start(): void {
        this.resetTotals();
        this.storage.rows = [];
        this.storage.finished = null;
        this.storage.started = new Date();
        this.winners = [];
        this.running = true;
        this.newRow();
    }

    resume(): void {
        this.storage.games.shift();
        this.storage.finished = null;
        this.winners = [];
        this.running = true;
        this.newRow();
    }

    abort(): void {
        this.resetTotals();
        this.storage.started = null;
        this.storage.finished = null;
        this.storage.rows = [];
        this.running = false;
        this.storage.save();
    }

    finish(): void {
        const { storage } = this;
        storage.finished = new Date();
        this.running = false;
        const game: Game = structuredClone({
            title: storage.title,
            started: storage.started,
            finished: storage.finished,
            players: storage.players,
            totals: this.totals
        });
        storage.games.unshift(game);

        while (storage.rows.length > 0 && isRowEmpty(storage.rows[storage.rows.length - 1])) {
            storage.rows.pop();
        }
        storage.save();

        this.renderResult();
    }

    newRow(): void {
        const row: Row = {};
        for (const player of this.storage.players) {
            row[player.id] = '';
        }
        this.storage.rows.push(row);
        this.storage.save();
        this.focusNewRow();
    }

    updateTotals(playerId: string): void {
        this.totals[playerId] = this.storage.rows.reduce((total, row) => total + parseScore(row[playerId]), 0);
    }

    scoreChanged(playerId: string): void {
        this.updateTotals(playerId);
        this.storage.save();
    }

    titleChanged(): void {
        this.storage.save();
    }

    isMax(score: Row[string], row: Row): boolean {
        if (isRowEmpty(row)) {
            return false;
        }
        return !Object.values(row).some(value => parseScore(value) > parseScore(score));
    }

    isWinner(playerId: string): boolean {
        return this.winners.includes(playerId);
    }

    protected select(event: Event): void {
        (event.target as HTMLInputElement).select();
    }

    private focusNewRow(): void {
        afterNextRender(() => {
            this.element.querySelector<HTMLInputElement>('tbody tr:last-child input')?.focus();
        }, { injector: this.injector });
    }

    private resetTotals(): void {
        for (const player of this.storage.players) {
            this.totals[player.id] = 0;
        }
    }

    private renderResult(): void {
        let highscore = -Infinity;
        let winners: string[] = [];
        for (const { id } of this.storage.players) {
            if (this.totals[id] > highscore) {
                highscore = this.totals[id];
                winners = [id];
            } else if (this.totals[id] === highscore) {
                winners.push(id);
            }
        }
        this.winners = winners;
    }
}
