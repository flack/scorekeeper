import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { StorageService } from '../shared/storage.service';

@Component({
    selector: 'sk-players',
    imports: [FormsModule, CdkDropList, CdkDrag, CdkDragHandle],
    templateUrl: './players.html'
})
export class Players {
    protected readonly storage = inject(StorageService);
    /** Model of the "Add Player" form */
    name = '';

    addPlayer(name: string, form?: NgForm): void {
        if (form?.invalid) {
            return;
        }
        this.storage.players.push({ id: this.nextPlayerId(), name });
        this.storage.save();
        this.name = '';
        form?.resetForm({ name: '' });
    }

    removePlayer(id: string): void {
        const index = this.storage.players.findIndex(existing => existing.id === id);
        if (index !== -1) {
            this.storage.players.splice(index, 1);
            this.storage.save();
        }
    }

    reorder(event: CdkDragDrop<unknown>): void {
        moveItemInArray(this.storage.players, event.previousIndex, event.currentIndex);
        this.storage.save();
    }

    save(): void {
        this.storage.save();
    }

    // Ids must never be reused: score rows are keyed by player id, so a new
    // player must not take the id of a removed one that still has scores in
    // the current game
    private nextPlayerId(): string {
        const ids = [
            ...this.storage.players.map(player => player.id),
            ...this.storage.rows.flatMap(row => Object.keys(row))
        ];
        let highest = -1;
        for (const id of ids) {
            const match = /^player(\d+)$/.exec(id);
            if (match) {
                highest = Math.max(highest, parseInt(match[1], 10));
            }
        }
        return 'player' + (highest + 1);
    }
}
