import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, forkJoin, map, of, switchMap } from 'rxjs';
import { CollectionPoint, MATERIAL_LABELS } from '../models/collection-point.model';
import { Disposal, UNIT_LABELS } from '../models/disposal.model';
import { CollectionPointService } from '../services/collection-point.service';
import { DisposalService } from '../services/disposal.service';
import { DisposalFormComponent } from '../disposal-form/disposal-form.component';
import { apiErrorMessage } from '../shared/api-error';

@Component({
    selector: 'app-collection-point-detail',
    standalone: true,
    imports: [RouterLink, DatePipe, DecimalPipe, DisposalFormComponent],
    templateUrl: './collection-point-detail.component.html'
})
export class CollectionPointDetailComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly pointService = inject(CollectionPointService);
    private readonly disposalService = inject(DisposalService);
    private readonly destroyRef = inject(DestroyRef);
    readonly point = signal<CollectionPoint | null>(null);
    readonly disposals = signal<Disposal[]>([]);
    readonly loading = signal(true);
    readonly error = signal('');
    readonly showDisposalForm = signal(false);
    readonly success = signal('');
    readonly materialLabels = MATERIAL_LABELS;
    readonly unitLabels = UNIT_LABELS;

    constructor() {
        this.route.paramMap.pipe(
            map((params) => params.get('id') ?? ''),
            distinctUntilChanged(),
            switchMap((id) => {
                this.point.set(null);
                this.disposals.set([]);
                this.error.set('');
                this.success.set('');
                this.showDisposalForm.set(false);
                this.loading.set(true);
                return forkJoin({
                    point: this.pointService.findById(id),
                    disposals: this.disposalService.findByCollectionPointId(id)
                }).pipe(catchError((error: unknown) => {
                    this.error.set(apiErrorMessage(error));
                    return of(null);
                }));
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((result) => {
            this.loading.set(false);

            if (result) {
                this.point.set(result.point);
                this.disposals.set(result.disposals);
            }
        });
    }

    openDisposalForm(): void {
        this.success.set('');
        this.showDisposalForm.set(true);
    }

    onDisposalRegistered(disposal: Disposal): void {
        this.disposals.update((disposals) => [disposal, ...disposals]);
        this.showDisposalForm.set(false);
        this.success.set('Descarte registrado com sucesso.');
    }
}
