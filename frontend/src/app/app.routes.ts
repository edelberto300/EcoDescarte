import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        title: 'Pontos de coleta | EcoDescarte',
        loadComponent: () => import('./collection-point-list/collection-point-list.component')
            .then((module) => module.CollectionPointListComponent)
    },
    {
        path: 'collection-points/new',
        title: 'Cadastrar ponto | EcoDescarte',
        loadComponent: () => import('./collection-point-form/collection-point-form.component')
            .then((module) => module.CollectionPointFormComponent)
    },
    {
        path: 'collection-points/:id',
        title: 'Detalhes do ponto | EcoDescarte',
        loadComponent: () => import('./collection-point-detail/collection-point-detail.component')
            .then((module) => module.CollectionPointDetailComponent)
    },
    { path: '**', redirectTo: '' }
];
