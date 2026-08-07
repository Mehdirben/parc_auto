export type StatutAffectation = 'ACTIVE' | 'TERMINEE';
export type FiltreOrdreMission = 'ELIGIBLE' | 'GENERE' | 'A_GENERER';

export interface Affectation {
  id: string;
  vehiculeId: string;
  vehiculeCode: string;
  immatriculation: string;
  marqueModele: string;
  serviceParcId: string;
  serviceParcCode: string;
  serviceParcLibelle: string;
  conducteurId: string;
  conducteurMatricule: string;
  conducteurNom: string;
  dateDebut: string;
  dateFin: string | null;
  dateFinPrevue: string | null;
  motif: string;
  typeMission: string | null;
  ordreMissionDisponible: boolean;
  statut: StatutAffectation;
  dateCreation: string;
  creePar: string;
}

export interface VehiculeOption {
  id: string;
  code: string;
  immatriculation: string;
  marqueModele: string;
}

export interface ServiceParcOption {
  id: string;
  code: string;
  libelle: string;
  parcMission: boolean;
}

export interface ConducteurOption {
  id: string;
  matricule: string;
  nomComplet: string;
}

export interface AffectationOptions {
  vehicules: VehiculeOption[];
  servicesParcs: ServiceParcOption[];
  conducteurs: ConducteurOption[];
}

export interface AffectationPayload {
  vehiculeId: string;
  serviceParcId: string;
  conducteurId: string;
  dateDebut: string;
  motif: string;
  dateFinPrevue: string | null;
  typeMission: string | null;
}

export interface EvenementAffectation {
  action: string;
  dateEvenement: string;
  utilisateur: string;
  anciennesValeurs: string | null;
  nouvellesValeurs: string | null;
}

export interface AffectationDetail {
  affectation: Affectation;
  historiqueVehicule: Affectation[];
  journal: EvenementAffectation[];
}
