export type TypeServiceParc = 'DIRECTION' | 'PARC_COMMUN';
export type ActionServiceParc = 'CREATION' | 'MODIFICATION' | 'ACTIVATION' | 'DESACTIVATION';

export interface ServiceParcListe {
  code: string;
  libelle: string;
  type: TypeServiceParc;
  actif: boolean;
  dateCreation: string;
  creePar: string;
}

export interface VehiculeRattache {
  immatriculation: string;
  marqueModele: string;
}

export interface ServiceParcEvenement {
  action: ActionServiceParc;
  dateEvenement: string;
  utilisateur: string;
}

export interface ServiceParcDetail extends ServiceParcListe {
  vehicules: VehiculeRattache[];
  historique: ServiceParcEvenement[];
  dateModification: string | null;
  modifiePar: string | null;
}

export interface ServiceParcStatistiques {
  total: number;
  actifs: number;
  directions: number;
  parcsCommuns: number;
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
