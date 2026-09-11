import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CollectionPoint, MATERIAL_LABELS } from '../models/collection-point.model';
import { CollectionPointService } from '../services/collection-point.service';
import { apiErrorMessage } from '../shared/api-error';

@Component({
    selector: 'app-collection-point-list',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './collection-point-list.component.html'
})
export class CollectionPointListComponent {
    private readonly service = inject(CollectionPointService);
    private readonly destroyRef = inject(DestroyRef);
    readonly points = signal<CollectionPoint[]>([]);
    readonly loading = signal(true);
    readonly error = signal('');
    readonly materialLabels = MATERIAL_LABELS;

    constructor() {
        this.service.findAll().pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (points) => this.points.set(points),
            error: (error: unknown) => this.error.set(apiErrorMessage(error))
        });
    }
}
