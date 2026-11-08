import { Routes } from '@angular/router';
import { Games } from './games/games';
import { Home } from './home/home';
import { Players } from './players/players';
import { Scores } from './scores/scores';

export const routes: Routes = [
    { path: 'home', component: Home },
    { path: 'players', component: Players, title: 'Manage Players' },
    { path: 'scores', component: Scores, title: 'Scores' },
    { path: 'games', component: Games, title: 'Games' },
    { path: '**', redirectTo: 'home' }
];
