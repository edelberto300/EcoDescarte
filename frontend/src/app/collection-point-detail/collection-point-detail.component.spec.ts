import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import { sampleDisposal, samplePoint } from '../testing/fixtures';
import { CollectionPointDetailComponent } from './collection-point-detail.component';

describe('CollectionPointDetailComponent', () => {
    let fixture: ComponentFixture<CollectionPointDetailComponent>;
    let component: CollectionPointDetailComponent;
    let http: HttpTestingController;
    const pointUrl = `${environment.apiUrl}/collection-points/point-1`;
    const disposalsUrl = `${pointUrl}/disposals`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CollectionPointDetailComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'point-1' })) } }
            ]
        });
        fixture = TestBed.createComponent(CollectionPointDetailComponent);
        component = fixture.componentInstance;
        http = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
        http.expectOne(pointUrl).flush(samplePoint);
        http.expectOne(disposalsUrl).flush([sampleDisposal]);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('requires confirmation before deleting a disposal', () => {
        component.requestDisposalDeletion(sampleDisposal.id);

        expect(component.pendingDisposalId()).toBe(sampleDisposal.id);
        http.expectNone(`${disposalsUrl}/${sampleDisposal.id}`);
    });

    it('deletes a disposal and removes it from the table', () => {
        component.requestDisposalDeletion(sampleDisposal.id);
        component.deleteDisposal(sampleDisposal);
        const request = http.expectOne(`${disposalsUrl}/${sampleDisposal.id}`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);

        expect(component.disposals()).toEqual([]);
        expect(component.success()).toBe('Descarte excluído com sucesso.');
    });

    it('deletes a point and returns to the list', () => {
        const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        component.requestPointDeletion();
        component.deletePoint();
        const request = http.expectOne(pointUrl);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);

        expect(navigate).toHaveBeenCalledWith(['/']);
    });

    it('keeps the disposal and permits retry when deletion fails', () => {
        component.requestDisposalDeletion(sampleDisposal.id);
        component.deleteDisposal(sampleDisposal);
        http.expectOne(`${disposalsUrl}/${sampleDisposal.id}`).flush(
            { message: 'Banco indisponível.' },
            { status: 503, statusText: 'Service Unavailable' }
        );

        expect(component.disposals()).toEqual([sampleDisposal]);
        expect(component.actionError()).toBe('Banco indisponível.');
        expect(component.deletingDisposalId()).toBeNull();
    });
});
