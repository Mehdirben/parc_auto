import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../../shared/models/api.models';
import {
  Carburant, CreerVehiculePayload, EtatGeneral, GenreVehicule, SourceReleve,
  StatutVehicule, TypePieceJointe, VehiculeDetail, VehiculeListe, VehiculeStatistiques
} from '../models/vehicule.models';

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1/vehicules';

  rechercher(
    search: string, statut: StatutVehicule | '', genre: GenreVehicule | '',
    carburant: Carburant | '', marque: string, page: number, taille = 10
  ): Observable<PageResponse<VehiculeListe>> {
    let params = new HttpParams().set('search', search).set('page', page).set('taille', taille);
    if (statut) params = params.set('statut', statut);
    if (genre) params = params.set('genre', genre);
    if (carburant) params = params.set('carburant', carburant);
    if (marque) params = params.set('marque', marque);
    return this.http.get<PageResponse<VehiculeListe>>(this.api, { params });
  }

  statistiques(): Observable<VehiculeStatistiques> {
    return this.http.get<VehiculeStatistiques>(`${this.api}/statistiques`);
  }

  consulter(code: string): Observable<VehiculeDetail> {
    return this.http.get<VehiculeDetail>(`${this.api}/${encodeURIComponent(code)}`);
  }

  créer(payload: CreerVehiculePayload): Observable<VehiculeDetail> {
    return this.http.post<VehiculeDetail>(this.api, payload);
  }

  modifierSituation(code: string, statut: StatutVehicule, etatGeneral: EtatGeneral): Observable<VehiculeDetail> {
    return this.http.put<VehiculeDetail>(
      `${this.api}/${encodeURIComponent(code)}/situation`, { statut, etatGeneral });
  }

  ajouterReleve(
    code: string, date: string, kilometrage: number,
    source: SourceReleve, commentaire: string
  ): Observable<VehiculeDetail> {
    return this.http.post<VehiculeDetail>(
      `${this.api}/${encodeURIComponent(code)}/releves-kilometriques`,
      { date, kilometrage, source, commentaire });
  }

  ajouterPiece(code: string, typePiece: TypePieceJointe, fichier: File): Observable<VehiculeDetail> {
    const données = new FormData();
    données.append('fichier', fichier);
    const params = new HttpParams().set('typePiece', typePiece);
    return this.http.post<VehiculeDetail>(
      `${this.api}/${encodeURIComponent(code)}/pieces-jointes`, données, { params });
  }

  téléchargerPiece(code: string, pieceId: string): Observable<Blob> {
    return this.http.get(
      `${this.api}/${encodeURIComponent(code)}/pieces-jointes/${pieceId}`,
      { responseType: 'blob' });
  }

  supprimerPiece(code: string, pieceId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/${encodeURIComponent(code)}/pieces-jointes/${pieceId}`);
  }
}
