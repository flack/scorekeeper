import { Pipe, PipeTransform, inject } from '@angular/core';
import { StorageService } from './storage.service';

/** Resolves a player id to the player's name */
@Pipe({ name: 'playerName', pure: false })
export class PlayerNamePipe implements PipeTransform {
    private readonly storage = inject(StorageService);

    transform(id: string): string {
        const player = this.storage.players.find(candidate => candidate.id === id);
        return player ? player.name : id + ' not found';
    }
}

/** Resolves a list of player ids to a comma-separated list of names, in player order */
@Pipe({ name: 'playerNames', pure: false })
export class PlayerNamesPipe implements PipeTransform {
    private readonly storage = inject(StorageService);

    transform(ids: string[]): string {
        return this.storage.players
            .filter(player => ids.includes(player.id))
            .map(player => player.name)
            .join(', ');
    }
}
