export type ActionConducteur = 'CREATION' | 'MODIFICATION' | 'ACTIVATION' | 'DESACTIVATION';

export interface ConducteurListe {
  matricule: string;
  nomComplet: string;
  telephone: string | null;
  numeroPermis: string;
  dateValiditePermis: string;
  actif: boolean;
  dateCreation: string;
  creePar: string;
}

export interface ConducteurEvenement {
  action: ActionConducteur;
  dateEvenement: string;
  utilisateur: string;
}

export interface ConducteurDetail extends ConducteurListe {
  historique: ConducteurEvenement[];
  dateModification: string | null;
  modifiePar: string | null;
}

export interface ConducteurStatistiques {
  total: number;
  actifs: number;
  inactifs: number;
}

export interface PageResponse<T> {
  contenu: T[];
  page: number;
  taille: number;
  totalElements: number;
  totalPages: number;
  premiere: boolean;
  derniere: boolean;
}

export interface ApiProblem {
  detail?: string;
  erreurs?: Record<string, string>;
}