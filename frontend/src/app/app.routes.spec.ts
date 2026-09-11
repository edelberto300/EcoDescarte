import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { CollectionPointDetailComponent } from './collection-point-detail/collection-point-detail.component';
import { CollectionPointFormComponent } from './collection-point-form/collection-point-form.component';
import { DisposalFormComponent } from './disposal-form/disposal-form.component';
import { sampleDisposal, samplePoint } from './testing/fixtures';

describe('Routes and HTTP integration', () => {
    let http: HttpTestingController;
    const url = `${environment.apiUrl}/collection-points`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
        });
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('loads the home list and the new point route', async () => {
        const harness = await RouterTestingHarness.create('/');
        http.expectOne(url).flush([samplePoint]);
        harness.detectChanges();
        expect(harness.routeNativeElement?.textContent).toContain('Eco Ponto Central');
        expect(harness.routeNativeElement?.textContent).toContain('Pilhas e baterias');

        await harness.navigateByUrl('/collection-points/new', CollectionPointFormComponent);
        expect(harness.routeNativeElement?.querySelectorAll('input[type="checkbox"]').length).toBe(7);
    });

    it('loads details and adds a saved disposal to the visible list', async () => {
        const harness = await RouterTestingHarness.create();
        const detail = await harness.navigateByUrl('/collection-points/point-1', CollectionPointDetailComponent);
        http.expectOne(`${url}/point-1`).flush(samplePoint);
        http.expectOne(`${url}/point-1/disposals`).flush([]);
        harness.detectChanges();
        expect(harness.routeNativeElement?.textContent).toContain('Nenhum descarte registrado');

        detail.openDisposalForm();
        harness.detectChanges();
        const form = harness.routeDebugElement?.query(By.directive(DisposalFormComponent)).componentInstance as DisposalFormComponent;
        form.form.setValue({ materialType: 'BATTERY', quantity: 10, unit: 'UNITS' });
        form.save();
        http.expectOne(`${url}/point-1/disposals`).flush(sampleDisposal);
        harness.detectChanges();
        expect(harness.routeNativeElement?.textContent).toContain('Descarte registrado com sucesso.');
        expect(harness.routeNativeElement?.querySelector('tbody')?.textContent).toContain('11/09/2026 10:00');
        expect(detail.disposals()).toEqual([sampleDisposal]);
        expect(detail.showDisposalForm()).toBe(false);
    });

    it('cancels obsolete requests when navigating between points', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/collection-points/point-1', CollectionPointDetailComponent);
        const oldPoint = http.expectOne(`${url}/point-1`);
        const oldDisposals = http.expectOne(`${url}/point-1/disposals`);

        const detail = await harness.navigateByUrl('/collection-points/point-2', CollectionPointDetailComponent);
        expect(oldPoint.cancelled).toBe(true);
        expect(oldDisposals.cancelled).toBe(true);
        http.expectOne(`${url}/point-2`).flush({ ...samplePoint, id: 'point-2', name: 'Segundo ponto' });
        http.expectOne(`${url}/point-2/disposals`).flush([]);
        harness.detectChanges();
        expect(detail.point()?.id).toBe('point-2');
        expect(harness.routeNativeElement?.textContent).toContain('Segundo ponto');
        expect(harness.routeNativeElement?.textContent).not.toContain('Eco Ponto Central');
    });

    it('shows a missing-point error and cancels its pending disposal request', async () => {
        const harness = await RouterTestingHarness.create();
        const detail = await harness.navigateByUrl('/collection-points/missing', CollectionPointDetailComponent);
        const pending = http.expectOne(`${url}/missing/disposals`);
        http.expectOne(`${url}/missing`).flush({ message: 'Ponto de coleta não encontrado.' }, { status: 404, statusText: 'Not Found' });
        harness.detectChanges();
        expect(pending.cancelled).toBe(true);
        expect(detail.loading()).toBe(false);
        expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain('Ponto de coleta não encontrado.');
    });
});
