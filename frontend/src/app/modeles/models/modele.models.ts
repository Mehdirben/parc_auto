import { AuditEvent } from '../../shared/models/api.models';

export interface Modele {
  id: string;
  nom: string;
}

export interface ModeleListe extends Modele {
  marqueCode: string;
  marqueDesignation: string;
  dateCreation: string;
  creePar: string;
}

export interface ModeleDetail extends ModeleListe {
  historique: AuditEvent[];
  dateModification: string | null;
  modifiePar: string | null;
}
