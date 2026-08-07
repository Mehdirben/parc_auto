import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MarqueDetail } from '../../marques/models/marque.models';
import { PageResponse } from '../../shared/models/api.models';
import { Modele, ModeleDetail, ModeleListe } from '../models/modele.models';

@Injectable({ providedIn: 'root' })
export class ModeleService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1';

  rechercher(search: string, page: number, taille = 10): Observable<PageResponse<ModeleListe>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('taille', taille);
    return this.http.get<PageResponse<ModeleListe>>(`${this.api}/modeles`, { params });
  }

  consulter(id: string): Observable<ModeleDetail> {
    return this.http.get<ModeleDetail>(`${this.api}/modeles/${id}`);
  }

  ajouter(marqueCode: string, noms: string[]): Observable<MarqueDetail> {
    return this.http.post<MarqueDetail>(
      `${this.api}/marques/${marqueCode}/modeles`,
      { noms }
    );
  }

  modifier(id: string, nom: string): Observable<Modele> {
    return this.http.put<Modele>(`${this.api}/modeles/${id}`, { nom });
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/modeles/${id}`);
  }
}
