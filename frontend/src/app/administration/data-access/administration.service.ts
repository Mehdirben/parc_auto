import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../../shared/models/api.models';
import {
  EnregistrerUtilisateurPayload, JournalAudit, UtilisateurKeycloak
} from '../models/administration.models';

@Injectable({ providedIn: 'root' })
export class AdministrationService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1/administration';

  utilisateurs(search: string, page: number): Observable<PageResponse<UtilisateurKeycloak>> {
    const params = new HttpParams().set('search', search).set('page', page).set('taille', 10);
    return this.http.get<PageResponse<UtilisateurKeycloak>>(`${this.api}/utilisateurs`, { params });
  }

  creerUtilisateur(payload: EnregistrerUtilisateurPayload): Observable<UtilisateurKeycloak> {
    return this.http.post<UtilisateurKeycloak>(`${this.api}/utilisateurs`, payload);
  }

  modifierUtilisateur(id: string, payload: EnregistrerUtilisateurPayload):
      Observable<UtilisateurKeycloak> {
    return this.http.put<UtilisateurKeycloak>(
      `${this.api}/utilisateurs/${encodeURIComponent(id)}`, payload);
  }

  profil(): Observable<UtilisateurKeycloak> {
    return this.http.get<UtilisateurKeycloak>('/api/v1/profil');
  }

  modifierProfil(payload: Pick<EnregistrerUtilisateurPayload, 'prenom' | 'nom' | 'email'>):
      Observable<UtilisateurKeycloak> {
    return this.http.put<UtilisateurKeycloak>('/api/v1/profil', payload);
  }

  journal(search: string, action: string, entite: string, page: number):
      Observable<PageResponse<JournalAudit>> {
    const params = new HttpParams()
      .set('search', search).set('action', action).set('entite', entite)
      .set('page', page).set('taille', 15);
    return this.http.get<PageResponse<JournalAudit>>(`${this.api}/journal`, { params });
  }
}
