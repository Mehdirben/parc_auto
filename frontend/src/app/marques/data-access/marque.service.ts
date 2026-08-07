import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../../shared/models/api.models';
import { MarqueDetail, MarqueListe, MarqueOption, MarqueStatistiques } from '../models/marque.models';

@Injectable({ providedIn: 'root' })
export class MarqueService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1';

  statistiques(): Observable<MarqueStatistiques> {
    return this.http.get<MarqueStatistiques>(`${this.api}/marques/statistiques`);
  }

  listerMarques(): Observable<MarqueOption[]> {
    return this.http.get<MarqueOption[]>(`${this.api}/marques/options`);
  }

  rechercher(search: string, page: number, taille = 10): Observable<PageResponse<MarqueListe>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('taille', taille);
    return this.http.get<PageResponse<MarqueListe>>(`${this.api}/marques`, { params });
  }

  consulter(code: string): Observable<MarqueDetail> {
    return this.http.get<MarqueDetail>(`${this.api}/marques/${code}`);
  }

  créer(designation: string, modeles: string[]): Observable<MarqueDetail> {
    return this.http.post<MarqueDetail>(`${this.api}/marques`, { designation, modeles });
  }

  modifier(code: string, designation: string): Observable<MarqueDetail> {
    return this.http.put<MarqueDetail>(`${this.api}/marques/${code}`, { designation });
  }

  supprimer(code: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/marques/${code}`);
  }

}
