import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, of, skip, switchMap, takeUntil } from 'rxjs';
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
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);
    private readonly requiredText = [Validators.required, Validators.pattern(/\S/)];
    readonly pointId = signal<string | null>(null);
    readonly loading = signal(false);
    readonly ready = signal(false);
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

    constructor() {
        this.route.paramMap.pipe(
            map((params) => params.get('id')),
            distinctUntilChanged(),
            switchMap((id) => {
                this.pointId.set(id);
                this.form.reset();
                this.submitted.set(false);
                this.error.set('');
                this.ready.set(false);
                this.loading.set(!!id);

                if (!id) { return of(null); }

                return this.service.findById(id).pipe(catchError((error: unknown) => {
                    this.error.set(apiErrorMessage(error));
                    return of(null);
                }));
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((point) => {
            this.loading.set(false);
            this.ready.set(!this.pointId() || !!point);

            if (point) {
                this.form.patchValue({
                    ...point,
                    description: point.description ?? '',
                    acceptedMaterials: this.materialTypes.map((material) => point.acceptedMaterials.includes(material))
                });
            }
        });
    }

    get hasSelectedMaterial(): boolean {
        return this.form.controls.acceptedMaterials.getRawValue().some(Boolean);
    }

    save(): void {

        if (this.saving() || !this.ready()) { return; }

        this.submitted.set(true);
        this.error.set('');
        this.form.markAllAsTouched();

        if (this.form.invalid || !this.hasSelectedMaterial) { return; }

        const value = this.form.getRawValue();
        const acceptedMaterials = this.materialTypes.filter((material, index) => value.acceptedMaterials[index]);
        const input = { ...value, acceptedMaterials };
        const id = this.pointId();
        const request = id ? this.service.update(id, input) : this.service.create(input);
        this.saving.set(true);
        request.pipe(
            takeUntil(this.route.paramMap.pipe(skip(1))),
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.saving.set(false))
        ).subscribe({
            next: (point) => { void this.router.navigate(['/collection-points', point.id]); },
            error: (error: unknown) => this.error.set(apiErrorMessage(error))
        });
    }
}
