import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CollectionPoint, CollectionPointInput } from '../models/collection-point.model';

@Injectable({ providedIn: 'root' })
export class CollectionPointService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/collection-points`;

    findAll(): Observable<CollectionPoint[]> {
        return this.http.get<CollectionPoint[]>(this.url);
    }

    findById(id: string): Observable<CollectionPoint> {
        return this.http.get<CollectionPoint>(`${this.url}/${encodeURIComponent(id)}`);
    }

    create(point: CollectionPointInput): Observable<CollectionPoint> {
        return this.http.post<CollectionPoint>(this.url, point);
    }
}
