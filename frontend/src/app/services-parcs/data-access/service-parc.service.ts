import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../../shared/models/api.models';
import { ServiceParcDetail, ServiceParcListe, ServiceParcStatistiques, TypeServiceParc } from '../models/service-parc.models';

@Injectable({ providedIn: 'root' })
export class ServiceParcService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1/services-parcs';

  rechercher(search: string, type: TypeServiceParc | '', statut: '' | 'actif' | 'inactif', page: number, taille = 10): Observable<PageResponse<ServiceParcListe>> {
    let params = new HttpParams().set('search', search).set('page', page).set('taille', taille);
    if (type) params = params.set('type', type);
    if (statut) params = params.set('actif', statut === 'actif');
    return this.http.get<PageResponse<ServiceParcListe>>(this.api, { params });
  }

  statistiques(): Observable<ServiceParcStatistiques> {
    return this.http.get<ServiceParcStatistiques>(`${this.api}/statistiques`);
  }

  consulter(code: string): Observable<ServiceParcDetail> {
    return this.http.get<ServiceParcDetail>(`${this.api}/${encodeURIComponent(code)}`);
  }

  créer(code: string, libelle: string, type: TypeServiceParc): Observable<ServiceParcDetail> {
    return this.http.post<ServiceParcDetail>(this.api, { code, libelle, type });
  }

  modifier(codeActuel: string, code: string, libelle: string, type: TypeServiceParc): Observable<ServiceParcDetail> {
    return this.http.put<ServiceParcDetail>(`${this.api}/${encodeURIComponent(codeActuel)}`, { code, libelle, type });
  }

  changerStatut(code: string, actif: boolean): Observable<ServiceParcDetail> {
    return this.http.put<ServiceParcDetail>(`${this.api}/${encodeURIComponent(code)}/statut`, { actif });
  }
}
