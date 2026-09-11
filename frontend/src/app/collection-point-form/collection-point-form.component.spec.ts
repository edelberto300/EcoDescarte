import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import { samplePoint } from '../testing/fixtures';
import { CollectionPointFormComponent } from './collection-point-form.component';

describe('CollectionPointFormComponent', () => {
    let fixture: ComponentFixture<CollectionPointFormComponent>;
    let component: CollectionPointFormComponent;
    let http: HttpTestingController;
    const url = `${environment.apiUrl}/collection-points`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CollectionPointFormComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
        });
        fixture = TestBed.createComponent(CollectionPointFormComponent);
        component = fixture.componentInstance;
        http = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('does not submit an empty form', () => {
        component.save();
        expect(component.form.invalid).toBe(true);
        expect(component.submitted()).toBe(true);
        http.expectNone(url);
    });

    it('requires at least one material even when text fields are valid', () => {
        component.form.patchValue({ ...samplePoint, acceptedMaterials: [false, false, false, false, false, false, false] });
        component.save();
        expect(component.form.valid).toBe(true);
        expect(component.hasSelectedMaterial).toBe(false);
        http.expectNone(url);
    });

    it('rejects whitespace-only names', () => {
        component.form.controls.name.setValue('   ');
        expect(component.form.controls.name.invalid).toBe(true);
    });

    it('sends selected material enums and prevents duplicate submissions while saving', () => {
        const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        component.form.patchValue({ ...samplePoint, acceptedMaterials: [true, false, false, true, false, false, false] });
        component.save();
        component.save();
        const request = http.expectOne(url);
        expect(request.request.body.acceptedMaterials).toEqual(['BATTERY', 'GLASS']);
        expect(request.request.body.id).toBeUndefined();
        expect(component.saving()).toBe(true);
        request.flush(samplePoint);
        expect(navigate).toHaveBeenCalledWith(['/collection-points', 'point-1']);
        expect(component.saving()).toBe(false);
    });

    it('keeps form values and allows retry after a server error', () => {
        component.form.patchValue({ ...samplePoint, acceptedMaterials: [true, false, false, false, false, false, false] });
        component.save();
        http.expectOne(url).flush({ message: 'Banco indisponível.' }, { status: 503, statusText: 'Service Unavailable' });
        expect(component.error()).toBe('Banco indisponível.');
        expect(component.saving()).toBe(false);
        expect(component.form.controls.name.value).toBe(samplePoint.name);
    });
});
