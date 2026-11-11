import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { CalendarPipe } from '../shared/date.pipes';
import { Game, StorageService } from '../shared/storage.service';

@Component({
    selector: 'sk-games',
    imports: [CalendarPipe],
    templateUrl: './games.html'
})
export class Games {
    protected readonly storage = inject(StorageService);
    /** The game the delete confirmation is shown for */
    selected: Game | null = null;

    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('confirmDelete');

    open(game: Game): void {
        this.selected = game;
        this.dialog().nativeElement.showModal();
    }

    confirm(): void {
        const index = this.selected ? this.storage.games.indexOf(this.selected) : -1;
        if (index !== -1) {
            this.storage.games.splice(index, 1);
            this.storage.save();
        }
        this.dialog().nativeElement.close();
    }

    cancel(): void {
        this.dialog().nativeElement.close();
    }

    /** Whether the player has the highest total of the game (ties highlight every winner) */
    protected isWinner(game: Game, playerId: string): boolean {
        return game.totals[playerId] === Math.max(...Object.values(game.totals));
    }

    /** Clicks on the dialog element itself (not its content) hit the backdrop */
    protected backdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.cancel();
        }
    }
}
