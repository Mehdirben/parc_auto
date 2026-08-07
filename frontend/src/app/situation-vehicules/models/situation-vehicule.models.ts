import {
  Carburant, EtatGeneral, GenreVehicule, StatutVehicule
} from '../../vehicules/models/vehicule.models';

export interface SituationVehicule {
  numero: number;
  code: string;
  immatriculation: string;
  marque: string;
  type: string;
  genre: GenreVehicule;
  vin: string;
  carburant: Carburant;
  puissanceFiscale: number | null;
  poidsTotalCharge: number | null;
  dateMiseEnCirculation: string | null;
  affectation: string | null;
  conducteur: string | null;
  kilometrage: number;
  observation: EtatGeneral;
  statut: StatutVehicule;
}

export type ActionImport = 'CREATION' | 'MISE_A_JOUR' | 'IGNOREE';

export interface LigneApercuImport {
  ligne: number;
  immatriculation: string | null;
  marque: string | null;
  type: string | null;
  vin: string | null;
  action: ActionImport;
  message: string;
}

export interface ApercuImport {
  nomFichier: string;
  nombreLignes: number;
  nombreCreations: number;
  nombreMisesAJour: number;
  nombreLignesIgnorees: number;
  lignes: LigneApercuImport[];
}

export interface ResultatImport {
  nomFichier: string;
  nombreCreations: number;
  nombreMisesAJour: number;
  nombreLignesIgnorees: number;
  lignes: LigneApercuImport[];
}

export interface FiltresSituation {
  search: string;
  statut: StatutVehicule | '';
  genre: GenreVehicule | '';
  carburant: Carburant | '';
}
