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

export interface AuditEvent {
  action: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION';
  dateEvenement: string;
  utilisateur: string;
}
