import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Address, MATERIAL_LABELS, MATERIAL_TYPES } from '../models/collection-point.model';
import { CollectionPointService } from '../services/collection-point.service';
import { apiErrorMessage } from '../shared/api-error';

@Component({
    selector: 'app-collection-point-form',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './collection-point-form.component.html'
})
export class CollectionPointFormComponent {
    private readonly builder = inject(FormBuilder).nonNullable;
    private readonly service = inject(CollectionPointService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly requiredText = [Validators.required, Validators.pattern(/\S/)];
    readonly saving = signal(false);
    readonly submitted = signal(false);
    readonly error = signal('');
    readonly materialTypes = MATERIAL_TYPES;
    readonly materialLabels = MATERIAL_LABELS;
    readonly addressFields: { key: keyof Address; label: string; placeholder: string; autocomplete: string }[] = [
        { key: 'street', label: 'Rua', placeholder: 'Avenida Brasil', autocomplete: 'address-line1' },
        { key: 'number', label: 'Número', placeholder: '1000 ou S/N', autocomplete: 'off' },
        { key: 'neighborhood', label: 'Bairro', placeholder: 'Centro', autocomplete: 'off' },
        { key: 'city', label: 'Cidade', placeholder: 'Maringá', autocomplete: 'address-level2' },
        { key: 'state', label: 'Estado', placeholder: 'PR', autocomplete: 'address-level1' },
        { key: 'zipCode', label: 'CEP', placeholder: '87000-000', autocomplete: 'postal-code' }
    ];
    readonly form = this.builder.group({
        name: ['', this.requiredText],
        description: [''],
        address: this.builder.group({
            street: ['', this.requiredText],
            number: ['', this.requiredText],
            neighborhood: ['', this.requiredText],
            city: ['', this.requiredText],
            state: ['', this.requiredText],
            zipCode: ['', this.requiredText]
        }),
        openingHours: ['', this.requiredText],
        acceptedMaterials: this.builder.array(this.materialTypes.map(() => this.builder.control(false)))
    });

    get hasSelectedMaterial(): boolean {
        return this.form.controls.acceptedMaterials.getRawValue().some(Boolean);
    }

    save(): void {

        if (this.saving()) { return; }

        this.submitted.set(true);
        this.error.set('');
        this.form.markAllAsTouched();

        if (this.form.invalid || !this.hasSelectedMaterial) { return; }

        const value = this.form.getRawValue();
        const acceptedMaterials = this.materialTypes.filter((material, index) => value.acceptedMaterials[index]);
        this.saving.set(true);
        this.service.create({ ...value, acceptedMaterials }).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.saving.set(false))
        ).subscribe({
            next: (point) => { void this.router.navigate(['/collection-points', point.id]); },
            error: (error: unknown) => this.error.set(apiErrorMessage(error))
        });
    }
}
