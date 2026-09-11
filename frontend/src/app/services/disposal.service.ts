import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Disposal, DisposalInput } from '../models/disposal.model';

@Injectable({ providedIn: 'root' })
export class DisposalService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/collection-points`;

    create(collectionPointId: string, disposal: DisposalInput): Observable<Disposal> {
        return this.http.post<Disposal>(`${this.url}/${encodeURIComponent(collectionPointId)}/disposals`, disposal);
    }

    findByCollectionPointId(collectionPointId: string): Observable<Disposal[]> {
        return this.http.get<Disposal[]>(`${this.url}/${encodeURIComponent(collectionPointId)}/disposals`);
    }

    delete(collectionPointId: string, disposalId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.url}/${encodeURIComponent(collectionPointId)}/disposals/${encodeURIComponent(disposalId)}`
        );
    }
}
