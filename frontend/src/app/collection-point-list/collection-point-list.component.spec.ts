import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../environments/environment';
import { samplePoint } from '../testing/fixtures';
import { CollectionPointListComponent } from './collection-point-list.component';

describe('CollectionPointListComponent', () => {
    let http: HttpTestingController;
    const url = `${environment.apiUrl}/collection-points`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CollectionPointListComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
        });
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('renders the empty state after loading', () => {
        const fixture = TestBed.createComponent(CollectionPointListComponent);
        expect(fixture.componentInstance.loading()).toBe(true);
        http.expectOne(url).flush([]);
        fixture.detectChanges();
        expect(fixture.componentInstance.loading()).toBe(false);
        expect(fixture.nativeElement.textContent).toContain('Nenhum ponto de coleta cadastrado');
    });

    it('links each point to its details', () => {
        const fixture = TestBed.createComponent(CollectionPointListComponent);
        http.expectOne(url).flush([samplePoint]);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('article a').getAttribute('href')).toBe('/collection-points/point-1');
    });

    it('shows an API failure instead of an empty list', () => {
        const fixture = TestBed.createComponent(CollectionPointListComponent);
        http.expectOne(url).flush({ message: 'Banco indisponível.' }, { status: 503, statusText: 'Unavailable' });
        fixture.detectChanges();
        expect(fixture.componentInstance.loading()).toBe(false);
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Banco indisponível.');
        expect(fixture.nativeElement.textContent).not.toContain('Nenhum ponto de coleta cadastrado');
    });

    it('releases its request when destroyed', () => {
        const fixture = TestBed.createComponent(CollectionPointListComponent);
        const pending = http.expectOne(url);
        fixture.destroy();
        expect(pending.cancelled).toBe(true);
    });
});
