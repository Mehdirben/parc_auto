import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../../shared/models/api.models';
import {
  Affectation, AffectationDetail, AffectationOptions, AffectationPayload,
  FiltreOrdreMission, StatutAffectation
} from '../models/affectation.models';

@Injectable({ providedIn: 'root' })
export class AffectationService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1/affectations';

  rechercher(search: string, statut: StatutAffectation | '',
             filtreOrdre: FiltreOrdreMission | '', page: number, taille = 10):
      Observable<PageResponse<Affectation>> {
    let params = new HttpParams().set('search', search).set('page', page).set('taille', taille);
    if (statut) params = params.set('statut', statut);
    if (filtreOrdre) params = params.set('filtreOrdre', filtreOrdre);
    return this.http.get<PageResponse<Affectation>>(this.api, { params });
  }

  options(): Observable<AffectationOptions> {
    return this.http.get<AffectationOptions>(`${this.api}/options`);
  }

  consulter(id: string): Observable<AffectationDetail> {
    return this.http.get<AffectationDetail>(`${this.api}/${id}`);
  }

  creer(payload: AffectationPayload): Observable<AffectationDetail> {
    return this.http.post<AffectationDetail>(this.api, payload);
  }

  changer(id: string, payload: Omit<AffectationPayload, 'vehiculeId'>):
      Observable<AffectationDetail> {
    return this.http.post<AffectationDetail>(`${this.api}/${id}/changement`, payload);
  }

  restituer(id: string, dateRestitution: string, motif: string):
      Observable<AffectationDetail> {
    return this.http.post<AffectationDetail>(
      `${this.api}/${id}/restitution`, { dateRestitution, motif });
  }
}
