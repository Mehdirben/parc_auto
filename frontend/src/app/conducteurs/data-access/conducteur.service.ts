import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../../shared/models/api.models';
import {
  ConducteurDetail,
  FiltrePermis,
  ConducteurListe,
  ConducteurPayload,
  ConducteurStatistiques
} from '../models/conducteur.models';

@Injectable({ providedIn: 'root' })
export class ConducteurService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1/conducteurs';

  rechercher(
    search: string, statut: '' | 'actif' | 'inactif',
    permis: FiltrePermis | '', page: number, taille = 10
  ): Observable<PageResponse<ConducteurListe>> {
    let params = new HttpParams().set('search', search).set('page', page).set('taille', taille);
    if (statut) params = params.set('actif', statut === 'actif');
    if (permis) params = params.set('permis', permis);
    return this.http.get<PageResponse<ConducteurListe>>(this.api, { params });
  }

  statistiques(): Observable<ConducteurStatistiques> {
    return this.http.get<ConducteurStatistiques>(`${this.api}/statistiques`);
  }

  consulter(matricule: string): Observable<ConducteurDetail> {
    return this.http.get<ConducteurDetail>(`${this.api}/${encodeURIComponent(matricule)}`);
  }

  créer(payload: ConducteurPayload): Observable<ConducteurDetail> {
    return this.http.post<ConducteurDetail>(this.api, payload);
  }

  modifier(matriculeActuel: string, payload: ConducteurPayload): Observable<ConducteurDetail> {
    return this.http.put<ConducteurDetail>(
      `${this.api}/${encodeURIComponent(matriculeActuel)}`, payload);
  }

  changerStatut(matricule: string, actif: boolean): Observable<ConducteurDetail> {
    return this.http.put<ConducteurDetail>(
      `${this.api}/${encodeURIComponent(matricule)}/statut`, { actif });
  }
}
