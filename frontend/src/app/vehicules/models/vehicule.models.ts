export type GenreVehicule =
  'VOITURE_TOURISME' | 'FOURGONNETTE_VITREE' | 'FOURGONNETTE' |
  'MINIBUS' | 'UTILITAIRE' | 'CYCLOMOTEUR';
export type Carburant = 'DIESEL' | 'ESSENCE' | 'HYBRIDE' | 'ELECTRIQUE' | 'MELANGE';
export type StatutVehicule =
  'DISPONIBLE' | 'AFFECTE' | 'IMMOBILISE' | 'EN_MAINTENANCE' | 'REFORME' | 'INACTIF';
export type EtatGeneral = 'BON_ETAT' | 'ETAT_MOYEN' | 'MAUVAIS_ETAT';
export type SourceReleve = 'SAISIE_MANUELLE' | 'CONTROLE_PARC' | 'AUTRE';
export type TypePieceJointe =
  'CARTE_GRISE' | 'ASSURANCE' | 'VISITE_TECHNIQUE' | 'VIGNETTE' | 'AUTRE';
export type ActionVehicule =
  'CREATION' | 'MODIFICATION_SITUATION' | 'AJOUT_RELEVE' |
  'AJOUT_PIECE_JOINTE' | 'SUPPRESSION_PIECE_JOINTE';

export interface VehiculeListe {
  code: string;
  immatriculation: string;
  marque: string;
  modele: string;
  genre: GenreVehicule;
  carburant: Carburant;
  kilometrageActuel: number;
  statut: StatutVehicule;
  etatGeneral: EtatGeneral;
}

export interface PieceJointeVehicule {
  id: string;
  typePiece: TypePieceJointe;
  nomFichier: string;
  typeContenu: string;
  taille: number;
  dateCreation: string;
  creePar: string;
}

export interface ReleveKilometrique {
  id: string;
  date: string;
  kilometrage: number;
  source: SourceReleve;
  commentaire: string | null;
  dateCreation: string;
  creePar: string;
}

export interface AffectationVehicule {
  id: string;
  service: string;
  conducteur: string;
  dateDebut: string;
  dateFin: string | null;
  dateFinPrevue: string | null;
  motif: string;
  typeMission: string | null;
  ordreMissionDisponible: boolean;
}

export interface EvenementVehicule {
  action: ActionVehicule;
  dateEvenement: string;
  utilisateur: string;
}

export interface VehiculeDetail extends VehiculeListe {
  ancienneImmatriculation: string | null;
  modeleId: string;
  marqueCode: string;
  vin: string;
  nombreCylindres: number | null;
  puissanceFiscale: number;
  poidsVide: number | null;
  poidsTotalCharge: number | null;
  kilometrageInitial: number;
  datePremiereMiseCirculation: string | null;
  dateMutation: string | null;
  piecesJointes: PieceJointeVehicule[];
  releves: ReleveKilometrique[];
  affectationActuelle: AffectationVehicule | null;
  historiqueAffectations: AffectationVehicule[];
  historique: EvenementVehicule[];
  dateCreation: string;
  creePar: string;
  dateModification: string | null;
  modifiePar: string | null;
}

export interface VehiculeStatistiques {
  total: number;
  disponibles: number;
  affectes: number;
  immobilises: number;
  enMaintenance: number;
  reformes: number;
  inactifs: number;
}

export interface CreerVehiculePayload {
  immatriculation: string;
  ancienneImmatriculation: string;
  modeleId: string;
  genre: GenreVehicule;
  vin: string;
  carburant: Carburant;
  nombreCylindres: number | null;
  puissanceFiscale: number;
  poidsVide: number | null;
  poidsTotalCharge: number | null;
  kilometrageInitial: number;
  datePremiereMiseCirculation: string | null;
  dateMutation: string | null;
  statut: StatutVehicule;
  etatGeneral: EtatGeneral;
}
