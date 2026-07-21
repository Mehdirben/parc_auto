import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarqueDetail, MarqueListe, MarqueStatistiques, Modele, PageResponse } from './marque.models';

@Injectable({ providedIn: 'root' })
export class MarqueService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1';

  statistiques(): Observable<MarqueStatistiques> {
    return this.http.get<MarqueStatistiques>(`${this.api}/marques/statistiques`);
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

  ajouterModèles(code: string, noms: string[]): Observable<MarqueDetail> {
    return this.http.post<MarqueDetail>(`${this.api}/marques/${code}/modeles`, { noms });
  }

  modifierModèle(id: string, nom: string): Observable<Modele> {
    return this.http.put<Modele>(`${this.api}/modeles/${id}`, { nom });
  }

  supprimerModèle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/modeles/${id}`);
  }
}
