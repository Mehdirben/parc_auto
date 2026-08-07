import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdreMission } from '../models/ordre-mission.models';

@Injectable({ providedIn: 'root' })
export class OrdreMissionService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1/ordres-mission';

  obtenirPourAffectation(affectationId: string): Observable<OrdreMission> {
    return this.http.post<OrdreMission>(
      `${this.api}/affectations/${affectationId}`, {});
  }

  consulter(id: string): Observable<OrdreMission> {
    return this.http.get<OrdreMission>(`${this.api}/${id}`);
  }

  document(id: string): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/document`, { responseType: 'blob' });
  }
}
