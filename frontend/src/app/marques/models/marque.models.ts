import { AuditEvent } from '../../shared/models/api.models';
import { Modele } from '../../modeles/models/modele.models';

export interface MarqueListe {
  code: string;
  designation: string;
  nombreModeles: number;
  dateCreation: string;
  creePar: string;
}

export interface MarqueOption {
  code: string;
  designation: string;
}

export interface MarqueDetail {
  code: string;
  designation: string;
  modeles: Modele[];
  historique: AuditEvent[];
  dateCreation: string;
  creePar: string;
  dateModification: string | null;
  modifiePar: string | null;
}

export interface MarqueStatistiques {
  totalMarques: number;
  totalModeles: number;
}
