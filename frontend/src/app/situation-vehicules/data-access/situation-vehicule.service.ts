import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../../shared/models/api.models';
import {
  ApercuImport, FiltresSituation, ResultatImport, SituationVehicule
} from '../models/situation-vehicule.models';

@Injectable({ providedIn: 'root' })
export class SituationVehiculeService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1/situation-vehicules';

  rechercher(
    filtres: FiltresSituation, page: number, taille = 25
  ): Observable<PageResponse<SituationVehicule>> {
    return this.http.get<PageResponse<SituationVehicule>>(
      this.api, { params: this.params(filtres).set('page', page).set('taille', taille) });
  }

  exporter(filtres: FiltresSituation): Observable<Blob> {
    return this.http.get(`${this.api}/export`, {
      params: this.params(filtres),
      responseType: 'blob'
    });
  }

  téléchargerModèleImport(): Observable<Blob> {
    return this.http.get(`${this.api}/import/modele`, { responseType: 'blob' });
  }

  prévisualiser(fichier: File): Observable<ApercuImport> {
    return this.http.post<ApercuImport>(
      `${this.api}/import/apercu`, this.formData(fichier));
  }

  importer(fichier: File): Observable<ResultatImport> {
    return this.http.post<ResultatImport>(
      `${this.api}/import`, this.formData(fichier));
  }

  private params(filtres: FiltresSituation): HttpParams {
    let params = new HttpParams().set('search', filtres.search);
    if (filtres.statut) params = params.set('statut', filtres.statut);
    if (filtres.genre) params = params.set('genre', filtres.genre);
    if (filtres.carburant) params = params.set('carburant', filtres.carburant);
    return params;
  }

  private formData(fichier: File): FormData {
    const données = new FormData();
    données.append('fichier', fichier);
    return données;
  }
}
