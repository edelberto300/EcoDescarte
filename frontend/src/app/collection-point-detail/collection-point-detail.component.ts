import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, forkJoin, map, of, switchMap } from 'rxjs';
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
    private readonly router = inject(Router);
    private readonly pointService = inject(CollectionPointService);
    private readonly disposalService = inject(DisposalService);
    private readonly destroyRef = inject(DestroyRef);
    readonly point = signal<CollectionPoint | null>(null);
    readonly disposals = signal<Disposal[]>([]);
    readonly loading = signal(true);
    readonly error = signal('');
    readonly actionError = signal('');
    readonly showDisposalForm = signal(false);
    readonly success = signal('');
    readonly pointDeleteConfirmation = signal(false);
    readonly deletingPoint = signal(false);
    readonly pendingDisposalId = signal<string | null>(null);
    readonly deletingDisposalId = signal<string | null>(null);
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
                this.actionError.set('');
                this.success.set('');
                this.showDisposalForm.set(false);
                this.pointDeleteConfirmation.set(false);
                this.pendingDisposalId.set(null);
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
        this.actionError.set('');
        this.success.set('');
        this.showDisposalForm.set(true);
    }

    onDisposalRegistered(disposal: Disposal): void {
        this.disposals.update((disposals) => [disposal, ...disposals]);
        this.showDisposalForm.set(false);
        this.success.set('Descarte registrado com sucesso.');
    }

    requestPointDeletion(): void {
        this.actionError.set('');
        this.success.set('');
        this.pointDeleteConfirmation.set(true);
    }

    cancelPointDeletion(): void {
        this.pointDeleteConfirmation.set(false);
    }

    deletePoint(): void {
        const currentPoint = this.point();

        if (!currentPoint || this.deletingPoint()) {
            return;
        }

        this.actionError.set('');
        this.deletingPoint.set(true);
        this.pointService.delete(currentPoint.id).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.deletingPoint.set(false))
        ).subscribe({
            next: () => void this.router.navigate(['/']),
            error: (error: unknown) => this.actionError.set(apiErrorMessage(error))
        });
    }

    requestDisposalDeletion(disposalId: string): void {
        this.actionError.set('');
        this.success.set('');
        this.pendingDisposalId.set(disposalId);
    }

    cancelDisposalDeletion(): void {
        this.pendingDisposalId.set(null);
    }

    deleteDisposal(disposal: Disposal): void {
        const currentPoint = this.point();

        if (!currentPoint || this.deletingDisposalId()) {
            return;
        }

        this.actionError.set('');
        this.deletingDisposalId.set(disposal.id);
        this.disposalService.delete(currentPoint.id, disposal.id).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.deletingDisposalId.set(null))
        ).subscribe({
            next: () => {
                this.disposals.update((disposals) => disposals.filter((item) => item.id !== disposal.id));
                this.pendingDisposalId.set(null);
                this.success.set('Descarte excluído com sucesso.');
            },
            error: (error: unknown) => this.actionError.set(apiErrorMessage(error))
        });
    }
}
