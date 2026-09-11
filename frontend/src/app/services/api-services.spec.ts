import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../shared/api-error';
import { sampleDisposal, samplePoint } from '../testing/fixtures';
import { CollectionPointService } from './collection-point.service';
import { DisposalService } from './disposal.service';

describe('API services', () => {
    let http: HttpTestingController;
    let points: CollectionPointService;
    let disposals: DisposalService;
    const url = `${environment.apiUrl}/collection-points`;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        http = TestBed.inject(HttpTestingController);
        points = TestBed.inject(CollectionPointService);
        disposals = TestBed.inject(DisposalService);
    });

    afterEach(() => http.verify());

    it('lists collection points', () => {
        points.findAll().subscribe((response) => expect(response).toEqual([samplePoint]));
        const request = http.expectOne(url);
        expect(request.request.method).toBe('GET');
        request.flush([samplePoint]);
    });

    it('encodes the point id when loading details', () => {
        points.findById('point/1').subscribe((response) => expect(response).toEqual(samplePoint));
        http.expectOne(`${url}/point%2F1`).flush(samplePoint);
    });

    it('posts collection point fields', () => {
        const { id, ...input } = samplePoint;
        points.create(input).subscribe((response) => expect(response.id).toBe(id));
        const request = http.expectOne(url);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(input);
        request.flush(samplePoint);
    });

    it('deletes the requested collection point', () => {
        points.delete('point/1').subscribe((response) => expect(response).toBeNull());
        const request = http.expectOne(`${url}/point%2F1`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('posts a disposal to its collection point', () => {
        const input = { materialType: sampleDisposal.materialType, quantity: 10, unit: sampleDisposal.unit };
        disposals.create('point-1', input).subscribe((response) => expect(response).toEqual(sampleDisposal));
        const request = http.expectOne(`${url}/point-1/disposals`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(input);
        request.flush(sampleDisposal);
    });

    it('lists disposals for the requested point', () => {
        disposals.findByCollectionPointId('point-1').subscribe((response) => expect(response).toEqual([sampleDisposal]));
        http.expectOne(`${url}/point-1/disposals`).flush([sampleDisposal]);
    });

    it('deletes a disposal from the requested point', () => {
        disposals.delete('point/1', 'disposal/1').subscribe((response) => expect(response).toBeNull());
        const request = http.expectOne(`${url}/point%2F1/disposals/disposal%2F1`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('preserves business errors for the interface', () => {
        disposals.create('point-1', sampleDisposal).subscribe({
            next: () => { throw new Error('A requisição deveria falhar.'); },
            error: (error: unknown) => expect(apiErrorMessage(error)).toBe('Material não aceito.')
        });
        http.expectOne(`${url}/point-1/disposals`).flush({ message: 'Material não aceito.' }, { status: 400, statusText: 'Bad Request' });
    });

    it('shows validation details returned by the backend', () => {
        const error = new HttpErrorResponse({ status: 400, error: { message: 'Verifique os campos.', errors: { name: 'Informe o nome.' } } });
        expect(apiErrorMessage(error)).toBe('Verifique os campos. Informe o nome.');
    });

    it('shows a connection message on a network failure', () => {
        expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('conectar ao servidor');
    });
});
