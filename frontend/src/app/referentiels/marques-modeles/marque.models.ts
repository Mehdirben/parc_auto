export interface Modele {
  id: string;
  nom: string;
}

export interface MarqueListe {
  code: string;
  designation: string;
  nombreModeles: number;
  dateCreation: string;
  creePar: string;
}

export interface MarqueDetail {
  code: string;
  designation: string;
  modeles: Modele[];
  dateCreation: string;
  creePar: string;
  dateModification: string | null;
  modifiePar: string | null;
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
  title?: string;
  detail?: string;
  erreurs?: Record<string, string>;
}

export interface MarqueStatistiques {
  totalMarques: number;
  totalModeles: number;
}

