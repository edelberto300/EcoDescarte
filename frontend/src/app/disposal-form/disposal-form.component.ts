import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CollectionPoint, MATERIAL_LABELS, MaterialType } from '../models/collection-point.model';
import { Disposal, DISPOSAL_UNITS, DisposalUnit, UNIT_LABELS } from '../models/disposal.model';
import { DisposalService } from '../services/disposal.service';
import { apiErrorMessage } from '../shared/api-error';

@Component({
    selector: 'app-disposal-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './disposal-form.component.html'
})
export class DisposalFormComponent {
    private readonly builder = inject(FormBuilder);
    private readonly service = inject(DisposalService);
    private readonly destroyRef = inject(DestroyRef);
    readonly point = input.required<CollectionPoint>();
    readonly registered = output<Disposal>();
    readonly cancelled = output<void>();
    readonly saving = signal(false);
    readonly error = signal('');
    readonly materialLabels = MATERIAL_LABELS;
    readonly unitLabels = UNIT_LABELS;
    readonly units = DISPOSAL_UNITS;
    readonly form = this.builder.group({
        materialType: this.builder.control<MaterialType | null>(null, Validators.required),
        quantity: this.builder.control<number | null>(null, [Validators.required, Validators.min(Number.MIN_VALUE)]),
        unit: this.builder.control<DisposalUnit | null>(null, Validators.required)
    });

    save(): void {

        if (this.saving()) { return; }

        this.form.markAllAsTouched();
        this.error.set('');
        const { materialType, quantity, unit } = this.form.getRawValue();

        if (this.form.invalid || materialType === null || quantity === null || unit === null) { return; }

        if (!this.point().acceptedMaterials.includes(materialType)) {
            this.error.set('Selecione um material aceito por este ponto.');
            return;
        }

        this.saving.set(true);
        this.service.create(this.point().id, { materialType, quantity, unit }).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.saving.set(false))
        ).subscribe({
            next: (disposal) => this.registered.emit(disposal),
            error: (error: unknown) => this.error.set(apiErrorMessage(error))
        });
    }
}
