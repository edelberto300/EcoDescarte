import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import { sampleDisposal, samplePoint } from '../testing/fixtures';
import { DisposalFormComponent } from './disposal-form.component';

describe('DisposalFormComponent', () => {
    let fixture: ComponentFixture<DisposalFormComponent>;
    let component: DisposalFormComponent;
    let http: HttpTestingController;
    const url = `${environment.apiUrl}/collection-points/point-1/disposals`;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [DisposalFormComponent], providers: [provideHttpClient(), provideHttpClientTesting()] });
        fixture = TestBed.createComponent(DisposalFormComponent);
        fixture.componentRef.setInput('point', samplePoint);
        component = fixture.componentInstance;
        http = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('offers only materials accepted by the point', () => {
        const element: HTMLElement = fixture.nativeElement;
        const labels = Array.from(element.querySelectorAll('#material option')).map((option) => option.textContent?.trim());
        expect(labels).toEqual(['Selecione um material', 'Pilhas e baterias', 'Vidro']);
    });

    it.each([null, 0, -1])('rejects an invalid quantity: %s', (quantity) => {
        component.form.setValue({ materialType: 'BATTERY', quantity, unit: 'UNITS' });
        component.save();
        expect(component.form.controls.quantity.invalid).toBe(true);
        http.expectNone(url);
    });

    it('requires material and unit', () => {
        component.form.controls.quantity.setValue(1);
        component.save();
        expect(component.form.controls.materialType.invalid).toBe(true);
        expect(component.form.controls.unit.invalid).toBe(true);
        http.expectNone(url);
    });

    it('rejects a material not accepted by the point', () => {
        component.form.setValue({ materialType: 'MEDICINE', quantity: 1, unit: 'UNITS' });
        component.save();
        expect(component.error()).toContain('material aceito');
        http.expectNone(url);
    });

    it('allows fractional quantities, assigns no client date and emits the saved disposal once', () => {
        const registered = vi.fn();
        const subscription = component.registered.subscribe(registered);
        component.form.setValue({ materialType: 'GLASS', quantity: 0.25, unit: 'KG' });
        component.save();
        component.save();
        const request = http.expectOne(url);
        expect(request.request.body).toEqual({ materialType: 'GLASS', quantity: 0.25, unit: 'KG' });
        request.flush(sampleDisposal);
        expect(registered).toHaveBeenCalledExactlyOnceWith(sampleDisposal);
        expect(component.saving()).toBe(false);
        subscription.unsubscribe();
    });

    it('shows backend errors and unlocks the form', () => {
        component.form.setValue({ materialType: 'BATTERY', quantity: 10, unit: 'UNITS' });
        component.save();
        http.expectOne(url).flush({ message: 'Material não aceito.' }, { status: 400, statusText: 'Bad Request' });
        expect(component.error()).toBe('Material não aceito.');
        expect(component.saving()).toBe(false);
    });
});
