export type ActionConducteur = 'CREATION' | 'MODIFICATION' | 'ACTIVATION' | 'DESACTIVATION';

export type FiltrePermis = 'EXPIRE' | 'A_RENOUVELER';

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

export interface AffectationConducteur {
  immatriculation: string;
  marqueModele: string;
  service: string;
  dateDebut: string;
  dateFin: string | null;
}

export interface ConducteurEvenement {
  action: ActionConducteur;
  dateEvenement: string;
  utilisateur: string;
}

export interface ConducteurDetail extends ConducteurListe {
  vehiculesActuels: AffectationConducteur[];
  historiqueAffectations: AffectationConducteur[];
  historique: ConducteurEvenement[];
  dateModification: string | null;
  modifiePar: string | null;
}

export interface ConducteurStatistiques {
  total: number;
  actifs: number;
  inactifs: number;
  permisExpires: number;
  permisExpirantBientot: number;
}

export interface ConducteurPayload {
  matricule: string;
  nomComplet: string;
  telephone: string;
  numeroPermis: string;
  dateValiditePermis: string;
}
